/**
 * Main-thread handle for the card reader worker.
 *
 * Only one frame is in flight at a time. Callers check `isBusy` and skip
 * frames instead of queueing them, so the preview never falls behind.
 */
import type { ReaderConfig, ReaderResponse } from './readerProtocol';

export interface FrameResult {
  grid: boolean[][];
  matchCount: number;
  aligned: boolean;
  overlay?: ImageBitmap;
}

export class CardReaderClient {
  private readonly worker: Worker;
  private readonly readyPromise: Promise<void>;
  private resolveReady!: () => void;
  private rejectReady!: (error: Error) => void;
  private ready = false;
  private nextId = 1;
  private pending: {
    id: number;
    resolve: (result: FrameResult) => void;
    reject: (error: Error) => void;
  } | null = null;

  constructor(config: ReaderConfig) {
    this.readyPromise = new Promise<void>((resolve, reject) => {
      this.resolveReady = resolve;
      this.rejectReady = reject;
    });
    this.worker = new Worker(new URL('./readerWorker.ts', import.meta.url), {
      type: 'module',
    });
    this.worker.onmessage = (event: MessageEvent<ReaderResponse>) =>
      this.handle(event.data);
    this.worker.onerror = (event: ErrorEvent) => {
      const error = new Error(event.message || 'Card reader worker failed');
      this.rejectReady(error);
      this.pending?.reject(error);
      this.pending = null;
    };
    this.worker.postMessage({ type: 'init', ...config });
  }

  /** Resolves once OpenCV.js and the reference card are loaded in the worker. */
  whenReady(): Promise<void> {
    return this.readyPromise;
  }

  get isReady(): boolean {
    return this.ready;
  }

  get isBusy(): boolean {
    return this.pending !== null;
  }

  /** Reads one frame. The bitmap is transferred to the worker and closed there. */
  read(bitmap: ImageBitmap, overlay: boolean): Promise<FrameResult> {
    if (this.pending) {
      bitmap.close();
      return Promise.reject(new Error('Reader is busy'));
    }
    const id = this.nextId++;
    return new Promise<FrameResult>((resolve, reject) => {
      this.pending = { id, resolve, reject };
      this.worker.postMessage({ type: 'frame', id, bitmap, overlay }, [bitmap]);
    });
  }

  terminate(): void {
    this.worker.terminate();
    this.pending?.reject(new Error('Reader terminated'));
    this.pending = null;
  }

  private handle(message: ReaderResponse): void {
    if (message.type === 'ready') {
      this.ready = true;
      this.resolveReady();
      return;
    }
    if (message.type === 'error') {
      const error = new Error(message.message);
      if (!this.ready) {
        this.rejectReady(error);
      }
      if (
        this.pending &&
        (message.id === undefined || message.id === this.pending.id)
      ) {
        this.pending.reject(error);
        this.pending = null;
      }
      return;
    }
    if (this.pending && message.id === this.pending.id) {
      const { resolve } = this.pending;
      this.pending = null;
      resolve({
        grid: message.grid,
        matchCount: message.matchCount,
        aligned: message.aligned,
        overlay: message.overlay,
      });
    }
  }
}
