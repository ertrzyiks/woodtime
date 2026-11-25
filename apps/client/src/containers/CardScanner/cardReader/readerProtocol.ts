/**
 * Messages exchanged between the scanner page and the card reader worker.
 */
export interface ReaderConfig {
  /** OpenCV.js build to load inside the worker. */
  opencvUrl: string;
  /** Subresource-integrity value (sha384-...) that the OpenCV.js file must match. */
  opencvIntegrity: string;
  /** Reference card image used for alignment. */
  referenceUrl: string;
}

export interface InitRequest extends ReaderConfig {
  type: 'init';
}

export interface FrameRequest {
  type: 'frame';
  id: number;
  bitmap: ImageBitmap;
  overlay: boolean;
}

export type ReaderRequest = InitRequest | FrameRequest;

export type ReaderResponse =
  | { type: 'ready' }
  | {
      type: 'result';
      id: number;
      /** 3 rows x 10 columns, row 0 is the top row of the card. */
      grid: boolean[][];
      matchCount: number;
      aligned: boolean;
      /** Card size as a fraction of the frame's shorter side; null if no card. */
      cardSizeFraction: number | null;
      overlay?: ImageBitmap;
    }
  | { type: 'error'; id?: number; message: string };
