import { PipelineContext } from '../frameProcessor';

/**
 * Order points in clockwise order starting from top-left
 * Identifies the 4 corners by quadrant position relative to centroid
 */
function orderPoints(points: number[][]): number[][] {
  if (!points || points.length === 0) {
    throw new Error('Cannot order points: empty array');
  }

  if (points.length !== 4) {
    throw new Error(`Expected 4 points, got ${points.length}`);
  }

  // Calculate centroid
  const cx = points.reduce((sum, p) => sum + p[0], 0) / 4;
  const cy = points.reduce((sum, p) => sum + p[1], 0) / 4;

  console.log('[orderPoints] Centroid:', cx, cy);

  // Classify points by quadrant relative to centroid
  let topLeft: number[] | null = null;
  let topRight: number[] | null = null;
  let bottomRight: number[] | null = null;
  let bottomLeft: number[] | null = null;

  for (const point of points) {
    const [x, y] = point;
    const isLeft = x < cx;
    const isTop = y < cy;

    console.log(
      `[orderPoints] Point (${x}, ${y}): isLeft=${isLeft}, isTop=${isTop}`,
    );

    if (isTop && isLeft) {
      topLeft = point;
    } else if (isTop && !isLeft) {
      topRight = point;
    } else if (!isTop && !isLeft) {
      bottomRight = point;
    } else {
      bottomLeft = point;
    }
  }

  const ordered = [topLeft, topRight, bottomRight, bottomLeft].filter(
    (p) => p !== null,
  ) as number[][];

  console.log('[orderPoints] Ordered corners (TL, TR, BR, BL):', ordered);
  return ordered;
}

/**
 * Detect card corners from edge image and apply perspective transform
 * Finds the largest contour, extracts corner points, and straightens the original image
 * Returns the straightened card image
 */
