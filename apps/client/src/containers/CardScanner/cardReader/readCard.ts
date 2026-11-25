/**
 * Reads which cells of an orienteering card are stamped (punched).
 *
 * Pipeline: align the photo to the reference card, extract one rectified patch
 * per cell, then detect holes in each patch. Cells with at least one hole are
 * reported as stamped.
 */
import { CARD_HEIGHT, CARD_WIDTH, cardNumber, COLS, ROWS } from './layout';
import {
  cellOutline,
  cellPatch,
  cellTransforms,
  createDisposer,
  downscaleForPatches,
  globalTransform,
  matFromArray,
  matPoints,
  matchToReference,
  toSmallCoordinates,
} from './alignment';
import { findHolesInPatch, HoleBlob } from './holes';

/**
 * Minimum card size, as a fraction of the frame's shorter side, for reliable
 * reading. Smaller cards give too few pixels per hole.
 */
export const MIN_CARD_SIZE = 0.8;

export interface CellReading {
  /** Card number as printed on the card (1-30). */
  card: number;
  row: number;
  col: number;
  stamped: boolean;
  holes: HoleBlob[];
  /** Cell outline in full-resolution photo pixels: TL, TR, BR, BL. */
  outline: Array<[number, number]>;
}

export interface CardReading {
  /** 3 rows x 10 columns, row 0 is the top row of the card. */
  rows: number;
  cols: number;
  cells: boolean[][];
  /** Per-cell details keyed by card number. */
  details: Record<number, CellReading>;
  /** Number of ORB matches that passed the ratio test. */
  matchCount: number;
  /** False when the card could not be aligned at all. */
  aligned: boolean;
  /** ORB match points in full-resolution photo pixels (for debugging). */
  matchPoints: Array<[number, number]>;
  /** The card's four corners in photo pixels: TL, TR, BR, BL. Null if not aligned. */
  cardQuad: Array<[number, number]> | null;
  /**
   * Long edge of the card divided by the shorter side of the photo.
   * Null if not aligned. Small values mean the card is too far from the camera.
   */
  cardSizeFraction: number | null;
}

/**
 * Reads the stamped cells of a card.
 *
 * @param cv OpenCV.js module
 * @param photoGray grayscale CV_8UC1 Mat of the photographed card (full resolution)
 * @param referenceGray grayscale CV_8UC1 Mat of the canonical reference card
 */
export function readCardGrayscale(
  cv: any,
  photoGray: any,
  referenceGray: any,
): CardReading {
  const disposer = createDisposer();
  const cells: boolean[][] = Array.from({ length: ROWS }, () =>
    Array(COLS).fill(false),
  );
  const details: Record<number, CellReading> = {};
  try {
    const matches = matchToReference(cv, photoGray, referenceGray);
    const global = globalTransform(cv, matches);
    if (!global) {
      return emptyReading(matches.reference.length, false);
    }
    const transforms = cellTransforms(cv, matches, global);
    const matchPoints = matches.photo;
    const cardQuad = cardCorners(cv, global);
    const cardSizeFraction = cardSize(cardQuad, photoGray.cols, photoGray.rows);
    const { small, scale } = downscaleForPatches(cv, photoGray);
    disposer.track(small);

    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        const transform = toSmallCoordinates(transforms[row][col], scale);
        const patch = cellPatch(cv, small, transform, row, col);
        try {
          const holes = findHolesInPatch(cv, patch);
          const card = cardNumber(row, col);
          const stamped = holes.length > 0;
          const outline = cellOutline(
            cv,
            transforms[row][col],
            scale,
            row,
            col,
          );
          cells[row][col] = stamped;
          details[card] = { card, row, col, stamped, holes, outline };
        } finally {
          patch.delete();
        }
      }
    }
    return {
      rows: ROWS,
      cols: COLS,
      cells,
      details,
      matchCount: matches.reference.length,
      aligned: true,
      matchPoints,
      cardQuad,
      cardSizeFraction,
    };
  } finally {
    disposer.dispose();
  }
}

