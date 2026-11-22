/**
 * Visual debugging: draws the reader's findings on top of a photo.
 *
 * - Each cell is framed in green (stamped) or orange (empty).
 * - Each detected hole is circled in red at its position in the photo.
 * - Optionally the ORB match points and the card numbers are drawn.
 *
 * Works on an RGBA Mat and returns a new Mat, so it can be shown with
 * cv.imshow or inspected in tests.
 */
import { CardReading, CellReading } from './readCard';
import { PATCH_HEIGHT, PATCH_WIDTH } from './layout';

export interface OverlayOptions {
  /** Frame every cell (default true). */
  cells?: boolean;
  /** Circle every detected hole (default true). */
  holes?: boolean;
  /** Draw the ORB match points used for alignment (default false). */
  matches?: boolean;
  /** Write the card number inside each cell (default true). */
  labels?: boolean;
}

const COLOURS = {
  stamped: [0, 220, 0, 255],
  empty: [255, 140, 0, 255],
  hole: [255, 0, 0, 255],
  match: [255, 255, 0, 255],
  label: [255, 255, 255, 255],
};

/**
 * @param cv OpenCV.js module
 * @param source RGBA CV_8UC4 Mat of the photo, the same photo that was read
 * @param reading result of readCardGrayscale for that photo
 * @returns a new RGBA Mat with the overlay drawn; the caller must delete it
 */
export function drawReadingOverlay(
  cv: any,
  source: any,
  reading: CardReading,
  options: OverlayOptions = {},
): any {
  const {
    cells = true,
    holes = true,
    matches = false,
    labels = true,
  } = options;
  const out = source.clone();
  // Line widths and radii scale with the photo so they stay visible.
  const thickness = Math.max(2, Math.round(out.cols / 700));
  const radius = Math.max(4, Math.round(out.cols / 300));

  if (matches) {
    for (const [x, y] of reading.matchPoints) {
      cv.circle(
        out,
        new cv.Point(x, y),
        Math.max(1, Math.round(radius / 3)),
        scalar(cv, COLOURS.match),
        -1,
      );
    }
  }

  for (const detail of Object.values(reading.details) as CellReading[]) {
    const colour = scalar(cv, detail.stamped ? COLOURS.stamped : COLOURS.empty);
    const q = detail.outline;
    if (cells) {
      for (let i = 0; i < 4; i++) {
        const a = q[i];
        const b = q[(i + 1) % 4];
        cv.line(
          out,
          new cv.Point(a[0], a[1]),
          new cv.Point(b[0], b[1]),
          colour,
          thickness,
        );
      }
    }
    if (holes) {
      for (const hole of detail.holes) {
        const [x, y] = patchToPhoto(hole.x, hole.y, q);
        cv.circle(
          out,
          new cv.Point(x, y),
          radius,
          scalar(cv, COLOURS.hole),
          thickness,
        );
      }
    }
    if (labels) {
      const [x, y] = q[0];
      cv.putText(
        out,
        String(detail.card),
        new cv.Point(x + thickness * 2, y + radius * 3),
        cv.FONT_HERSHEY_SIMPLEX,
        out.cols / 2400,
        scalar(cv, COLOURS.label),
        thickness,
      );
    }
  }
  return out;
}

function scalar(cv: any, [r, g, b, a]: number[]): any {
  return new cv.Scalar(r, g, b, a);
}

/** Maps a point of a cell patch to photo pixels, using the cell outline (TL, TR, BR, BL). */
export function patchToPhoto(
  x: number,
  y: number,
  outline: Array<[number, number]>,
): [number, number] {
  const u = x / PATCH_WIDTH;
  const v = y / PATCH_HEIGHT;
  const [tl, tr, br, bl] = outline;
  const px =
    (1 - u) * (1 - v) * tl[0] +
    u * (1 - v) * tr[0] +
    u * v * br[0] +
    (1 - u) * v * bl[0];
  const py =
    (1 - u) * (1 - v) * tl[1] +
    u * (1 - v) * tr[1] +
    u * v * br[1] +
    (1 - u) * v * bl[1];
  return [px, py];
}
