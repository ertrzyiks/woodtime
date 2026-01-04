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
 * Draw a quadrilateral outline on a source image
 * @param sourceMat - The image to draw on
 * @param pts - Array of 4 points forming the quadrilateral
 * @param color - Scalar color for the lines
 * @param thickness - Line thickness (default 1)
 */
function drawQuadrilateral(
  sourceMat: any,
  pts: any[],
  color: any,
  thickness: number = 1,
): void {
  cv.line(sourceMat, pts[0], pts[1], color, thickness);
  cv.line(sourceMat, pts[1], pts[2], color, thickness);
  cv.line(sourceMat, pts[2], pts[3], color, thickness);
  cv.line(sourceMat, pts[3], pts[0], color, thickness);
}

/**
 * Extract and analyze a single cell for holes
 * @param warpedMat - The warped card image
 * @param x, y, w, h - Cell position and dimensions
 * @param row, col - Cell row and column indices
 * @param sourceMat - Original source image for visualization
 * @param inverseTransform - Perspective transform for visualization
 * @param overlayTarget - Canvas to draw visualizations on
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
  overlayTarget: any,
): boolean {
  const quadColor = new cv.Scalar(128, 0, 128, 255);
  const excludedColor = new cv.Scalar(255, 128, 0, 255);
  const dotColor = new cv.Scalar(0, 0, 255, 255);

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

    // Visualize EXCLUDED top-left quadrant in orange (top-right in warped space)
    if (inverseTransform && sourceMat) {
      const topLeft = cv.matFromArray(4, 1, cv.CV_32FC2, [
        x + quadWidth,
        y,
        x + w,
        y,
        x + w,
        y + quadHeight,
        x + quadWidth,
        y + quadHeight,
      ]);
      const projected = new cv.Mat();
      cv.perspectiveTransform(topLeft, projected, inverseTransform);
      const pts = [
        new cv.Point(projected.data32F[0], projected.data32F[1]),
        new cv.Point(projected.data32F[2], projected.data32F[3]),
        new cv.Point(projected.data32F[4], projected.data32F[5]),
        new cv.Point(projected.data32F[6], projected.data32F[7]),
      ];
      drawQuadrilateral(sourceMat, pts, excludedColor, 1);
      projected.delete();
      topLeft.delete();
    } else if (overlayTarget) {
      cv.rectangle(
        overlayTarget,
        new cv.Point(x + quadWidth, y),
        new cv.Point(x + w, y + quadHeight),
        excludedColor,
        1,
      );
    }

    // Visualize top-right quadrant (now included)
    if (inverseTransform && sourceMat) {
      const topRight = cv.matFromArray(4, 1, cv.CV_32FC2, [
        x,
        y,
        x + quadWidth,
        y,
        x + quadWidth,
        y + quadHeight,
        x,
        y + quadHeight,
      ]);
      const projected = new cv.Mat();
      cv.perspectiveTransform(topRight, projected, inverseTransform);
      const pts = [
        new cv.Point(projected.data32F[0], projected.data32F[1]),
        new cv.Point(projected.data32F[2], projected.data32F[3]),
        new cv.Point(projected.data32F[4], projected.data32F[5]),
        new cv.Point(projected.data32F[6], projected.data32F[7]),
      ];
      drawQuadrilateral(sourceMat, pts, quadColor, 1);
      projected.delete();
      topRight.delete();
    } else if (overlayTarget) {
      cv.rectangle(
        overlayTarget,
        new cv.Point(x, y),
        new cv.Point(x + quadWidth, y + quadHeight),
        quadColor,
        1,
      );
    }

    // Visualize bottom-left quadrant
    if (inverseTransform && sourceMat) {
      const bottomLeft = cv.matFromArray(4, 1, cv.CV_32FC2, [
        x,
        y + quadHeight,
        x + quadWidth,
        y + quadHeight,
        x + quadWidth,
        y + h,
        x,
        y + h,
      ]);
      const projected = new cv.Mat();
      cv.perspectiveTransform(bottomLeft, projected, inverseTransform);
      const pts = [
        new cv.Point(projected.data32F[0], projected.data32F[1]),
        new cv.Point(projected.data32F[2], projected.data32F[3]),
        new cv.Point(projected.data32F[4], projected.data32F[5]),
        new cv.Point(projected.data32F[6], projected.data32F[7]),
      ];
      drawQuadrilateral(sourceMat, pts, quadColor, 1);
      projected.delete();
      bottomLeft.delete();
    } else if (overlayTarget) {
      cv.rectangle(
        overlayTarget,
        new cv.Point(x, y + quadHeight),
        new cv.Point(x + quadWidth, y + h),
        quadColor,
        1,
      );
    }

    // Visualize bottom-right quadrant
    if (inverseTransform && sourceMat) {
      const bottomRight = cv.matFromArray(4, 1, cv.CV_32FC2, [
        x + quadWidth,
        y + quadHeight,
        x + w,
        y + quadHeight,
        x + w,
        y + h,
        x + quadWidth,
        y + h,
      ]);
      const projected = new cv.Mat();
      cv.perspectiveTransform(bottomRight, projected, inverseTransform);
      const pts = [
        new cv.Point(projected.data32F[0], projected.data32F[1]),
        new cv.Point(projected.data32F[2], projected.data32F[3]),
        new cv.Point(projected.data32F[4], projected.data32F[5]),
        new cv.Point(projected.data32F[6], projected.data32F[7]),
      ];
      drawQuadrilateral(sourceMat, pts, quadColor, 1);
      projected.delete();
      bottomRight.delete();
    } else if (overlayTarget) {
      cv.rectangle(
        overlayTarget,
        new cv.Point(x + quadWidth, y + quadHeight),
        new cv.Point(x + w, y + h),
        quadColor,
        1,
      );
    }

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

      if (inverseTransform && sourceMat) {
        const corners = cv.matFromArray(4, 1, cv.CV_32FC2, [
          offsetX,
          offsetY,
          offsetX + rectWidth,
          offsetY,
          offsetX + rectWidth,
          offsetY + rectHeight,
          offsetX,
          offsetY + rectHeight,
        ]);
        const projected = new cv.Mat();
        cv.perspectiveTransform(corners, projected, inverseTransform);

        const pts = [
          new cv.Point(projected.data32F[0], projected.data32F[1]),
          new cv.Point(projected.data32F[2], projected.data32F[3]),
          new cv.Point(projected.data32F[4], projected.data32F[5]),
          new cv.Point(projected.data32F[6], projected.data32F[7]),
        ];

        drawQuadrilateral(sourceMat, pts, dotColor, 2);

        projected.delete();
        corners.delete();
      } else if (overlayTarget) {
        cv.rectangle(
          overlayTarget,
          new cv.Point(offsetX, offsetY),
          new cv.Point(offsetX + rectWidth, offsetY + rectHeight),
          dotColor,
          2,
        );
      }
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

          drawQuadrilateral(sourceMat, pts, rectColor, 2);

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
        overlayTarget,
      );
    }
  }

  return { rows: effectiveRows, cols: finalCols, cells };
}
