/**
 * Detects punched holes inside one rectified cell patch.
 *
 * The patch is a grayscale PATCH_WIDTH x PATCH_HEIGHT image. A pixel is "dark"
 * when it is clearly darker than its local background; holes are the small
 * compact connected regions of such pixels. Grain, printed lines and the
 * printed card number are rejected by size, shape and location filters.
 */
import { PATCH_HEIGHT, PATCH_WIDTH } from './layout';

/** Deviation from the local background, in units of the patch noise level. */
export const HOLE_CONTRAST_SIGMA = 3;
/** Smallest / largest blob area (pixels) accepted as a hole. */
export const HOLE_MIN_AREA = 28;
export const HOLE_MAX_AREA = 170;
/** Border (pixels) ignored on every side, where cell lines leak in. */
export const HOLE_PAD = 10;
/** Top-left region (pixels) that holds the printed cell number. */
export const DIGIT_BOX_WIDTH = 52;
export const DIGIT_BOX_HEIGHT = 46;

export interface HoleBlob {
  x: number;
  y: number;
  area: number;
}

/**
 * @param cv OpenCV.js module
 * @param patch grayscale CV_8UC1 Mat of size PATCH_WIDTH x PATCH_HEIGHT
 */
export function findHolesInPatch(cv: any, patch: any): HoleBlob[] {
  const disposables: any[] = [];
  const track = <T>(m: T): T => {
    disposables.push(m);
    return m;
  };
  try {
    const patch32 = track(new cv.Mat());
    patch.convertTo(patch32, cv.CV_32F);

    // Smooth, then estimate the local background with a median filter.
    const smooth32 = track(new cv.Mat());
    cv.GaussianBlur(
      patch32,
      smooth32,
      new cv.Size(0, 0),
      1.2,
      1.2,
      cv.BORDER_DEFAULT,
    );
    const smooth8 = track(new cv.Mat());
    smooth32.convertTo(smooth8, cv.CV_8U);
    const background8 = track(new cv.Mat());
    cv.medianBlur(smooth8, background8, 21);
    const background32 = track(new cv.Mat());
    background8.convertTo(background32, cv.CV_32F);

    // Absolute deviation from the background.
    const diff = track(new cv.Mat());
    cv.absdiff(background32, smooth32, diff);

    // Frame: the area inside the cell padding, minus the printed number.
    const frame = track(
      new cv.Mat(PATCH_HEIGHT, PATCH_WIDTH, cv.CV_8UC1, new cv.Scalar(0)),
    );
    cv.rectangle(
      frame,
      new cv.Point(HOLE_PAD, HOLE_PAD),
      new cv.Point(PATCH_WIDTH - HOLE_PAD - 1, PATCH_HEIGHT - HOLE_PAD - 1),
      new cv.Scalar(255),
      -1,
    );
    cv.rectangle(
      frame,
      new cv.Point(0, 0),
      new cv.Point(DIGIT_BOX_WIDTH - 1, DIGIT_BOX_HEIGHT - 1),
      new cv.Scalar(0),
      -1,
    );

    // Noise level: robust sigma of the deviation inside the frame.
    const sigma = 1.4826 * robustMedianInFrame(cv, diff, frame);
    const threshold = HOLE_CONTRAST_SIGMA * Math.max(sigma, 1e-3);

    const above = track(new cv.Mat());
    cv.threshold(diff, above, threshold, 255, cv.THRESH_BINARY);
    const above8 = track(new cv.Mat());
    above.convertTo(above8, cv.CV_8U);
    const mask = track(new cv.Mat());
    cv.bitwise_and(above8, frame, mask);

    const labels = track(new cv.Mat());
    const stats = track(new cv.Mat());
    const centroids = track(new cv.Mat());
    const count = cv.connectedComponentsWithStats(
      mask,
      labels,
      stats,
      centroids,
      8,
      cv.CV_32S,
    );

    const blobs: HoleBlob[] = [];
    for (let i = 1; i < count; i++) {
      const x = stats.intAt(i, cv.CC_STAT_LEFT);
      const y = stats.intAt(i, cv.CC_STAT_TOP);
      const w = stats.intAt(i, cv.CC_STAT_WIDTH);
      const h = stats.intAt(i, cv.CC_STAT_HEIGHT);
      const area = stats.intAt(i, cv.CC_STAT_AREA);
      const compact =
        w <= 18 && h <= 18 && Math.max(w, h) <= 2.2 * Math.min(w, h);
      const filled = area / (w * h) >= 0.35;
      if (area >= HOLE_MIN_AREA && area <= HOLE_MAX_AREA && compact && filled) {
        blobs.push({ x: x + w / 2, y: y + h / 2, area });
      }
    }
    return blobs;
  } finally {
    disposables.forEach((m) => m.delete());
  }
}

/** Median of the absolute values of `values` where `frame` is non-zero. */
function robustMedianInFrame(cv: any, values: any, frame: any): number {
  const v = values.data32F as Float32Array;
  const f = frame.data as Uint8Array;
  const picked: number[] = [];
  for (let i = 0; i < f.length; i++) {
    if (f[i] !== 0) picked.push(Math.abs(v[i]));
  }
  if (picked.length === 0) return 0;
  picked.sort((a, b) => a - b);
  const mid = picked.length >> 1;
  return picked.length % 2 ? picked[mid] : (picked[mid - 1] + picked[mid]) / 2;
}
