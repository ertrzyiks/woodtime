/**
 * Aligns a photographed card to the canonical reference card and extracts a
 * rectified patch for every cell.
 *
 * 1. ORB features of the photo are matched against the reference card.
 * 2. A global homography (RANSAC) gives a rough alignment.
 * 3. For each cell, an affine transform is fitted to the matches that fall
 *    near that cell, so bent or curled cards still line up locally. If there
 *    are too few matches, the global homography is used instead.
 * 4. The cell is warped into a fixed-size patch for hole detection.
 */
import {
  CARD_HEIGHT,
  CARD_WIDTH,
  CELL_MARGIN,
  COLS,
  COLUMN_EDGES,
  PATCH_HEIGHT,
  PATCH_WIDTH,
  ROWS,
  ROW_EDGES,
} from './layout';

/** Photo is downscaled so its longest side is this, before matching. */
export const MATCH_MAX_SIDE = 2400;
/** Width the photo is downscaled to before cells are sampled. */
export const PATCH_SOURCE_WIDTH = 2000;
/** Lowe ratio test threshold and maximum Hamming distance for ORB matches. */
export const RATIO = 0.8;
export const MAX_HAMMING = 60;
/** Local window (canonical units, half-extents) of matches used per cell. */
const WINDOW_X = 170;
const WINDOW_Y = 120;
const MIN_LOCAL_MATCHES = 8;
const MIN_LOCAL_INLIERS = 6;
const RANSAC_THRESHOLD = 5;
const GLOBAL_RANSAC_THRESHOLD = 6;

export interface Disposer {
  track<T>(m: T): T;
  dispose(): void;
}

export function createDisposer(): Disposer {
  const items: any[] = [];
  return {
    track<T>(m: T): T {
      items.push(m);
      return m;
    },
    dispose() {
      items.forEach((m) => m && typeof m.delete === 'function' && m.delete());
      items.length = 0;
    },
  };
}

/** Matches expressed as photo points (in full-resolution photo pixels) and reference points. */
export interface MatchSet {
  reference: Array<[number, number]>;
  photo: Array<[number, number]>;
}

/** A 3x3 transform from canonical card coordinates into photo pixels. */
export type Transform = number[];

/**
 * Matches ORB features of the grayscale photo against the grayscale reference.
 * Returned points are in full-resolution photo pixels.
 */
export function matchToReference(
  cv: any,
  photoGray: any,
  referenceGray: any,
): MatchSet {
  const d = createDisposer();
  try {
    const scale = MATCH_MAX_SIDE / Math.max(photoGray.rows, photoGray.cols);
    const small = d.track(new cv.Mat());
    cv.resize(photoGray, small, new cv.Size(0, 0), scale, scale, cv.INTER_AREA);

    const orb = d.track(
      new cv.ORB(6000, 1.2, 10, 15, 0, 2, cv.ORB_HARRIS_SCORE, 31, 10),
    );
    const refKp = d.track(new cv.KeyPointVector());
    const refDesc = d.track(new cv.Mat());
    orb.detectAndCompute(referenceGray, new cv.Mat(), refKp, refDesc);
    const photoKp = d.track(new cv.KeyPointVector());
    const photoDesc = d.track(new cv.Mat());
    orb.detectAndCompute(small, new cv.Mat(), photoKp, photoDesc);

    if (refDesc.rows < 2 || photoDesc.rows < 2) {
      return { reference: [], photo: [] };
    }

    const matcher = d.track(new cv.BFMatcher(cv.NORM_HAMMING, false));
    const knn = d.track(new cv.DMatchVectorVector());
    matcher.knnMatch(refDesc, photoDesc, knn, 2);

    const result: MatchSet = { reference: [], photo: [] };
    for (let i = 0; i < knn.size(); i++) {
      const pair = knn.get(i);
      if (pair.size() < 2) continue;
      const best = pair.get(0);
      const second = pair.get(1);
      if (
        best.distance < RATIO * second.distance &&
        best.distance <= MAX_HAMMING
      ) {
        const r = refKp.get(best.queryIdx).pt;
        const p = photoKp.get(best.trainIdx).pt;
        result.reference.push([r.x, r.y]);
        result.photo.push([p.x / scale, p.y / scale]);
      }
    }
    return result;
  } finally {
    d.dispose();
  }
}

/** Global homography mapping reference coordinates to photo pixels, or null. */
export function globalTransform(cv: any, matches: MatchSet): Transform | null {
  if (matches.reference.length < 12) return null;
  const d = createDisposer();
  try {
    const src = d.track(matPoints(cv, matches.reference));
    const dst = d.track(matPoints(cv, matches.photo));
    const H = d.track(
      cv.findHomography(src, dst, cv.RANSAC, GLOBAL_RANSAC_THRESHOLD),
    );
    if (H.empty()) return null;
    return matToArray(H, 3, 3);
  } finally {
    d.dispose();
  }
}

