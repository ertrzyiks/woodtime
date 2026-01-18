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

export type { GridData, ExtractionContext };

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

    const angleThreshold = (10 * Math.PI) / 180; // 10 degrees tolerance

    for (let i = 0; i < lines.rows; i++) {
      const x1 = lines.data32S[i * 4];
      const y1 = lines.data32S[i * 4 + 1];
      const x2 = lines.data32S[i * 4 + 2];
      const y2 = lines.data32S[i * 4 + 3];

      const dx = x2 - x1;
      const dy = y2 - y1;
      const angle = Math.atan2(dy, dx);

      // Check if line is horizontal (angle close to 0 or PI)
      if (
        Math.abs(angle) < angleThreshold ||
        Math.abs(Math.abs(angle) - Math.PI) < angleThreshold
      ) {
        const y = Math.floor((y1 + y2) / 2);
        // Only consider lines that span significant width
        if (Math.abs(dx) > warpedMat.cols * 0.4) {
          horizontalLines.add(y);
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
          verticalLines.add(x);
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

    // Calculate rows and cols
    // Number of rows = number of horizontal lines - 1
    // Number of cols = number of vertical lines - 1
    const rows = Math.max(1, horizontalLines.size - 1);
    const cols = Math.max(1, verticalLines.size - 1);

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

type PipelineStep = (input: any, ctx: PipelineContext) => any;

interface PipelineContext {
  canvas: HTMLCanvasElement;
  contourCanvas: HTMLCanvasElement;
  templateCanvas?: HTMLCanvasElement;
  src: any;
  resizedColor?: any;
  originalScaleX?: number;
  originalScaleY?: number;
}

function runPipeline(input: any, steps: PipelineStep[], ctx: PipelineContext) {
  return steps.reduce((current, step) => step(current, ctx), input);
}

/**
 * Order points in clockwise order starting from top-left
 * @param points - Array of 4 or more points
 * @returns Array of exactly 4 points in order: [top-left, top-right, bottom-right, bottom-left]
 */
function orderPoints(points: number[][]): number[][] {
  // If we have exactly 4 points, order them
  // If we have more than 4 points, find the 4 extreme corners

  // Guard against empty array
  if (!points || points.length === 0) {
    throw new Error('Cannot order points: empty array');
  }

  if (points.length === 4) {
    // Sort by sum (x+y) to find top-left and bottom-right
    const sortedBySum = [...points].sort((a, b) => a[0] + a[1] - (b[0] + b[1]));
    const topLeft = sortedBySum[0];
    const bottomRight = sortedBySum[3];

    // Sort by difference (y-x) to find top-right and bottom-left
    const sortedByDiff = [...points].sort(
      (a, b) => a[1] - a[0] - (b[1] - b[0]),
    );
    const topRight = sortedByDiff[0];
    const bottomLeft = sortedByDiff[3];

    return [topLeft, topRight, bottomRight, bottomLeft];
  } else {
    // For more than 4 points, find the 4 extreme corners
    // Top-left: minimum x+y
    // Top-right: minimum y-x
    // Bottom-right: maximum x+y
    // Bottom-left: maximum y-x

    let topLeft = points[0];
    let topRight = points[0];
    let bottomRight = points[0];
    let bottomLeft = points[0];

    for (const point of points) {
      const [x, y] = point;

      // Top-left: minimize x + y
      if (x + y < topLeft[0] + topLeft[1]) {
        topLeft = point;
      }

      // Top-right: minimize y - x (or maximize x - y)
      if (y - x < topRight[1] - topRight[0]) {
        topRight = point;
      }

      // Bottom-right: maximize x + y
      if (x + y > bottomRight[0] + bottomRight[1]) {
        bottomRight = point;
      }

      // Bottom-left: maximize y - x (or minimize x - y)
      if (y - x > bottomLeft[1] - bottomLeft[0]) {
        bottomLeft = point;
      }
    }

    return [topLeft, topRight, bottomRight, bottomLeft];
  }
}

/**
 * Process a video frame to detect and extract grid cells from a card
 * @param canvas - Canvas element containing the video frame
 * @param extractGridCells - Callback to handle extracted grid cells
 * @returns The modified canvas or null if processing failed
 */
export function processVideoFrame(
  canvas: HTMLCanvasElement,
  extractGridCells: (warpedMat: any, context?: ExtractionContext) => void,
): HTMLCanvasElement | null {
  try {
    // Get image data from canvas
    const src = cv.imread(canvas);

    log('src', src);

    const contourCanvasId = 'contour-debug-canvas';
    const contourCanvas =
      (document.getElementById(contourCanvasId) as HTMLCanvasElement) ||
      (() => {
        const c = document.createElement('canvas');
        c.id = contourCanvasId;
        c.style.display = 'block';
        c.style.marginTop = '10px';
        canvas.parentElement?.appendChild(c);
        return c;
      })();

    const ctx: PipelineContext = {
      canvas,
      contourCanvas,
      src,
    };

    // Build a processing pipeline so each transformation is explicit and ordered
    const thickLinesSmall = runPipeline(
      src,
      [
        // Resize image for faster processing and better edge detection
        (input) => {
          const resized = new cv.Mat();
          cv.resize(input, resized, new cv.Size(800, 600));
          log('resized to 800x600');
          return resized;
        },
        // Convert to grayscale
        (input) => {
          const gray = new cv.Mat();
          cv.cvtColor(input, gray, cv.COLOR_RGBA2GRAY);
          return gray;
        },
        // Apply Gaussian blur to smooth noise
        (input) => {
          const blurred = new cv.Mat();
          cv.GaussianBlur(input, blurred, new cv.Size(3, 3), 0);
          input.delete();
          return blurred;
        },
        // Edge detection with Canny
        (input) => {
          const edges = new cv.Mat();
          cv.Canny(input, edges, 50, 180, 3);
          input.delete();
          return edges;
        },
        // Merge nearby parallel edges using morphological closing
        (input) => {
          const kernel = cv.getStructuringElement(
            cv.MORPH_RECT,
            new cv.Size(5, 5),
          );
          const closedEdges = new cv.Mat();
          cv.morphologyEx(input, closedEdges, cv.MORPH_CLOSE, kernel);
          kernel.delete();
          input.delete();
          return closedEdges;
        },
        // Downscale further for processing
        (input, ctx) => {
          const PROCESS_SCALE = 0.5;
          const smallWidth = Math.round(input.cols * PROCESS_SCALE);
          const smallHeight = Math.round(input.rows * PROCESS_SCALE);
          const resizedSmall = new cv.Mat();
          cv.resize(input, resizedSmall, new cv.Size(smallWidth, smallHeight));
          ctx.originalScaleX = ctx.src.cols / resizedSmall.cols;
          ctx.originalScaleY = ctx.src.rows / resizedSmall.rows;
          return resizedSmall;
        },
        // Suppress thin lines with opening
        (input) => {
          const thickKernel = cv.getStructuringElement(
            cv.MORPH_RECT,
            new cv.Size(5, 5),
          );
          const thickLines = new cv.Mat();
          cv.morphologyEx(input, thickLines, cv.MORPH_OPEN, thickKernel);
          thickKernel.delete();

          return thickLines;
        },
        // Visualize thick lines on contour canvas
        (thickLines) => {
          const thickViz = new cv.Mat();
          cv.cvtColor(thickLines, thickViz, cv.COLOR_GRAY2RGBA);
          // thickViz.delete();
          return thickLines;
        },
        (input) => {
          ctx.contourCanvas.width = input.cols;
          ctx.contourCanvas.height = input.rows;
          cv.imshow(ctx.contourCanvas, input);
          return input;
        },
      ],
      ctx,
    );

    // Use template matching to detect grid instead of contours
    // Generate a template grid (3 rows x 10 columns, with cell size 80px)
    const GRID_ROWS = 3;
    const GRID_COLS = 10;
    const CELL_SIZE = 80;

    const gridTemplate = generateGridTemplate(GRID_ROWS, GRID_COLS, CELL_SIZE);

    // Visualize the template on a debug canvas
    const templateCanvasId = 'template-debug-canvas';
    const templateCanvas =
      (document.getElementById(templateCanvasId) as HTMLCanvasElement) ||
      (() => {
        const c = document.createElement('canvas');
        c.id = templateCanvasId;
        c.style.display = 'block';
        c.style.marginTop = '10px';
        canvas.parentElement?.appendChild(c);
        return c;
      })();
    templateCanvas.width = gridTemplate.cols;
    templateCanvas.height = gridTemplate.rows;
    const templateViz = new cv.Mat();
    cv.cvtColor(gridTemplate, templateViz, cv.COLOR_GRAY2RGBA);
    cv.imshow(templateCanvas, templateViz);
    templateViz.delete();

    // Try to find the grid in the warped card using multi-scale template matching
    const gridMatch = detectGridMultiScale(
      thickLinesSmall,
      gridTemplate,
      [0.8, 0.9, 1.0, 1.1, 1.2],
    );

    gridTemplate.delete();
    thickLinesSmall.delete();

    console.log('gridMatch', gridMatch);
    let canvasImage: any = src; // default display image

    if (gridMatch && gridMatch.confidence > 0.5) {
      log('Grid detected with confidence:', gridMatch.confidence);
      log('Grid position:', gridMatch.x, gridMatch.y);
      log('Grid size:', gridMatch.width, 'x', gridMatch.height);

      // Scale grid position and size back to original image size
      const scaledGridX = Math.round(gridMatch.x * ctx.originalScaleX!);
      const scaledGridY = Math.round(gridMatch.y * ctx.originalScaleY!);
      const gridWidth = Math.round(gridMatch.width * ctx.originalScaleX!);
      const gridHeight = Math.round(gridMatch.height * ctx.originalScaleY!);
      const redColor = new cv.Scalar(0, 0, 255, 255);
      cv.rectangle(
        src,
        new cv.Point(scaledGridX, scaledGridY),
        new cv.Point(scaledGridX + gridWidth, scaledGridY + gridHeight),
        redColor,
        3,
      );

      // Create a perspective transform to straighten the card
      // For now, assume the card is already relatively straight from the resizing
      const srcPoints = cv.Mat.zeros(4, 1, cv.CV_32FC2);
      const corners = [
        [scaledGridX, scaledGridY],
        [scaledGridX + gridWidth, scaledGridY],
        [scaledGridX + gridWidth, scaledGridY + gridHeight],
        [scaledGridX, scaledGridY + gridHeight],
      ];

      for (let i = 0; i < 4; i++) {
        srcPoints.data32F[i * 2] = corners[i][0];
        srcPoints.data32F[i * 2 + 1] = corners[i][1];
      }

      // Define destination points (800x600 rectangle)
      const dstPoints = cv.matFromArray(
        4,
        1,
        cv.CV_32FC2,
        [0, 0, 800, 0, 800, 600, 0, 600],
      );

      // Get perspective transform matrix
      const M = cv.getPerspectiveTransform(srcPoints, dstPoints);
      const inverseM = cv.getPerspectiveTransform(dstPoints, srcPoints);
      const warped = new cv.Mat();
      cv.warpPerspective(src, warped, M, new cv.Size(800, 600));

      // Extract grid cells using the detected grid structure
      extractGridCells(warped, { sourceMat: src, inverseTransform: inverseM });

      // Cleanup
      M.delete();
      inverseM.delete();
      warped.delete();
      dstPoints.delete();
      srcPoints.delete();
    } else {
      log('Grid not detected with sufficient confidence');
    }

    // Display result (masked to grid region if available)
    cv.imshow(canvas, canvasImage);

    // Cleanup
    if (canvasImage !== src) {
      canvasImage.delete();
    }
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
