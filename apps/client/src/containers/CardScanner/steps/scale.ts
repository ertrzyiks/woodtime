import { PipelineContext } from '../frameProcessor';

/**
 * Scale image by a factor while tracking original scale transformation
 */
export const scale = (scaleFactor: number) => {
  const step = (input: any, ctx: PipelineContext) => {
    const smallWidth = Math.round(input.cols * scaleFactor);
    const smallHeight = Math.round(input.rows * scaleFactor);
    const resizedSmall = new cv.Mat();
    cv.resize(input, resizedSmall, new cv.Size(smallWidth, smallHeight));
    ctx.originalScaleX = ctx.src.cols / resizedSmall.cols;
    ctx.originalScaleY = ctx.src.rows / resizedSmall.rows;
    return resizedSmall;
  };
  step.__stepName = `scale(${scaleFactor})`;
  return step;
};
