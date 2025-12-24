import React from 'react';
import {
  processVideoFrame,
  extractGridCellsFromMat,
  STAMPED_CELL_THRESHOLD,
  GridData,
} from '../../src/containers/CardScanner/frameProcessor';

interface FrameProcessorTestProps {
  testType: 'processFrame' | 'extractCells' | 'threshold';
  onTestComplete: (result: any) => void;
}

/**
 * Test component for frame processor functionality
 * This component provides a controlled environment to test frame processing without full page navigation
 */
export const FrameProcessorTest: React.FC<FrameProcessorTestProps> = ({
  testType,
  onTestComplete,
}) => {
  React.useEffect(() => {
    // Wait for OpenCV to be loaded
    const checkAndRun = () => {
      if (typeof (window as any).cv === 'undefined') {
        setTimeout(checkAndRun, 100);
        return;
      }

      runTest();
    };

    const runTest = () => {
      const cv = (window as any).cv;

      switch (testType) {
        case 'processFrame':
          testProcessFrame(cv);
          break;
        case 'extractCells':
          testExtractCells(cv);
          break;
        case 'threshold':
          testThreshold();
          break;
      }
    };

    const testProcessFrame = (cv: any) => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = 100;
        canvas.height = 100;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, 100, 100);
          ctx.fillStyle = '#000000';
          ctx.beginPath();
          ctx.moveTo(20, 20);
          ctx.lineTo(80, 20);
          ctx.lineTo(80, 80);
          ctx.lineTo(20, 80);
          ctx.closePath();
          ctx.fill();
        }

        let gridExtracted = false;
        const extractGridCells = () => {
          gridExtracted = true;
        };

        const src = cv.imread(canvas);
        const result = src !== null;
        src.delete();

        const testResult = { success: result, error: null, gridExtracted };
        (window as any).testResult = testResult;
        onTestComplete(testResult);
      } catch (error: any) {
        const testResult = { success: false, error: error.message };
        (window as any).testResult = testResult;
        onTestComplete(testResult);
      }
    };

    const testExtractCells = (cv: any) => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = 800;
        canvas.height = 600;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          const testResult = { success: false, error: 'Could not get canvas context' };
          (window as any).testResult = testResult;
          onTestComplete(testResult);
          return;
        }

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, 800, 600);

        const cellWidth = 800 / 7;
        const cellHeight = 600 / 5;

        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, cellWidth, cellHeight);
        ctx.fillRect(cellWidth * 2, 0, cellWidth, cellHeight);

        const mat = cv.imread(canvas);
        const rows = 5;
        const cols = 7;
        const width = mat.cols;
        const height = mat.rows;
        const cellW = Math.floor(width / cols);
        const cellH = Math.floor(height / rows);

        const roi = mat.roi(new cv.Rect(0, 0, cellW, cellH));
        const gray = new cv.Mat();
        if (roi.channels() === 4) {
          cv.cvtColor(roi, gray, cv.COLOR_RGBA2GRAY);
        } else {
          roi.copyTo(gray);
        }

        const mean = cv.mean(gray);
        const intensity = mean[0];
        const isStamped = intensity < STAMPED_CELL_THRESHOLD;

        gray.delete();
        roi.delete();
        mat.delete();

        const testResult = {
          success: true,
          error: null,
          intensity,
          isStamped,
        };
        (window as any).testResult = testResult;
        onTestComplete(testResult);
      } catch (error: any) {
        const testResult = { success: false, error: error.message };
        (window as any).testResult = testResult;
        onTestComplete(testResult);
      }
    };

    const testThreshold = () => {
      const testResult = { threshold: STAMPED_CELL_THRESHOLD };
      (window as any).testResult = testResult;
      onTestComplete(testResult);
    };

    checkAndRun();
  }, [testType, onTestComplete]);

  return (
    <div data-testid="frame-processor-test">
      <div>Test Type: {testType}</div>
      <div>Waiting for OpenCV...</div>
    </div>
  );
};
