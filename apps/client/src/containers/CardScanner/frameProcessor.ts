// Threshold for determining if a cell is stamped (lower intensity = darker = stamped)
import {
  extractGridCellsFromMat,
  GridData,
  ExtractionContext,
} from './extractGridCells';
import {
  generateGridTemplate,
  detectGridMultiScale,
  extractCellPositions,
} from './gridTemplateMatching';
import {
  resize,
  grayscale,
  scale,
  blur,
  closeLines,
  canny,
  detectCorners,
  detectContours,
} from './steps';
import { PipelineDebugger } from './pipelineDebugger';
import { filterLinesByWidth } from './steps/filterLinesByWidth';

export type { GridData, ExtractionContext };
export type { PipelineContext };

/**
 * Tracks information about a transformation applied to the image
 * Allows later steps to understand what operations preceded them
 */
export interface PipelineTransformation {
  // The step that performed this transformation
  stepName: string;
  // Input and output dimensions
  inputWidth: number;
  inputHeight: number;
  outputWidth: number;
  outputHeight: number;
  // Type of transformation (for easier identification)
  type: 'resize' | 'scale' | 'perspective' | 'other';
  // Optional: transformation matrix (e.g., perspective transform)
  matrix?: any;
  // Optional: metadata about the transformation
  metadata?: Record<string, any>;
}

interface GridStructure {
  rows: number;
  cols: number;
}

/**
 * Detect the grid structure (rows and columns) from a warped card image
 * Uses edge detection and projection analysis to identify grid lines
 * @param warpedMat - The warped OpenCV Mat containing the rectified card
 * @returns GridStructure with detected rows and cols, or null if detection fails
 */
