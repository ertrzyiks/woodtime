/**
 * Web Worker that runs the card reader off the main thread.
 *
 * The worker loads OpenCV.js itself (after checking its integrity hash),
 * loads the reference card, and then reads each frame it receives.
 */
/// <reference lib="webworker" />
import { drawReadingOverlay } from './overlay';
import { readCardInFrame, toGrayscale } from './readCard';
import type { ReaderRequest, ReaderResponse } from './readerProtocol';

const scope = self as unknown as DedicatedWorkerGlobalScope & { cv?: any };
let cv: any = null;
let referenceGray: any = null;

function post(message: ReaderResponse, transfer: Transferable[] = []) {
  scope.postMessage(message, transfer);
}

/** Loads OpenCV.js from `url`, refusing any file that does not match `integrity`. */
async function loadOpenCV(url: string, integrity: string): Promise<any> {
  const bytes = await (await fetch(url)).arrayBuffer();
  const digest = await crypto.subtle.digest('SHA-384', bytes);
  const hash = btoa(
    Array.from(new Uint8Array(digest), (byte) =>
      String.fromCharCode(byte),
    ).join(''),
  );
  if (`sha384-${hash}` !== integrity) {
    throw new Error('OpenCV.js integrity check failed');
  }
  // OpenCV.js is a classic UMD script; evaluating it in the worker global
  // scope defines `cv`. The hash check above guards this step.
  (0, eval)(new TextDecoder().decode(bytes));
  if (!scope.cv) throw new Error('OpenCV.js did not register itself');
  // `cv` is a thenable that resolves to the initialised module.
  return Promise.resolve(scope.cv);
}

/** RGBA pixels of an image, as an OpenCV RGBA Mat (caller deletes it). */
function matFromBitmap(bitmap: ImageBitmap): any {
  const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('2D canvas is not available in the worker');
  ctx.drawImage(bitmap, 0, 0);
  const pixels = ctx.getImageData(0, 0, bitmap.width, bitmap.height);
  return cv.matFromImageData(pixels);
}

async function init(request: Extract<ReaderRequest, { type: 'init' }>) {
  cv = await loadOpenCV(request.opencvUrl, request.opencvIntegrity);
  const response = await fetch(request.referenceUrl);
  const bitmap = await createImageBitmap(await response.blob());
  const rgba = matFromBitmap(bitmap);
  referenceGray = toGrayscale(cv, rgba);
  rgba.delete();
  bitmap.close();
  post({ type: 'ready' });
}

async function readFrame(request: Extract<ReaderRequest, { type: 'frame' }>) {
  const rgba = matFromBitmap(request.bitmap);
  request.bitmap.close();
  let gray: any = null;
  let overlay: any = null;
  try {
    gray = toGrayscale(cv, rgba);
    const reading = readCardInFrame(cv, gray, referenceGray);
    let overlayBitmap: ImageBitmap | undefined;
    if (request.overlay) {
      overlay = drawReadingOverlay(cv, rgba, reading, { matches: true });
      const pixels = new ImageData(
        new Uint8ClampedArray(overlay.data),
        overlay.cols,
        overlay.rows,
      );
      overlayBitmap = await createImageBitmap(pixels);
    }
    const response: ReaderResponse = {
      type: 'result',
      id: request.id,
      grid: reading.cells,
      matchCount: reading.matchCount,
      aligned: reading.aligned,
      cardSizeFraction: reading.cardSizeFraction,
      overlay: overlayBitmap,
    };
    post(response, overlayBitmap ? [overlayBitmap] : []);
  } finally {
    rgba.delete();
    gray?.delete();
    overlay?.delete();
  }
}

scope.onmessage = (event: MessageEvent<ReaderRequest>) => {
  const request = event.data;
  const run = request.type === 'init' ? init(request) : readFrame(request);
  run.catch((error: unknown) => {
    post({
      type: 'error',
      id: request.type === 'frame' ? request.id : undefined,
      message: error instanceof Error ? error.message : String(error),
    });
  });
};