/** The card's corners in photo pixels, from the global reference-to-photo transform. */
function cardCorners(cv: any, global: number[]): Array<[number, number]> {
  const d = createDisposer();
  try {
    const corners = d.track(
      matPoints(cv, [
        [0, 0],
        [CARD_WIDTH, 0],
        [CARD_WIDTH, CARD_HEIGHT],
        [0, CARD_HEIGHT],
      ]),
    );
    const mapped = d.track(new cv.Mat());
    cv.perspectiveTransform(
      corners,
      mapped,
      d.track(matFromArray(cv, global, 3, 3)),
    );
    const data = mapped.data32F as Float32Array;
    return [0, 1, 2, 3].map(
      (i) => [data[2 * i], data[2 * i + 1]] as [number, number],
    );
  } finally {
    d.dispose();
  }
}

/** Long edge of the quad divided by the shorter side of the frame. */
export function cardSize(
  quad: Array<[number, number]>,
  frameWidth: number,
  frameHeight: number,
): number {
  const edge = (a: [number, number], b: [number, number]) =>
    Math.hypot(b[0] - a[0], b[1] - a[1]);
  const longEdge = Math.max(
    edge(quad[0], quad[1]),
    edge(quad[1], quad[2]),
    edge(quad[2], quad[3]),
    edge(quad[3], quad[0]),
  );
  return longEdge / Math.min(frameWidth, frameHeight);
}

function emptyReading(matchCount: number, aligned: boolean): CardReading {
  return {
    rows: ROWS,
    cols: COLS,
    cells: Array.from({ length: ROWS }, () => Array(COLS).fill(false)),
    details: {},
    matchCount,
    aligned,
    matchPoints: [],
    cardQuad: null,
    cardSizeFraction: null,
  };
}

/**
 * Reads a camera frame. When the card fills only part of the frame, the
 * card's region is cropped out at full resolution and read again, which
 * gives the alignment and the cells more pixels to work with. Results are
 * returned in frame coordinates.
 */
export function readCardInFrame(
  cv: any,
  frameGray: any,
  referenceGray: any,
  zoomMargin = 0.08,
): CardReading {
  const first = readCardGrayscale(cv, frameGray, referenceGray);
  if (!first.aligned || !first.cardQuad) return first;

  const xs = first.cardQuad.map((p) => p[0]);
  const ys = first.cardQuad.map((p) => p[1]);
  const padX = (Math.max(...xs) - Math.min(...xs)) * zoomMargin;
  const padY = (Math.max(...ys) - Math.min(...ys)) * zoomMargin;
  const x0 = Math.max(0, Math.floor(Math.min(...xs) - padX));
  const y0 = Math.max(0, Math.floor(Math.min(...ys) - padY));
  const x1 = Math.min(frameGray.cols, Math.ceil(Math.max(...xs) + padX));
  const y1 = Math.min(frameGray.rows, Math.ceil(Math.max(...ys) + padY));
  const cropW = x1 - x0;
  const cropH = y1 - y0;
  // Only worth a second pass when the crop is clearly smaller than the frame.
  if (cropW * cropH > 0.7 * frameGray.cols * frameGray.rows) return first;

  const rect = new cv.Rect(x0, y0, cropW, cropH);
  const crop = frameGray.roi(rect);
  const cropCopy = crop.clone();
  crop.delete();
  try {
    const second = readCardGrayscale(cv, cropCopy, referenceGray);
    if (!second.aligned) return first;
    return shiftReading(second, x0, y0, frameGray.cols, frameGray.rows);
  } finally {
    cropCopy.delete();
  }
}

/** Moves every coordinate of a crop reading by the crop's offset in the frame. */
function shiftReading(
  reading: CardReading,
  dx: number,
  dy: number,
  frameWidth: number,
  frameHeight: number,
): CardReading {
  const shift = (points: Array<[number, number]>) =>
    points.map(([x, y]) => [x + dx, y + dy] as [number, number]);
  const details: Record<number, CellReading> = {};
  for (const [card, detail] of Object.entries(reading.details)) {
    details[Number(card)] = { ...detail, outline: shift(detail.outline) };
  }
  const quad = reading.cardQuad ? shift(reading.cardQuad) : null;
  return {
    ...reading,
    details,
    matchPoints: shift(reading.matchPoints),
    cardQuad: quad,
    cardSizeFraction: quad ? cardSize(quad, frameWidth, frameHeight) : null,
  };
}

/** Converts an RGBA Mat (as produced by cv.imread or matFromImageData) to grayscale. */
export function toGrayscale(cv: any, rgba: any): any {
  const gray = new cv.Mat();
  const code = rgba.channels() === 4 ? cv.COLOR_RGBA2GRAY : cv.COLOR_RGB2GRAY;
  cv.cvtColor(rgba, gray, code);
  return gray;
}
