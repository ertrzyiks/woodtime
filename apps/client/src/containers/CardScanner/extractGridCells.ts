// Threshold for determining if a cell is stamped (lower intensity = darker = stamped)
export const STAMPED_CELL_THRESHOLD = 160;

export interface GridData {
  rows: number;
  cols: number;
  cells: boolean[][]; // true = stamped, false = empty
}

export interface ExtractionContext {
  sourceMat?: any;
  inverseTransform?: any;
}

/**
 * Extract and analyze a single cell for holes
 * @param warpedMat - The warped card image
 * @param x, y, w, h - Cell position and dimensions
 * @param row, col - Cell row and column indices
 * @param sourceMat - Original source image for visualization
 * @param inverseTransform - Perspective transform for visualization
 * @returns true if a hole (dot) was detected in the cell
 */
function extractSingleCell(
  warpedMat: any,
  x: number,
  y: number,
  w: number,
  h: number,
  row: number,
  col: number,
  sourceMat: any,
  inverseTransform: any,
): boolean {
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

    // Create a mask to exclude the top-left quadrant
    const quadWidth = Math.max(1, Math.floor(w / 2));
    const quadHeight = Math.max(1, Math.floor(h / 2));

    // Create a white mask (255 = include)
    const mask = new cv.Mat(h, w, cv.CV_8UC1, new cv.Scalar(255));

    // Black out top-right quadrant in warped space (appears as top-left in source)
    cv.rectangle(
      mask,
      new cv.Point(quadWidth, 0),
      new cv.Point(w, quadHeight),
      new cv.Scalar(0),
      -1, // filled rectangle
    );

    // Light blur to stabilize noise before thresholding
    cv.GaussianBlur(gray, gray, new cv.Size(3, 3), 0);

    // Apply threshold to grayscale
    const binary = new cv.Mat();
    cv.threshold(
      gray,
      binary,
      STAMPED_CELL_THRESHOLD,
      255,
      cv.THRESH_BINARY_INV,
    );

    // Morphological close to fill small gaps in hole rims
    const closeKernel = cv.Mat.ones(3, 3, cv.CV_8U);
    cv.morphologyEx(binary, binary, cv.MORPH_CLOSE, closeKernel);
    closeKernel.delete();

    // Apply mask to binary image
    const maskedBinary = new cv.Mat();
    cv.bitwise_and(binary, mask, maskedBinary);

    // DEBUG: Check if maskedBinary has any white pixels
    const whitePixelCount = cv.countNonZero(maskedBinary);
    console.log(
      `Cell [${row}, ${col}] - white pixels in maskedBinary: ${whitePixelCount}`,
    );

    // Use findContours to detect holes (irregular, jagged shapes from spiking)
    const dotContours = new cv.MatVector();
    const dotHierarchy = new cv.Mat();
    cv.findContours(
      maskedBinary,
      dotContours,
      dotHierarchy,
      cv.RETR_EXTERNAL,
      cv.CHAIN_APPROX_SIMPLE,
    );

    let hasDot = false;

    console.log(`Cell [${row}, ${col}] - found ${dotContours.size()} contours`);

    for (let k = 0; k < dotContours.size(); k++) {
      const contour = dotContours.get(k);
      const area = cv.contourArea(contour);
      const rect = cv.boundingRect(contour);

      // Filter by area to reject noise and large grid lines
      if (area < 1 || area > 100) {
        console.log(
          `Cell [${row}, ${col}] contour ${k} REJECTED - area: ${area}`,
        );
        continue;
      }

      // Filter by aspect ratio to reject elongated shapes (lines)
      const aspectRatio = rect.width / rect.height;
      if (aspectRatio > 2.5 || aspectRatio < 0.33) {
        console.log(
          `Cell [${row}, ${col}] contour ${k} REJECTED - aspect ratio: ${aspectRatio.toFixed(2)}`,
        );
        continue; // Too elongated - likely a line segment
      }

      console.log(
        `Cell [${row}, ${col}] contour ${k} ACCEPTED - area: ${area}, width: ${rect.width}, height: ${rect.height}, aspect: ${aspectRatio.toFixed(2)}`,
      );

      const offsetX = x + rect.x;
      const offsetY = y + rect.y;
      const rectWidth = rect.width;
      const rectHeight = rect.height;

      hasDot = true;
      // No break - visualize ALL contours for debugging
    }

    // Cleanup
    dotContours.delete();
    dotHierarchy.delete();
    maskedBinary.delete();
    binary.delete();
    mask.delete();
    gray.delete();
    roi.delete();

    return hasDot;
  } catch (err) {
    console.error('Error extracting cell:', err);
    return false;
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

      cells[outputRow][col] = extractSingleCell(
        warpedMat,
        x,
        y,
        w,
        h,
        row,
        col,
        sourceMat,
        inverseTransform,
      );
    }
  }

  return { rows: effectiveRows, cols: finalCols, cells };
}
