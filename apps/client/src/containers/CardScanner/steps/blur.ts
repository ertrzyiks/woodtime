import { PipelineContext } from '../frameProcessor';

/**
 * Apply Gaussian blur to reduce noise
 */
export const blur =
  (kernelSize: number) => (input: any, ctx?: PipelineContext) => {
    const blurred = new cv.Mat();
    cv.GaussianBlur(input, blurred, new cv.Size(kernelSize, kernelSize), 0);
    input.delete();
    return blurred;
  };
