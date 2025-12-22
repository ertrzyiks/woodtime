import { describe, it, expect, beforeAll, vi } from 'vitest';
import {
  processVideoFrame,
  extractGridCellsFromMat,
  STAMPED_CELL_THRESHOLD,
} from './frameProcessor';

// Mock OpenCV.js
const createMockCanvas = (width: number = 100, height: number = 100) => {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    // Draw a simple test pattern
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);
  }
  return canvas;
};

const createMockMat = (rows: number = 600, cols: number = 800) => {
  return {
    rows,
    cols,
    channels: () => 1,
    roi: vi.fn((rect: any) => ({
      channels: () => 1,
      copyTo: vi.fn(),
      delete: vi.fn(),
    })),
    delete: vi.fn(),
  };
};

// Mock cv global
const mockCv = {
  imread: vi.fn(() => createMockMat()),
  imshow: vi.fn(),
  cvtColor: vi.fn(),
  GaussianBlur: vi.fn(),
  Canny: vi.fn(),
  findContours: vi.fn(),
  contourArea: vi.fn(() => 15000),
  arcLength: vi.fn(() => 100),
  approxPolyDP: vi.fn(),
  drawContours: vi.fn(),
  getPerspectiveTransform: vi.fn(() => ({ delete: vi.fn() })),
  warpPerspective: vi.fn(),
  mean: vi.fn(() => [100, 0, 0, 0]),
  Mat: class {
    static zeros = vi.fn(() => ({
      data32F: new Float32Array(8),
      delete: vi.fn(),
    }));
    delete = vi.fn();
  },
  MatVector: class {
    push_back = vi.fn();
    get = vi.fn(() => ({
      delete: vi.fn(),
    }));
    size = vi.fn(() => 1);
    delete = vi.fn();
  },
  Scalar: class {
    constructor(...args: number[]) {}
  },
  Size: class {
    constructor(width: number, height: number) {}
  },
  Rect: class {
    constructor(x: number, y: number, width: number, height: number) {}
  },
  matFromArray: vi.fn(() => ({ delete: vi.fn() })),
  COLOR_RGBA2GRAY: 6,
  RETR_EXTERNAL: 0,
  CHAIN_APPROX_SIMPLE: 2,
  CV_32FC2: 13,
};

describe('frameProcessor', () => {
  beforeAll(() => {
    // Set up global cv mock
    (global as any).cv = mockCv;
  });

  describe('STAMPED_CELL_THRESHOLD', () => {
    it('should have correct threshold value', () => {
      expect(STAMPED_CELL_THRESHOLD).toBe(128);
    });
  });

  describe('processVideoFrame', () => {
    it('should process a video frame successfully', () => {
      const canvas = createMockCanvas();
      const extractGridCells = vi.fn();

      // Mock contour with 4 rows (quadrilateral)
      mockCv.MatVector.prototype.size = vi.fn(() => 1);
      mockCv.MatVector.prototype.get = vi.fn(() => ({
        delete: vi.fn(),
      }));
      mockCv.approxPolyDP.mockImplementation((src: any, dst: any) => {
        // Mock a quadrilateral with 4 points
        dst.rows = 4;
        dst.data32S = new Int32Array([0, 0, 100, 0, 100, 100, 0, 100]);
        dst.delete = vi.fn();
      });

      const result = processVideoFrame(canvas, extractGridCells);

      expect(result).toBe(canvas);
      expect(mockCv.imread).toHaveBeenCalledWith(canvas);
      expect(mockCv.cvtColor).toHaveBeenCalled();
      expect(mockCv.GaussianBlur).toHaveBeenCalled();
      expect(mockCv.Canny).toHaveBeenCalled();
      expect(mockCv.findContours).toHaveBeenCalled();
    });

    it('should return null on error', () => {
      const canvas = createMockCanvas();
      const extractGridCells = vi.fn();

      // Mock an error
      mockCv.imread.mockImplementationOnce(() => {
        throw new Error('Test error');
      });

      const result = processVideoFrame(canvas, extractGridCells);

      expect(result).toBeNull();
    });

    it('should call extractGridCells when quadrilateral is found', () => {
      const canvas = createMockCanvas();
      const extractGridCells = vi.fn();

      // Mock contour with 4 rows (quadrilateral) and high area
      mockCv.contourArea.mockReturnValue(15000);
      mockCv.MatVector.prototype.size = vi.fn(() => 1);
      mockCv.approxPolyDP.mockImplementation((src: any, dst: any) => {
        dst.rows = 4;
        dst.data32S = new Int32Array([0, 0, 100, 0, 100, 100, 0, 100]);
        dst.delete = vi.fn();
      });

      const mockWarped = createMockMat();
      mockCv.warpPerspective.mockImplementation(
        (src: any, dst: any, M: any, size: any) => {
          Object.assign(dst, mockWarped);
        }
      );

      processVideoFrame(canvas, extractGridCells);

      expect(extractGridCells).toHaveBeenCalled();
    });
  });

  describe('extractGridCellsFromMat', () => {
    it('should extract grid cells with default dimensions', () => {
      const mockMat = createMockMat(600, 800);
      
      // Mock mean to return different intensities
      mockCv.mean.mockReturnValue([100, 0, 0, 0]); // Below threshold = stamped

      const result = extractGridCellsFromMat(mockMat);

      expect(result.rows).toBe(5);
      expect(result.cols).toBe(7);
      expect(result.cells).toHaveLength(5);
      expect(result.cells[0]).toHaveLength(7);
    });

    it('should detect stamped cells when intensity is below threshold', () => {
      const mockMat = createMockMat(600, 800);
      
      // Mock mean to return low intensity (stamped)
      mockCv.mean.mockReturnValue([100, 0, 0, 0]);

      const result = extractGridCellsFromMat(mockMat);

      // Intensity 100 < 128, so should be stamped
      expect(result.cells[0][0]).toBe(true);
    });

    it('should detect empty cells when intensity is above threshold', () => {
      const mockMat = createMockMat(600, 800);
      
      // Mock mean to return high intensity (empty)
      mockCv.mean.mockReturnValue([200, 0, 0, 0]);

      const result = extractGridCellsFromMat(mockMat);

      // Intensity 200 > 128, so should be empty
      expect(result.cells[0][0]).toBe(false);
    });

    it('should handle custom grid dimensions', () => {
      const mockMat = createMockMat(600, 800);
      mockCv.mean.mockReturnValue([100, 0, 0, 0]);

      const result = extractGridCellsFromMat(mockMat, 3, 4);

      expect(result.rows).toBe(3);
      expect(result.cols).toBe(4);
      expect(result.cells).toHaveLength(3);
      expect(result.cells[0]).toHaveLength(4);
    });

    it('should handle errors gracefully and mark cells as empty', () => {
      const mockMat = createMockMat(600, 800);
      
      // Mock roi to throw an error
      mockMat.roi = vi.fn(() => {
        throw new Error('ROI extraction failed');
      });

      const result = extractGridCellsFromMat(mockMat);

      // All cells should be false due to error handling
      expect(result.cells[0][0]).toBe(false);
    });
  });
});
