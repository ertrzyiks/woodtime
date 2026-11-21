/**
 * Reads which cells of an orienteering card are stamped (punched).
 *
 * Pipeline: align the photo to the reference card, extract one rectified patch
 * per cell, then detect holes in each patch. Cells with at least one hole are
 * reported as stamped.
 */
import { cardNumber, COLS, ROWS } from './layout';
import {
  cellPatch,
  cellTransforms,
  createDisposer,
  downscaleForPatches,
  globalTransform,
  matchToReference,
  toSmallCoordinates,
} from './alignment';
import { findHolesInPatch, HoleBlob } from './holes';

export interface CellReading {
  /** Card number as printed on the card (1-30). */
  card: number;
  row: number;
  col: number;
  stamped: boolean;
  holes: HoleBlob[];
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
          cells[row][col] = stamped;
          details[card] = { card, row, col, stamped, holes };
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
    };
  } finally {
    disposer.dispose();
  }
}

function emptyReading(matchCount: number, aligned: boolean): CardReading {
  return {
    rows: ROWS,
    cols: COLS,
    cells: Array.from({ length: ROWS }, () => Array(COLS).fill(false)),
    details: {},
    matchCount,
    aligned,
  };
}

/** Converts an RGBA Mat (as produced by cv.imread or matFromImageData) to grayscale. */
export function toGrayscale(cv: any, rgba: any): any {
  const gray = new cv.Mat();
  const code = rgba.channels() === 4 ? cv.COLOR_RGBA2GRAY : cv.COLOR_RGB2GRAY;
  cv.cvtColor(rgba, gray, code);
  return gray;
}
