// Threshold for determining if a cell is stamped (lower intensity = darker = stamped)
export const STAMPED_CELL_THRESHOLD = 128;

export interface GridData {
  rows: number;
  cols: number;
  cells: boolean[][]; // true = stamped, false = empty
}

export interface GridStructure {
  rows: number;
  cols: number;
}

export interface ExtractionContext {
  sourceMat?: any;
  inverseTransform?: any;
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

    // Convert to grayscale
    const gray = new cv.Mat();
    cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);

    // Apply Gaussian blur
    const blurred = new cv.Mat();
    cv.GaussianBlur(gray, blurred, new cv.Size(5, 5), 0);

    // Edge detection with Canny
    const edges = new cv.Mat();
    cv.Canny(blurred, edges, 50, 150);

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

      if (area > maxArea && area > 70000) {
        log('contour', i, contour, area);

        // Minimum area threshold
        const peri = cv.arcLength(contour, true);
        const approx = new cv.Mat();
        cv.approxPolyDP(contour, approx, 0.02 * peri, true);

        // We want exactly 4 points for a quadrilateral (the card outline)
        if (approx.rows >= 4) {
          maxArea = area;
          if (bestContour) bestContour.delete();
          bestContour = approx;
        } else {
          approx.delete();
        }
      }
    }

    if (bestContour) {
      console.log('Best contour found with area:', maxArea);
      // Draw the detected quadrilateral
      const color = new cv.Scalar(0, 255, 0, 125);
      const pts = new cv.MatVector();
      pts.push_back(bestContour);
      cv.drawContours(src, pts, 0, color, 3);

      // Perform perspective transform
      const srcPoints = cv.Mat.zeros(4, 1, cv.CV_32FC2);
      for (let i = 0; i < 4; i++) {
        srcPoints.data32F[i * 2] = bestContour.data32S[i * 2];
        srcPoints.data32F[i * 2 + 1] = bestContour.data32S[i * 2 + 1];
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
      bestContour.delete();
    }

    // Display result
    cv.imshow(canvas, src);

    // Cleanup
    src.delete();
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

/**
 * Extract grid cells from a warped (rectified) card image
 * @param warpedMat - The warped OpenCV Mat containing the rectified card
 * @param rows - Number of rows in the grid (optional - will auto-detect if not provided)
 * @param cols - Number of columns in the grid (optional - will auto-detect if not provided)
 * @returns Grid data with cell states (stamped/empty)
 */
export function extractGridCellsFromMat(
  warpedMat: any,
  context?: ExtractionContext,
  rows?: number,
  cols?: number,
): GridData {
  // Use provided grid size or fall back to defaults
  const finalRows = rows || 5;
  const finalCols = cols || 10;

  const skipHeaderRows = 2;

  const sourceMat = context?.sourceMat;
  const inverseTransform = context?.inverseTransform;
  const overlayTarget = sourceMat || warpedMat;
  const rectColor = new cv.Scalar(255, 0, 0, 255);

  const width = warpedMat.cols;
  const height = warpedMat.rows;
  const cellWidth = width / finalCols;
  const cellHeight = height / finalRows;

  const effectiveRows = Math.max(0, finalRows - skipHeaderRows);
  const cells: boolean[][] = Array.from({ length: effectiveRows }, () => []);

  for (let row = skipHeaderRows; row < finalRows; row++) {
    const outputRow = row - skipHeaderRows;
    for (let col = 0; col < finalCols; col++) {
      const x = Math.floor(col * cellWidth);
      const y = Math.floor(row * cellHeight);
      const w = Math.floor(cellWidth);
      const h = Math.floor(cellHeight);

      // Draw the assumed grid cell on the original canvas for visualization
      if (overlayTarget) {
        if (inverseTransform && sourceMat) {
          const corners = cv.matFromArray(4, 1, cv.CV_32FC2, [
            x,
            y,
            x + w,
            y,
            x + w,
            y + h,
            x,
            y + h,
          ]);
          const projected = new cv.Mat();
          cv.perspectiveTransform(corners, projected, inverseTransform);

          const pts = [
            new cv.Point(projected.data32F[0], projected.data32F[1]),
            new cv.Point(projected.data32F[2], projected.data32F[3]),
            new cv.Point(projected.data32F[4], projected.data32F[5]),
            new cv.Point(projected.data32F[6], projected.data32F[7]),
          ];

          cv.line(sourceMat, pts[0], pts[1], rectColor, 2);
          cv.line(sourceMat, pts[1], pts[2], rectColor, 2);
          cv.line(sourceMat, pts[2], pts[3], rectColor, 2);
          cv.line(sourceMat, pts[3], pts[0], rectColor, 2);

          projected.delete();
          corners.delete();
        } else {
          cv.rectangle(
            overlayTarget,
            new cv.Point(x, y),
            new cv.Point(x + w, y + h),
            rectColor,
            2,
          );
        }
      }

      try {
        // Extract cell region
        const roi = warpedMat.roi(new cv.Rect(x, y, w, h));

        // Convert to grayscale if needed
        const gray = new cv.Mat();
        if (roi.channels() === 4) {
          cv.cvtColor(roi, gray, cv.COLOR_RGBA2GRAY);
        } else {
          roi.copyTo(gray);
        }

        // Calculate mean intensity
        const mean = cv.mean(gray);
        const intensity = mean[0];

        // Simple threshold: if mean intensity is below threshold, consider it stamped
        cells[outputRow][col] = intensity < STAMPED_CELL_THRESHOLD;

        // Cleanup
        gray.delete();
        roi.delete();
      } catch (err) {
        console.error('Error extracting cell:', err);
        cells[outputRow][col] = false;
      }
    }
  }

  return { rows: effectiveRows, cols: finalCols, cells };
}
