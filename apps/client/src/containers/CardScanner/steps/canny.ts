import { PipelineContext } from '../frameProcessor';

/**
 * Apply Canny edge detection
 */
export const canny = (
  threshold1: number,
  threshold2: number,
  threshold3: number,
) => {
  const step = (input: any, ctx?: PipelineContext) => {
    const edges = new cv.Mat();
    cv.Canny(input, edges, threshold1, threshold2, 3);
    input.delete();
    return edges;
  };
  step.__stepName = `canny(${threshold1}, ${threshold2}, ${threshold3})`;
  return step;
};
