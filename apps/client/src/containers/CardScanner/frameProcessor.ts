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

/**
 * Detect the grid structure (rows and columns) from a warped card image
 * Uses Hough Line Transform to detect grid lines and count them
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

    // Apply adaptive thresholding to enhance grid lines
    const binary = new cv.Mat();
    cv.adaptiveThreshold(
      gray,
      binary,
      255,
      cv.ADAPTIVE_THRESH_GAUSSIAN_C,
      cv.THRESH_BINARY,
      11,
      2
    );

    // Invert if needed (we want grid lines to be white)
    cv.bitwise_not(binary, binary);

    // Detect horizontal and vertical lines using morphological operations
    const horizontalKernel = cv.getStructuringElement(
      cv.MORPH_RECT,
      new cv.Size(Math.floor(warpedMat.cols / 10), 1)
    );
    const verticalKernel = cv.getStructuringElement(
      cv.MORPH_RECT,
      new cv.Size(1, Math.floor(warpedMat.rows / 10))
    );

    const horizontal = new cv.Mat();
    const vertical = new cv.Mat();

    cv.morphologyEx(binary, horizontal, cv.MORPH_OPEN, horizontalKernel);
    cv.morphologyEx(binary, vertical, cv.MORPH_OPEN, verticalKernel);

    // Find contours for horizontal lines
    const horizontalContours = new cv.MatVector();
    const horizontalHierarchy = new cv.Mat();
    cv.findContours(
      horizontal,
      horizontalContours,
      horizontalHierarchy,
      cv.RETR_EXTERNAL,
      cv.CHAIN_APPROX_SIMPLE
    );

    // Find contours for vertical lines
    const verticalContours = new cv.MatVector();
    const verticalHierarchy = new cv.Mat();
    cv.findContours(
      vertical,
      verticalContours,
      verticalHierarchy,
      cv.RETR_EXTERNAL,
      cv.CHAIN_APPROX_SIMPLE
    );

    // Count significant horizontal lines (rows + 1 for boundaries)
    const horizontalLines = new Set<number>();
    for (let i = 0; i < horizontalContours.size(); i++) {
      const contour = horizontalContours.get(i);
      const rect = cv.boundingRect(contour);
      const y = rect.y + Math.floor(rect.height / 2);
      
      // Only consider lines that span a significant portion of the width
      if (rect.width > warpedMat.cols * 0.5) {
        horizontalLines.add(y);
      }
    }

    // Count significant vertical lines (cols + 1 for boundaries)
    const verticalLines = new Set<number>();
    for (let i = 0; i < verticalContours.size(); i++) {
      const contour = verticalContours.get(i);
      const rect = cv.boundingRect(contour);
      const x = rect.x + Math.floor(rect.width / 2);
      
      // Only consider lines that span a significant portion of the height
      if (rect.height > warpedMat.rows * 0.5) {
        verticalLines.add(x);
      }
    }

    // Cleanup
    gray.delete();
    binary.delete();
    horizontal.delete();
    vertical.delete();
    horizontalKernel.delete();
    verticalKernel.delete();
    horizontalContours.delete();
    horizontalHierarchy.delete();
    verticalContours.delete();
    verticalHierarchy.delete();

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
  extractGridCells: (warpedMat: any) => void,
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
      const warped = new cv.Mat();
      cv.warpPerspective(src, warped, M, new cv.Size(800, 600));

      // Extract grid cells (assuming 5 rows x 7 cols)
      extractGridCells(warped);

      // Cleanup
      M.delete();
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
  rows?: number,
  cols?: number,
): GridData {
  // Try to detect grid structure if not provided
  let finalRows = rows;
  let finalCols = cols;
  
  if (!rows || !cols) {
    const detected = detectGridStructure(warpedMat);
    if (detected) {
      finalRows = rows || detected.rows;
      finalCols = cols || detected.cols;
    } else {
      // Fallback to defaults if detection fails
      finalRows = rows || 5;
      finalCols = cols || 7;
    }
  }

  const width = warpedMat.cols;
  const height = warpedMat.rows;
  const cellWidth = width / finalCols;
  const cellHeight = height / finalRows;

  const cells: boolean[][] = [];

  for (let row = 0; row < finalRows; row++) {
    cells[row] = [];
    for (let col = 0; col < finalCols; col++) {
      const x = Math.floor(col * cellWidth);
      const y = Math.floor(row * cellHeight);
      const w = Math.floor(cellWidth);
      const h = Math.floor(cellHeight);

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
        cells[row][col] = intensity < STAMPED_CELL_THRESHOLD;

        // Cleanup
        gray.delete();
        roi.delete();
      } catch (err) {
        console.error('Error extracting cell:', err);
        cells[row][col] = false;
      }
    }
  }

  return { rows: finalRows, cols: finalCols, cells };
}
