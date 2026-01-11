// Threshold for determining if a cell is stamped (lower intensity = darker = stamped)
import {
  extractGridCellsFromMat,
  GridData,
  ExtractionContext,
} from './extractGridCells';

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

// Set to true to visualize edges detection
const DEBUG_VISUALIZE_EDGES = true;

/**
 * Order points in clockwise order starting from top-left
 * @param points - Array of 4 or more points
 * @returns Array of exactly 4 points in order: [top-left, top-right, bottom-right, bottom-left]
 */
function orderPoints(points: number[][]): number[][] {
  // If we have exactly 4 points, order them
  // If we have more than 4 points, find the 4 extreme corners
  
  if (points.length === 4) {
    // Sort by sum (x+y) to find top-left and bottom-right
    const sortedBySum = [...points].sort((a, b) => (a[0] + a[1]) - (b[0] + b[1]));
    const topLeft = sortedBySum[0];
    const bottomRight = sortedBySum[3];
    
    // Sort by difference (y-x) to find top-right and bottom-left
    const sortedByDiff = [...points].sort((a, b) => (a[1] - a[0]) - (b[1] - b[0]));
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

    // Resize image for faster processing and better edge detection
    const resized = new cv.Mat();
    cv.resize(src, resized, new cv.Size(640, 480));
    log('resized to 640x480');

    // Convert to grayscale
    const gray = new cv.Mat();
    cv.cvtColor(resized, gray, cv.COLOR_RGBA2GRAY);

    // Apply Gaussian blur
    const blurred = new cv.Mat();
    cv.GaussianBlur(gray, blurred, new cv.Size(5, 5), 0);

    // Edge detection with Canny
    const edges = new cv.Mat();
    cv.Canny(blurred, edges, 100, 220);

    // Visualize edges for debugging
    if (DEBUG_VISUALIZE_EDGES) {
      // Convert edges to RGBA for display (white edges on black background)
      const edgesViz = new cv.Mat();
      cv.cvtColor(edges, edgesViz, cv.COLOR_GRAY2RGBA);

      // Get or create debug canvas
      let debugCanvas = document.getElementById(
        'debug-canvas',
      ) as HTMLCanvasElement;
      if (!debugCanvas) {
        debugCanvas = document.createElement('canvas');
        debugCanvas.id = 'debug-canvas';
        debugCanvas.style.display = 'block';
        debugCanvas.style.marginTop = '10px';
        debugCanvas.style.border = '2px solid red';
        canvas.parentElement?.appendChild(debugCanvas);
      }

      // Set canvas size to match the image
      debugCanvas.width = edgesViz.cols;
      debugCanvas.height = edgesViz.rows;

      // Display edges on debug canvas
      cv.imshow(debugCanvas, edgesViz);
      edgesViz.delete();
      console.log('Displaying Canny edges visualization on debug canvas');
    }

    // Find contours
    const contours = new cv.MatVector();
    const hierarchy = new cv.Mat();
    cv.findContours(
      edges,
      contours,
      hierarchy,
      cv.RETR_EXTERNAL,
      cv.CHAIN_APPROX_SIMPLE,
    );

    // Find the largest quadrilateral
    let maxArea = 0;
    let bestContour = null;

    for (let i = 0; i < contours.size(); i++) {
      const contour = contours.get(i);
      const area = cv.contourArea(contour);

      if (area > maxArea && area > 700) {
        log('contour', i, contour, area);

        // Minimum area threshold
        const peri = cv.arcLength(contour, true);
        
        // Try different epsilon values to get a good approximation
        // Start with more aggressive simplification and reduce if needed
        const epsilonValues = [0.04, 0.03, 0.02, 0.015];
        let bestApprox = null;
        
        for (const epsilon of epsilonValues) {
          const approx = new cv.Mat();
          cv.approxPolyDP(contour, approx, epsilon * peri, true);
          
          // Prefer approximations with exactly 4 points
          if (approx.rows === 4) {
            bestApprox = approx;
            break;
          } else if (approx.rows >= 4 && !bestApprox) {
            // Fall back to this if we can't get exactly 4 points
            bestApprox = approx;
          } else {
            approx.delete();
          }
        }

        // We want at least 4 points for a quadrilateral (the card outline)
        if (bestApprox && bestApprox.rows >= 4) {
          maxArea = area;
          if (bestContour) bestContour.delete();
          bestContour = bestApprox;
        } else if (bestApprox) {
          bestApprox.delete();
        }
      }
    }

    if (bestContour) {
      console.log('Best contour found with area:', maxArea, 'points:', bestContour.rows);

      // Scale contour coordinates back to original image size
      const scaleX = src.cols / resized.cols;
      const scaleY = src.rows / resized.rows;

      // Extract all points from the contour
      const points: number[][] = [];
      for (let i = 0; i < bestContour.rows; i++) {
        const x = Math.round(bestContour.data32S[i * 2] * scaleX);
        const y = Math.round(bestContour.data32S[i * 2 + 1] * scaleY);
        points.push([x, y]);
      }

      // Order the points to get the 4 corners
      const orderedPoints = orderPoints(points);
      console.log('Ordered corner points:', orderedPoints);

      // Create a new contour with exactly 4 ordered points for visualization
      const orderedContour = cv.matFromArray(4, 1, cv.CV_32SC2, orderedPoints.flat());

      // Draw the detected quadrilateral
      const color = new cv.Scalar(0, 255, 0, 125);
      const pts = new cv.MatVector();
      pts.push_back(orderedContour);
      cv.drawContours(src, pts, 0, color, 3);

      // Perform perspective transform using ordered points
      const srcPoints = cv.Mat.zeros(4, 1, cv.CV_32FC2);
      for (let i = 0; i < 4; i++) {
        srcPoints.data32F[i * 2] = orderedPoints[i][0];
        srcPoints.data32F[i * 2 + 1] = orderedPoints[i][1];
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

      // Extract grid cells (assuming 5 rows x 7 cols)
      extractGridCells(warped, { sourceMat: src, inverseTransform: inverseM });

      // Cleanup
      M.delete();
      inverseM.delete();
      warped.delete();
      dstPoints.delete();
      srcPoints.delete();
      pts.delete();
      orderedContour.delete();
      bestContour.delete();
    }

    // Display result
    cv.imshow(canvas, src);

    // Cleanup
    src.delete();
    resized.delete();
    gray.delete();
    blurred.delete();
    edges.delete();
    contours.delete();
    hierarchy.delete();

    return canvas;
  } catch (err) {
    console.error('Error processing frame:', err);
    return null;
  }
}

export { extractGridCellsFromMat };