export const detectCorners = () => {
  const step = (input: any, ctx: PipelineContext) => {
    try {
      console.log(
        `[detectCorners] Input image size: ${input.cols}x${input.rows}`,
      );
      console.log(
        `[detectCorners] Scale factors: X=${ctx.originalScaleX}, Y=${ctx.originalScaleY}`,
      );

      const contours = new cv.MatVector();
      const hierarchy = new cv.Mat();
      cv.findContours(
        input,
        contours,
        hierarchy,
        cv.RETR_EXTERNAL,
        cv.CHAIN_APPROX_SIMPLE,
      );

      console.log(`[detectCorners] Found ${contours.size()} contours`);

      let maxArea = 0;
      let largestContourIdx = -1;

      // Find the largest contour (should be the card)
      for (let i = 0; i < contours.size(); i++) {
        const contour = contours.get(i);
        const area = cv.contourArea(contour);
        if (area > maxArea) {
          maxArea = area;
          largestContourIdx = i;
        }
      }

      console.log(
        `[detectCorners] Largest contour index: ${largestContourIdx}, area: ${maxArea}`,
      );

      if (largestContourIdx === -1) {
        console.log('No contours found for card detection');
        contours.delete();
        hierarchy.delete();
        ctx.detectedCorners = null;
        ctx.inverseTransform = null;
        return input;
      }

      const largestContour = contours.get(largestContourIdx);
      const approx = new cv.Mat();
      const epsilon = cv.arcLength(largestContour, true) * 0.02;
      cv.approxPolyDP(largestContour, approx, epsilon, true);

      const extractPoints = (mat: any): number[][] => {
        const pts: number[][] = [];
        for (let i = 0; i < mat.rows; i++) {
          const x = mat.data32S[i * 2];
          const y = mat.data32S[i * 2 + 1];
          pts.push([x, y]);
        }
        return pts;
      };

      // Extract points from the approximated contour
      // approx is CV_32SC2 format - use data32S for signed integers
      let points: number[][] = extractPoints(approx);
      points.forEach(([x, y], i) => {
        console.log(`[detectCorners] Point ${i}: (${x}, ${y})`);
      });

      // If approximation gives too many points, refine using convex hull
      if (points.length > 4) {
        console.log(
          `[detectCorners] Too many points (${points.length}), refining with convex hull`,
        );
        const hull = new cv.Mat();
        cv.convexHull(largestContour, hull, true, true);

        const approxHull = new cv.Mat();
        let hullEpsilon = cv.arcLength(hull, true) * 0.02;
        cv.approxPolyDP(hull, approxHull, hullEpsilon, true);

        while (
          approxHull.rows > 4 &&
          hullEpsilon < cv.arcLength(hull, true) * 0.1
        ) {
          hullEpsilon *= 1.5;
          cv.approxPolyDP(hull, approxHull, hullEpsilon, true);
        }

        points = extractPoints(approxHull);
        approxHull.delete();
        hull.delete();
      }

      approx.delete();

      // If we have 4 or more points, order them and apply perspective transform
      if (points.length >= 4) {
        console.log(
          `[detectCorners] Raw contour points before ordering:`,
          points,
        );
        const orderedCorners = orderPoints(points);
        ctx.detectedCorners = orderedCorners;
        console.log('[detectCorners] Found corners:', orderedCorners);

        // Cleanup contours after we're done with them
        contours.delete();
        hierarchy.delete();

        // The corners are already in the input image's coordinate space
        // No need to scale - use them directly for the perspective transform
        const scaledCorners = orderedCorners;

        console.log('[detectCorners] Corners for transform:', scaledCorners);
        console.log(
          '[detectCorners] Input image size:',
          input.cols,
          'x',
          input.rows,
        );

        // Add corners visualization to debugger
        if (ctx.debugger) {
          const cornerViz = new cv.Mat();
          input.copyTo(cornerViz);
          const color = new cv.Scalar(0, 255, 0, 255);
          const radius = 10;
          const thickness = 3;

          // Draw circles at each corner
          scaledCorners.forEach((corner, idx) => {
            cv.circle(
              cornerViz,
              new cv.Point(corner[0], corner[1]),
              radius,
              color,
              thickness,
            );
            console.log(`Corner ${idx}: (${corner[0]}, ${corner[1]})`);
          });

          // Draw lines connecting corners in order
          for (let i = 0; i < 4; i++) {
            const p1 = scaledCorners[i];
            const p2 = scaledCorners[(i + 1) % 4];
            cv.line(
              cornerViz,
              new cv.Point(p1[0], p1[1]),
              new cv.Point(p2[0], p2[1]),
              color,
              2,
            );
          }
        }

        // Apply perspective transform to straighten the card
        const dstWidth = 800;
        const dstHeight = 600;
        const dstPoints = cv.matFromArray(4, 1, cv.CV_32FC2, [
          0,
          0,
          dstWidth,
          0,
          dstWidth,
          dstHeight,
          0,
          dstHeight,
        ]);

        // Create source points from detected corners
        const srcPoints = cv.matFromArray(4, 1, cv.CV_32FC2, [
          scaledCorners[0][0],
          scaledCorners[0][1], // top-left
          scaledCorners[1][0],
          scaledCorners[1][1], // top-right
          scaledCorners[2][0],
          scaledCorners[2][1], // bottom-right
          scaledCorners[3][0],
          scaledCorners[3][1], // bottom-left
        ]);

        // Get perspective transform
        const M = cv.getPerspectiveTransform(srcPoints, dstPoints);
        const inverseM = cv.getPerspectiveTransform(dstPoints, srcPoints);

        // Store inverse transform in context for later use
        ctx.inverseTransform = inverseM;

        // Apply transform to original image
        const straightenedCard = new cv.Mat();
        cv.warpPerspective(
          input,
          straightenedCard,
          M,
          new cv.Size(dstWidth, dstHeight),
        );

        console.log(
          '[detectCorners] Card straightened, size:',
          straightenedCard.cols,
          'x',
          straightenedCard.rows,
        );

        // Cleanup
        M.delete();
        srcPoints.delete();
        dstPoints.delete();

        return straightenedCard;
      } else {
        console.log(
          `[detectCorners] Found ${points.length} contour points, need 4`,
        );
        // Cleanup on failure
        contours.delete();
        hierarchy.delete();
        ctx.detectedCorners = null;
        ctx.inverseTransform = null;
        return input;
      }
    } catch (err) {
      console.error('[detectCorners] Error detecting card corners:', err);
      ctx.detectedCorners = null;
      ctx.inverseTransform = null;
      return input;
    }
  };
  step.__stepName = 'detectCorners()';
  return step;
};