/** Transform for each cell, indexed [row][col]. */
export function cellTransforms(
  cv: any,
  matches: MatchSet,
  global: Transform,
): Transform[][] {
  const out: Transform[][] = [];
  for (let row = 0; row < ROWS; row++) {
    const line: Transform[] = [];
    for (let col = 0; col < COLS; col++) {
      line.push(localTransform(cv, matches, row, col) ?? global);
    }
    out.push(line);
  }
  return out;
}

function localTransform(
  cv: any,
  matches: MatchSet,
  row: number,
  col: number,
): Transform | null {
  const cx = (COLUMN_EDGES[col] + COLUMN_EDGES[col + 1]) / 2;
  const cy = (ROW_EDGES[row] + ROW_EDGES[row + 1]) / 2;
  const ref: Array<[number, number]> = [];
  const photo: Array<[number, number]> = [];
  matches.reference.forEach(([x, y], i) => {
    if (Math.abs(x - cx) < WINDOW_X && Math.abs(y - cy) < WINDOW_Y) {
      ref.push([x, y]);
      photo.push(matches.photo[i]);
    }
  });
  if (ref.length < MIN_LOCAL_MATCHES) return null;

  const d = createDisposer();
  try {
    const src = d.track(matPoints(cv, ref));
    const dst = d.track(matPoints(cv, photo));
    const inliers = d.track(new cv.Mat());
    const A = d.track(
      cv.estimateAffine2D(
        src,
        dst,
        inliers,
        cv.RANSAC,
        RANSAC_THRESHOLD,
        2000,
        0.99,
        10,
      ),
    );
    if (A.empty()) return null;
    let inlierCount = 0;
    for (let i = 0; i < inliers.rows; i++)
      inlierCount += inliers.data[i] ? 1 : 0;
    if (inlierCount < MIN_LOCAL_INLIERS) return null;
    const a = matToArray(A, 2, 3);
    return [a[0], a[1], a[2], a[3], a[4], a[5], 0, 0, 1];
  } finally {
    d.dispose();
  }
}

/**
 * Rectified grayscale patch of one cell. `small` is the photo scaled to
 * PATCH_SOURCE_WIDTH; `transform` maps reference coordinates to `small` pixels.
 */
export function cellPatch(
  cv: any,
  small: any,
  transform: Transform,
  row: number,
  col: number,
): any {
  const d = createDisposer();
  try {
    const x0 = COLUMN_EDGES[col] + CELL_MARGIN;
    const x1 = COLUMN_EDGES[col + 1] - CELL_MARGIN;
    const y0 = ROW_EDGES[row] + CELL_MARGIN;
    const y1 = ROW_EDGES[row + 1] - CELL_MARGIN;
    const corners = d.track(
      matPoints(cv, [
        [x0, y0],
        [x1, y0],
        [x1, y1],
        [x0, y1],
      ]),
    );
    const mapped = d.track(new cv.Mat());
    const M = d.track(matFromArray(cv, transform, 3, 3));
    cv.perspectiveTransform(corners, mapped, M);
    const target = d.track(
      matPoints(cv, [
        [0, 0],
        [PATCH_WIDTH, 0],
        [PATCH_WIDTH, PATCH_HEIGHT],
        [0, PATCH_HEIGHT],
      ]),
    );
    const P = d.track(cv.getPerspectiveTransform(mapped, target));
    const patch = new cv.Mat();
    cv.warpPerspective(
      small,
      patch,
      P,
      new cv.Size(PATCH_WIDTH, PATCH_HEIGHT),
      cv.INTER_LINEAR,
    );
    return patch;
  } finally {
    d.dispose();
  }
}

/** Scales a full-resolution grayscale photo to the patch source width. */
export function downscaleForPatches(
  cv: any,
  photoGray: any,
): { small: any; scale: number } {
  const scale = PATCH_SOURCE_WIDTH / photoGray.cols;
  const small = new cv.Mat();
  cv.resize(
    photoGray,
    small,
    new cv.Size(PATCH_SOURCE_WIDTH, Math.round(photoGray.rows * scale)),
    0,
    0,
    cv.INTER_AREA,
  );
  return { small, scale };
}

/** Composes a transform from reference to the downscaled photo. */
export function toSmallCoordinates(
  transform: Transform,
  scale: number,
): Transform {
  // Scaling matrix applied after the transform: S * M.
  return transform.map((v, i) => {
    const row = Math.floor(i / 3);
    return v * (row < 2 ? scale : 1);
  });
}

export function matPoints(cv: any, points: Array<[number, number]>): any {
  const flat = new Float32Array(points.length * 2);
  points.forEach(([x, y], i) => {
    flat[2 * i] = x;
    flat[2 * i + 1] = y;
  });
  return cv.matFromArray(points.length, 1, cv.CV_32FC2, Array.from(flat));
}

export function matFromArray(
  cv: any,
  values: number[],
  rows: number,
  cols: number,
): any {
  return cv.matFromArray(rows, cols, cv.CV_64F, values);
}

export function matToArray(mat: any, rows: number, cols: number): number[] {
  const out: number[] = [];
  const data = mat.data64F as Float64Array;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) out.push(data[r * mat.cols + c]);
  }
  return out;
}

export { CARD_HEIGHT, CARD_WIDTH };
