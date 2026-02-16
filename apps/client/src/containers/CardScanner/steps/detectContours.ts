import { PipelineContext } from '../frameProcessor';

/**
 * Detect contours in the straightened card image
 * Finds all contours and stores information about them
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