export function detectGridStructure(warpedMat: any): GridStructure | null {
  try {
    // Convert to grayscale if needed
    let gray = new cv.Mat();
    if (warpedMat.channels() === 4) {
      cv.cvtColor(warpedMat, gray, cv.COLOR_RGBA2GRAY);
    } else if (warpedMat.channels() === 3) {
      cv.cvtColor(warpedMat, gray, cv.COLOR_RGB2GRAY);
    } else {
      warpedMat.copyTo(gray);
    }

    // Apply Gaussian blur to reduce noise
    const blurred = new cv.Mat();
    cv.GaussianBlur(gray, blurred, new cv.Size(3, 3), 0);

    // Apply adaptive thresholding to get binary image
    const binary = new cv.Mat();
    cv.adaptiveThreshold(
      blurred,
      binary,
      255,
      cv.ADAPTIVE_THRESH_GAUSSIAN_C,
      cv.THRESH_BINARY_INV,
      11,
      2,
    );

    // Use Hough Line Transform to detect lines
    const lines = new cv.Mat();
    cv.HoughLinesP(
      binary,
      lines,
      1, // rho
      Math.PI / 180, // theta
      50, // threshold
      Math.min(warpedMat.cols, warpedMat.rows) * 0.3, // minLineLength
      20, // maxLineGap
    );

    // Separate horizontal and vertical lines
    const horizontalLines = new Set<number>();
    const verticalLines = new Set<number>();

    const angleThreshold = (15 * Math.PI) / 180; // 15 degrees tolerance

    for (let i = 0; i < lines.rows; i++) {
      const x1 = lines.data32S[i * 4];
      const y1 = lines.data32S[i * 4 + 1];
      const x2 = lines.data32S[i * 4 + 2];
      const y2 = lines.data32S[i * 4 + 3];

      const dx = x2 - x1;
      const dy = y2 - y1;
      const angle = Math.atan2(dy, dx);

      // Log angle threshold check for first few lines
      if (i < 5) {
        console.log(
          `[detectGridStructure] Line ${i}: angle=${angle}, threshold=${angleThreshold}, |angle|=${Math.abs(angle)}, |angle-PI|=${Math.abs(Math.abs(angle) - Math.PI)}, |angle-PI/2|=${Math.abs(angle - Math.PI / 2)}`,
        );
      }

      // Check if line is horizontal (angle close to 0 or PI)
      if (
        Math.abs(angle) < angleThreshold ||
        Math.abs(Math.abs(angle) - Math.PI) < angleThreshold
      ) {
        const y = Math.floor((y1 + y2) / 2);
        // Only consider lines that span significant width
        if (Math.abs(dx) > warpedMat.cols * 0.4) {
          console.log(
            `[detectGridStructure] ADDING horizontal line: y=${y}, dx=${dx}, cols=${warpedMat.cols}, threshold=${warpedMat.cols * 0.4}`,
          );
          horizontalLines.add(y);
          console.log(
            `[detectGridStructure] After adding, horizontalLines.size = ${horizontalLines.size}`,
          );
          if (i < 5) {
            console.log(
              `[detectGridStructure] Line ${i} is HORIZONTAL, dx=${dx}, threshold=${warpedMat.cols * 0.4}`,
            );
          }
        } else if (i < 5) {
          console.log(
            `[detectGridStructure] Line ${i} angle matches but dx=${dx} too small`,
          );
        }
      }
      // Check if line is vertical (angle close to PI/2 or -PI/2)
      else if (
        Math.abs(angle - Math.PI / 2) < angleThreshold ||
        Math.abs(angle + Math.PI / 2) < angleThreshold
      ) {
        const x = Math.floor((x1 + x2) / 2);
        // Only consider lines that span significant height
        if (Math.abs(dy) > warpedMat.rows * 0.4) {
          console.log(
            `[detectGridStructure] ADDING vertical line: x=${x}, dy=${dy}, rows=${warpedMat.rows}, threshold=${warpedMat.rows * 0.4}`,
          );
          verticalLines.add(x);
          console.log(
            `[detectGridStructure] After adding, verticalLines.size = ${verticalLines.size}`,
          );
          if (i < 5) {
            console.log(
              `[detectGridStructure] Line ${i} is VERTICAL, dy=${dy}, threshold=${warpedMat.rows * 0.4}`,
            );
          }
        } else if (i < 5) {
          console.log(
            `[detectGridStructure] Line ${i} angle matches vertical but dy=${dy} too small`,
          );
        }
      }
    }

    console.log('horizontalLines detected:', horizontalLines);
    console.log('verticalLines detected:', verticalLines);

    // Cleanup
    gray.delete();
    blurred.delete();
    binary.delete();
    lines.delete();

    // Cluster nearby lines into single grid lines
    // Lines within minDistance pixels are considered the same grid line
    const minDistance = 8; // pixels

    const clusterLines = (lineSet: Set<number>): Set<number> => {
      const sortedLines = Array.from(lineSet).sort((a, b) => a - b);
      const clustered = new Set<number>();

      for (const line of sortedLines) {
        // Check if this line is close to any existing cluster
        let foundCluster = false;
        for (const existing of clustered) {
          if (Math.abs(line - existing) < minDistance) {
            foundCluster = true;
            break;
          }
        }
        // Only add if it's not close to an existing line
        if (!foundCluster) {
          clustered.add(line);
        }
      }

      return clustered;
    };

    const horizontalLinesClustered = clusterLines(horizontalLines);
    const verticalLinesClustered = clusterLines(verticalLines);

    console.log(
      `[detectGridStructure] After clustering: ${horizontalLinesClustered.size} horizontal, ${verticalLinesClustered.size} vertical lines`,
    );

    // Calculate rows and cols
    // Number of rows = number of horizontal lines - 1
    // Number of cols = number of vertical lines - 1
    const rows = Math.max(1, horizontalLinesClustered.size - 1);
    const cols = Math.max(1, verticalLinesClustered.size - 1);

    // Return null if detection seems unrealistic (too few or too many)
    if (rows < 2 || rows > 20 || cols < 2 || cols > 20) {
      return null;
    }

    return { rows, cols };
  } catch (err) {
    console.error('Error detecting grid structure:', err);
    return null;
  }
}

const log = (...args: any[]) => {
  console.log('[frameProcessor]', ...args);
};

type PipelineStep = ((input: any, ctx: PipelineContext) => any) & {
  __stepName?: string;
};

interface PipelineContext {
  canvas: HTMLCanvasElement;
  contourCanvas?: HTMLCanvasElement;
  debugContainer?: HTMLDivElement;
  debugger?: PipelineDebugger;
  templateCanvas?: HTMLCanvasElement;
  src: any;
  resizedColor?: any;
  originalScaleX?: number;
  originalScaleY?: number;
  detectedCorners?: number[][] | null;
  inverseTransform?: any; // Inverse perspective transform matrix
  detectedContours?: any; // Contours detected in straightened card
  transformedContourPoints?: number[][]; // Contour points transformed back to scaled space
  originalImageWidth?: number;
  originalImageHeight?: number;
  // Transformation history - each step records what it did
  transformations?: PipelineTransformation[];
}

function runPipeline(input: any, steps: PipelineStep[], ctx: PipelineContext) {
  return steps.reduce((current, step, index) => {
    const result = step(current, ctx);
    // Automatically collect debug frames if debugger is available
    if (ctx.debugger) {
      // Use the step's metadata name or fallback to generic name
      const stepName = step.__stepName || `Step ${index + 1}`;
      // Clone the mat for debugging to avoid deletion issues
      const debugMat = new cv.Mat();
      result.copyTo(debugMat);
      ctx.debugger.addFrame(stepName, debugMat);
    }
    return result;
  }, input);
}

