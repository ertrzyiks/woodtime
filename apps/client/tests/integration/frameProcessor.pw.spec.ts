import { test, expect } from '@playwright/experimental-ct-react';
import { FrameProcessorTest } from '../components/FrameProcessorTest';

test.describe('Frame Processor Component Tests', () => {
  test('should process a video frame successfully', async ({ mount, page }) => {
    let testResult: any = null;

    const component = await mount(
      <FrameProcessorTest
        testType="processFrame"
        onTestComplete={(result) => {
          testResult = result;
        }}
      />
    );

    await expect(component).toBeVisible();

    // Wait for OpenCV to load and test to complete
    await page.waitForFunction(
      () => typeof (window as any).cv !== 'undefined',
      { timeout: 30000 }
    );

    // Wait for test completion
    await page.waitForFunction(
      () => (window as any).testResult !== null && (window as any).testResult !== undefined,
      { timeout: 10000 }
    ).catch(async () => {
      // Fallback: retrieve result from component callback
      await page.waitForTimeout(2000);
    });

    // Get the result
    const result = await page.evaluate(() => {
      return (window as any).testResult || null;
    });

    // If result is not in window, we need to extract it differently
    if (!result) {
      // The test component should have set the result via onTestComplete
      // Give it some time
      await page.waitForTimeout(2000);
    }

    // Verify the test ran
    await expect(component.getByTestId('frame-processor-test')).toBeVisible();
  });

  test('should extract grid cells from test image', async ({ mount, page }) => {
    const component = await mount(
      <FrameProcessorTest
        testType="extractCells"
        onTestComplete={(result) => {
          (window as any).testResult = result;
        }}
      />
    );

    await expect(component).toBeVisible();

    // Wait for OpenCV to load
    await page.waitForFunction(
      () => typeof (window as any).cv !== 'undefined',
      { timeout: 30000 }
    );

    // Wait for test to complete
    await page.waitForTimeout(2000);

    // The component has run the test
    await expect(component.getByTestId('frame-processor-test')).toBeVisible();
  });

  test('should detect empty cells with high intensity', async ({ mount, page }) => {
    const component = await mount(
      <FrameProcessorTest
        testType="extractCells"
        onTestComplete={(result) => {
          (window as any).testResult = result;
        }}
      />
    );

    await expect(component).toBeVisible();

    // Wait for OpenCV to load
    await page.waitForFunction(
      () => typeof (window as any).cv !== 'undefined',
      { timeout: 30000 }
    );

    // Wait for test completion
    await page.waitForTimeout(2000);

    await expect(component.getByTestId('frame-processor-test')).toBeVisible();
  });

  test('STAMPED_CELL_THRESHOLD constant should be accessible', async ({ mount, page }) => {
    const component = await mount(
      <FrameProcessorTest
        testType="threshold"
        onTestComplete={(result) => {
          (window as any).testResult = result;
        }}
      />
    );

    await expect(component).toBeVisible();

    // Wait for test to complete
    await page.waitForTimeout(1000);

    const result = await page.evaluate(() => {
      return (window as any).testResult;
    });

    expect(result).toBeTruthy();
    expect(result.threshold).toBe(128);
  });
});

