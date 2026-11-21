/**
 * Fixed layout of the orienteering card.
 *
 * All coordinates are in the canonical ("reference") card space, a 1400x600
 * rectangle that every photo is aligned to. The 30 numbered cells form three
 * rows of ten. Rows are listed top-to-bottom: the top row holds cards 21-30,
 * the middle row 11-20 and the bottom row 1-10, matching the printed card.
 */

/** Canonical card size used as the alignment reference. */
export const CARD_WIDTH = 1400;
export const CARD_HEIGHT = 600;

/** Column boundaries (11 values, left edge to right edge). */
export const COLUMN_EDGES = [
  13, 166, 314, 455, 588, 718, 850, 990, 1133, 1268, 1397,
];

/** Row boundaries (4 values, top edge to bottom edge). */
export const ROW_EDGES = [241, 346, 456, 572];

export const ROWS = 3;
export const COLS = 10;

/** Size of the rectified patch extracted for each cell. */
export const PATCH_WIDTH = 120;
export const PATCH_HEIGHT = 100;

/** Margin (canonical units) removed from each cell border before sampling. */
export const CELL_MARGIN = 6;

/** Card number printed in a cell, given its grid position (row 0 = top). */
export function cardNumber(row: number, col: number): number {
  return (ROWS - 1 - row) * COLS + col + 1;
}

/** Grid position of a card number. Inverse of cardNumber. */
export function gridPosition(card: number): { row: number; col: number } {
  const index = card - 1;
  return { row: ROWS - 1 - Math.floor(index / COLS), col: index % COLS };
}