/**
 * Process a video frame to detect and extract grid cells from a card
 * @param canvas - Canvas element containing the video frame
 * @param extractGridCells - Callback to handle extracted grid cells
 * @param debugContainer - Optional div element for pipeline debugging visualization
 * @returns The modified canvas or null if processing failed
 */
export function processVideoFrame(
  canvas: HTMLCanvasElement,
  extractGridCells: (warpedMat: any, context?: ExtractionContext) => void,
  debugContainer?: HTMLDivElement,
): HTMLCanvasElement | null {
  try {
    // Get image data from canvas
    const src = cv.imread(canvas);

    log('src', src);

    // Setup debugging if a debug container is provided
    let pipelineDebugger: PipelineDebugger | undefined;
    if (debugContainer) {
      debugContainer.innerHTML = ''; // Clear previous debug content
      pipelineDebugger = new PipelineDebugger(debugContainer);
    }

    const ctx: PipelineContext = {
      canvas,
      debugContainer,
      debugger: pipelineDebugger,
      src,
      originalImageWidth: src.cols,
      originalImageHeight: src.rows,
      transformations: [], // Initialize transformation history
    };

    log('Original image dimensions from canvas:', src.cols, 'x', src.rows);

    // Build a processing pipeline so each transformation is explicit and ordered
    const thickLinesSmall = runPipeline(
      src,
      [
        resize(800, 600),
        grayscale(),
        blur(7),
        canny(50, 180, 3),
        closeLines(5),
        scale(0.3),
        detectCorners(),
        detectContours(),
      ],
      ctx,
    );

    // thickLinesSmall is now actually the straightened card from detectCorners step
    const straightenedCard = thickLinesSmall;

    // Check if corners were detected and card was straightened
    if (!ctx.detectedCorners) {
      log('Could not detect card corners');
      straightenedCard.delete();
      return null;
    }

    log('Card corners detected:', ctx.detectedCorners);
    log(
      'Card straightened, size:',
      straightenedCard.cols,
      'x',
      straightenedCard.rows,
    );

    // Now use detectGridStructure on the straightened card
    const gridStructure = detectGridStructure(straightenedCard);

    if (gridStructure) {
      log(
        'Grid structure detected:',
        gridStructure.rows,
        'x',
        gridStructure.cols,
      );
      extractGridCells(straightenedCard, {
        sourceMat: src,
        inverseTransform: ctx.inverseTransform,
      });
    } else {
      log('Could not detect grid structure in straightened card');
    }

    // Cleanup
    straightenedCard.delete();

    // Draw the transformed contour on the original image if available
    if (
      ctx.transformedContourPoints &&
      ctx.transformedContourPoints.length > 0
    ) {
      // Create a copy to draw on
      const outputWithContour = new cv.Mat();
      src.copyTo(outputWithContour);

      // Convert to RGB if needed for colored drawing
      let drawMat = outputWithContour;
      if (outputWithContour.channels() === 4) {
        const rgbMat = new cv.Mat();
        cv.cvtColor(outputWithContour, rgbMat, cv.COLOR_RGBA2RGB);
        outputWithContour.delete();
        drawMat = rgbMat;
      } else if (outputWithContour.channels() === 1) {
        const rgbMat = new cv.Mat();
        cv.cvtColor(outputWithContour, rgbMat, cv.COLOR_GRAY2RGB);
        outputWithContour.delete();
        drawMat = rgbMat;
      }

      // Draw the contour points as a polyline in red
      const contourPoints = ctx.transformedContourPoints;
      if (contourPoints.length >= 2) {
        const color = new cv.Scalar(0, 0, 255, 255); // Red in BGR

        // Draw lines connecting the points
        for (let i = 0; i < contourPoints.length; i++) {
          const p1 = contourPoints[i];
          const p2 = contourPoints[(i + 1) % contourPoints.length];

          cv.line(
            drawMat,
            new cv.Point(Math.round(p1[0]), Math.round(p1[1])),
            new cv.Point(Math.round(p2[0]), Math.round(p2[1])),
            color,
            3,
            cv.LINE_AA,
          );
        }

        console.log(
          '[frameProcessor] Drew transformed contour on original image',
        );

        // Display the result
        cv.imshow(canvas, drawMat);
      }

      drawMat.delete();
    } else {
      // Display result without contour
      cv.imshow(canvas, src);
    }

    // Render debug visualization if debugger is available
    if (ctx.debugger) {
      ctx.debugger.render();
    }

    // Cleanup
    if (ctx.resizedColor) {
      ctx.resizedColor.delete();
    }
    src.delete();

    return canvas;
  } catch (err) {
    console.error('Error processing frame:', err);
    return null;
  }
}

export { extractGridCellsFromMat };
