import { PipelineContext } from '../frameProcessor';

/**
 * Convert image to grayscale
 */
export const grayscale = () => (input: any, ctx?: PipelineContext) => {
  const gray = new cv.Mat();
  cv.cvtColor(input, gray, cv.COLOR_RGBA2GRAY);
  return gray;
};
