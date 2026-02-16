import { PipelineContext } from '../frameProcessor';

/**
 * Apply Gaussian blur to reduce noise
 */
export const blur = (kernelSize: number) => {
  const step = (input: any, ctx?: PipelineContext) => {
    const blurred = new cv.Mat();
    cv.GaussianBlur(input, blurred, new cv.Size(kernelSize, kernelSize), 0);
    input.delete();
    return blurred;
  };
  step.__stepName = `blur(${kernelSize})`;
  return step;
};
