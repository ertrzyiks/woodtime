import { PipelineContext } from '../frameProcessor';

/**
 * Resize image to specified dimensions for faster processing and better edge detection
 */
export const resize = (width: number, height: number) => {
  const step = (input: any, ctx?: PipelineContext) => {
    const resized = new cv.Mat();
    cv.resize(input, resized, new cv.Size(width, height));
    console.log(`[frameProcessor] resized to ${width}x${height}`);

    // Record transformation in context
    if (ctx && ctx.transformations) {
      ctx.transformations.push({
        stepName: `resize(${width}, ${height})`,
        inputWidth: input.cols,
        inputHeight: input.rows,
        outputWidth: width,
        outputHeight: height,
        type: 'resize',
      });
    }

    return resized;
  };
  step.__stepName = `resize(${width}, ${height})`;
  return step;
};
