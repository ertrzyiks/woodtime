// Threshold for determining if a cell is stamped (lower intensity = darker = stamped)
export const STAMPED_CELL_THRESHOLD = 128;

export interface GridData {
  rows: number;
  cols: number;
  cells: boolean[][]; // true = stamped, false = empty
}

/**
 * Process a video frame to detect and extract grid cells from a card
 * @param canvas - Canvas element containing the video frame
 * @param extractGridCells - Callback to handle extracted grid cells
 * @returns The modified canvas or null if processing failed
 */
export function processVideoFrame(
  canvas: HTMLCanvasElement,
  extractGridCells: (warpedMat: any) => void
): HTMLCanvasElement | null {
  try {
    // Get image data from canvas
    const src = cv.imread(canvas);

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
      cv.CHAIN_APPROX_SIMPLE
    );

    // Find the largest quadrilateral
    let maxArea = 0;
    let bestContour = null;

    for (let i = 0; i < contours.size(); i++) {
      const contour = contours.get(i);
      const area = cv.contourArea(contour);

      if (area > maxArea && area > 10000) {
        // Minimum area threshold
        const peri = cv.arcLength(contour, true);
        const approx = new cv.Mat();
        cv.approxPolyDP(contour, approx, 0.02 * peri, true);

        if (approx.rows === 4) {
          maxArea = area;
          if (bestContour) bestContour.delete();
          bestContour = approx;
        } else {
          approx.delete();
        }
      }
    }

    if (bestContour) {
      // Draw the detected quadrilateral
      const color = new cv.Scalar(0, 255, 0, 255);
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
      const dstPoints = cv.matFromArray(4, 1, cv.CV_32FC2, [
        0, 0, 800, 0, 800, 600, 0, 600,
      ]);

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
 * @param rows - Number of rows in the grid
 * @param cols - Number of columns in the grid
 * @returns Grid data with cell states (stamped/empty)
 */
export function extractGridCellsFromMat(
  warpedMat: any,
  rows: number = 5,
  cols: number = 7
): GridData {
  const width = warpedMat.cols;
  const height = warpedMat.rows;
  const cellWidth = width / cols;
  const cellHeight = height / rows;

  const cells: boolean[][] = [];

  for (let row = 0; row < rows; row++) {
    cells[row] = [];
    for (let col = 0; col < cols; col++) {
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

  return { rows, cols, cells };
}
