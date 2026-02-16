import { PipelineContext } from '../frameProcessor';

/**
 * Reverse transform a point through the transformation pipeline history
 * Applies all transformations in reverse order to map from current space back to original space
 */
function reverseTransformPoint(
  point: [number, number],
  transformations: any[],
): [number, number] {
  let [x, y] = point;

  // Apply transformations in reverse order
  for (let i = transformations.length - 1; i >= 0; i--) {
    const t = transformations[i];

    if (t.type === 'perspective' && t.matrix) {
      // Apply inverse perspective transform
      const pt = cv.matFromArray(1, 1, cv.CV_32FC2, [x, y]);
      const transformedPt = cv.matFromArray(1, 1, cv.CV_32FC2, [0, 0]);
      cv.perspectiveTransform(pt, transformedPt, t.matrix);
      x = transformedPt.data32F[0];
      y = transformedPt.data32F[1];
      pt.delete();
      transformedPt.delete();
    } else if (t.type === 'resize' || t.type === 'scale') {
      // For resize/scale, we need to map from output space back to input space
      // This means multiplying by the ratio: inputSize / outputSize
      const scaleX = t.inputWidth / t.outputWidth;
      const scaleY = t.inputHeight / t.outputHeight;
      x *= scaleX;
      y *= scaleY;
    }
  }

  return [x, y];
}

/**
 * Detect contours in the straightened card image
 * Finds all contours and stores information about them
 * Transforms contours back to original image space using transformation history
 */
export const detectContours = () => {
  const step = (input: any, ctx: PipelineContext) => {
    try {
      console.log(
        `[detectContours] Input image size: ${input.cols}x${input.rows}`,
      );

      const contours = new cv.MatVector();
      const hierarchy = new cv.Mat();

      // Find contours in the straightened card
      cv.findContours(
        input,
        contours,
        hierarchy,
        cv.RETR_EXTERNAL,
        cv.CHAIN_APPROX_SIMPLE,
      );

      console.log(`[detectContours] Found ${contours.size()} contours`);

      // Store contour information in context for later use
      const contourInfo = [];
      let largestIndex = 0;
      let largestArea = 0;

      for (let i = 0; i < contours.size(); i++) {
        const contour = contours.get(i);
        const area = cv.contourArea(contour);
        const perimeter = cv.arcLength(contour, true);

        contourInfo.push({
          index: i,
          area: area,
          perimeter: perimeter,
        });

        // Track the largest contour
        if (area > largestArea) {
          largestArea = area;
          largestIndex = i;
        }

        if (i < 5) {
          console.log(
            `[detectContours] Contour ${i}: area=${area.toFixed(2)}, perimeter=${perimeter.toFixed(2)}`,
          );
        }
      }

      console.log(
        `[detectContours] Largest contour: index=${largestIndex}, area=${largestArea.toFixed(2)}`,
      );

      // Store contours in context
      ctx.detectedContours = {
        count: contours.size(),
        contours: contours,
        hierarchy: hierarchy,
        info: contourInfo,
        largestIndex: largestIndex,
        largestArea: largestArea,
      };

      console.log(`[detectContours] Contours stored in context`);

      // Draw contours on output image for visualization
      let output = new cv.Mat();
      input.copyTo(output);

      // Convert to RGB if it's grayscale so we can draw colored contours
      if (output.channels() === 1) {
        const rgbOutput = new cv.Mat();
        cv.cvtColor(output, rgbOutput, cv.COLOR_GRAY2RGB);
        output.delete();
        output = rgbOutput;
      }

      // Draw only the largest contour in green with thickness 2
      const color = new cv.Scalar(0, 255, 0, 255);
      cv.drawContours(output, contours, largestIndex, color, 2, cv.LINE_AA);

      console.log(
        `[detectContours] Drew largest contour (index ${largestIndex}) on output image`,
      );

      // Transform the largest contour back to original image space
      // Uses the transformation history to apply inverse transformations
      if (ctx.transformations && ctx.transformations.length > 0) {
        try {
          const largestContour = contours.get(largestIndex);
          const contourPoints: number[][] = [];

          // Extract contour points
          const contourMat = largestContour;
          for (let i = 0; i < contourMat.rows; i++) {
            const x = contourMat.data32S[i * 2];
            const y = contourMat.data32S[i * 2 + 1];
            contourPoints.push([x, y]);
          }

          console.log(
            `[detectContours] Largest contour has ${contourPoints.length} points`,
          );

          // Transform points back through the entire pipeline
          const transformedPoints: number[][] = contourPoints.map((point) =>
            reverseTransformPoint(
              point as [number, number],
              ctx.transformations!,
            ),
          );

          console.log(
            `[detectContours] Transformed ${transformedPoints.length} points back to original image space using transformation history`,
          );
          console.log(
            `[detectContours] Used ${ctx.transformations.length} transformations in reverse`,
          );

          // Store transformed contour in context for use in frameProcessor
          ctx.transformedContourPoints = transformedPoints;
        } catch (err) {
          console.error(
            '[detectContours] Error transforming contour back:',
            err,
          );
        }
      } else {
        console.warn(
          '[detectContours] No transformation history available - contour transformation skipped',
        );
      }

      // Cleanup (note: contours and hierarchy are stored in context, so don't delete them yet)
      return output;
    } catch (err) {
      console.error('[detectContours] Error detecting contours:', err);
      return input;
    }
  };
  step.__stepName = 'detectContours()';
  return step;
};
