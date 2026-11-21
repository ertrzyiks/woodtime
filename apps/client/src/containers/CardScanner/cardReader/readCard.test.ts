// @vitest-environment node
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import jpeg from 'jpeg-js';
import { beforeAll, describe, expect, it } from 'vitest';
import { readCardGrayscale, toGrayscale } from './readCard';
import { gridPosition } from './layout';

const requireCjs = createRequire(import.meta.url);
const FIXTURES = fileURLToPath(new URL('../fixtures/', import.meta.url));
const REFERENCE = fileURLToPath(
  new URL('../reference/reference-card.jpg', import.meta.url),
);

interface Truth {
  stamped: number[];
  unknown: number[];
}
const expected = JSON.parse(
  readFileSync(`${FIXTURES}expected.json`, 'utf8'),
) as Record<string, Truth | string>;
const photos = Object.keys(expected).filter((name) => name.endsWith('.jpg'));

/** Minimum share of labelled cells read correctly across all fixtures. */
const MIN_ACCURACY = 0.9;

let cv: any;
let referenceGray: any;

beforeAll(async () => {
  cv = await loadOpenCV();
  referenceGray = decodeToGray(REFERENCE);
}, 60_000);

describe('card reader on fixtures', () => {
  it('reads the labelled cells of every photo with at least the expected accuracy', () => {
    let total = 0;
    let correct = 0;
    const report: string[] = [];

    for (const name of photos) {
      const truth = expected[name] as Truth;
      const stamped = new Set(truth.stamped);
      const unknown = new Set(truth.unknown);
      const photo = decodeToGray(`${FIXTURES}${name}`);
      try {
        const reading = readCardGrayscale(cv, photo, referenceGray);
        expect(reading.aligned).toBe(true);
        const wrong: string[] = [];
        for (let card = 1; card <= 30; card++) {
          if (unknown.has(card)) continue;
          const { row, col } = gridPosition(card);
          total++;
          if (reading.cells[row][col] === stamped.has(card)) {
            correct++;
          } else {
            wrong.push(`${card} (${stamped.has(card) ? 'missed' : 'extra'})`);
          }
        }
        report.push(
          `${name}: ${wrong.length === 0 ? 'all correct' : 'wrong ' + wrong.join(', ')}`,
        );
      } finally {
        photo.delete();
      }
    }

    console.info(
      report.join('\n') + `\nTotal: ${correct}/${total} cells correct`,
    );
    expect(correct / total).toBeGreaterThanOrEqual(MIN_ACCURACY);
  }, 120_000);
});

async function loadOpenCV(): Promise<any> {
  const mod: any = requireCjs('@techstark/opencv-js');
  return mod.Mat ? mod : Promise.resolve(mod);
}

function decodeToGray(path: string): any {
  const decoded = jpeg.decode(readFileSync(path), { useTArray: true });
  const rgba = cv.matFromImageData({
    data: decoded.data,
    width: decoded.width,
    height: decoded.height,
  });
  const gray = toGrayscale(cv, rgba);
  rgba.delete();
  return gray;
}
