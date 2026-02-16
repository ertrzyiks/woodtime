import { PipelineContext } from '../frameProcessor';

/**
 * Close lines using morphological closing operation
 */
export const closeLines = (kernelSize: number) => {
  const step = (input: any, ctx?: PipelineContext) => {
    const kernel = cv.getStructuringElement(
      cv.MORPH_RECT,
      new cv.Size(kernelSize, kernelSize),
    );
    const closedEdges = new cv.Mat();
    cv.morphologyEx(input, closedEdges, cv.MORPH_CLOSE, kernel);
    kernel.delete();
    input.delete();
    return closedEdges;
  };
  step.__stepName = `closeLines(${kernelSize})`;
  return step;
};
