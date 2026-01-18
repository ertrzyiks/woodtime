/**
 * Feature-based grid detection in the browser using OpenCV.js
 * Detects a 3x10 grid of squares by matching features against a generated template
 * Uses ORB (Oriented FAST and Rotated BRIEF) for rotation/scale invariant matching
 */

interface GridMatch {
  x: number;
  y: number;
  width: number;
  height: number;
  confidence: number;
}

const log = (...args: any[]) => {
  console.log('[gridTemplateMatching]', ...args);
};

/**
 * Generate a template grid image with white lines on black background
 * @param rows - Number of rows in grid
 * @param cols - Number of columns in grid
 * @param cellSize - Size of each cell in pixels
 * @returns OpenCV Mat containing the template grid
 */
export function generateGridTemplate(
  rows: number,
  cols: number,
  cellSize: number,
): any {
  const width = cols * cellSize;
  const height = rows * cellSize;

  // Create a black image
  const template = cv.Mat.zeros(height, width, cv.CV_8U);

  // Draw white lines for the grid
  const white = new cv.Scalar(255, 255, 255);
  const lineThickness = 2;

  // Draw horizontal lines
  for (let i = 0; i <= rows; i++) {
    const y = i * cellSize;
    cv.line(
      template,
      new cv.Point(0, y),
      new cv.Point(width, y),
      white,
      lineThickness,
    );
  }

  // Draw vertical lines
  for (let j = 0; j <= cols; j++) {
    const x = j * cellSize;
    cv.line(
      template,
      new cv.Point(x, 0),
      new cv.Point(x, height),
      white,
      lineThickness,
    );
  }

  // Draw a thicker outer border to define the grid boundary
  // Use a smaller rectangle to account for border centering
  // When thickness is positive, the border is centered on the coordinates,
  // so we inset it slightly to ensure the full border is visible and extends to edges
  const borderThickness = 3;
  cv.rectangle(
    template,
    new cv.Point(1, 1),
    new cv.Point(width - 2, height - 2),
    white,
    borderThickness,
  );

  return template;
}

/**
 * Detect grid position using feature-based matching (ORB)
 * ORB is rotation and scale invariant, making it robust to perspective distortion
 * @param image - The input image Mat to search in
 * @param template - The template grid Mat to match
 * @returns GridMatch object with position and confidence
 */
export function detectGridWithTemplateMatching(
  image: any,
  template: any,
): GridMatch | null {
  try {
    // Ensure image and template are grayscale
    let gray = new cv.Mat();
    if (image.channels() === 4) {
      cv.cvtColor(image, gray, cv.COLOR_RGBA2GRAY);
    } else if (image.channels() === 3) {
      cv.cvtColor(image, gray, cv.COLOR_RGB2GRAY);
    } else {
      image.copyTo(gray);
    }

    // Create ORB detector
    const orb = new cv.ORB(500); // 500 features max

    // Detect keypoints and compute descriptors
    const kp1 = new cv.KeyPointVector(); // keypoints from template
    const des1 = new cv.Mat(); // descriptors from template
    orb.detectAndCompute(template, new cv.Mat(), kp1, des1);

    const kp2 = new cv.KeyPointVector(); // keypoints from image
    const des2 = new cv.Mat(); // descriptors from image
    orb.detectAndCompute(gray, new cv.Mat(), kp2, des2);

    log(
      'Template keypoints:',
      kp1.size(),
      'Image keypoints:',
      kp2.size(),
      'Descriptors match:',
      des1.rows,
      des2.rows,
    );

    // If either image has too few features, matching will fail
    if (kp1.size() < 10 || kp2.size() < 10) {
      console.warn('Not enough keypoints detected for matching');
      gray.delete();
      kp1.delete();
      des1.delete();
      kp2.delete();
      des2.delete();
      orb.delete();
      return null;
    }

    // Manually match descriptors using Hamming distance
    // OpenCV.js doesn't have BFMatcher, so we implement simple matching
    const goodMatches = [];

    // Check descriptor data availability
    log(
      'Descriptor shapes - Des1:',
      des1.rows,
      'x',
      des1.cols,
      'Des2:',
      des2.rows,
      'x',
      des2.cols,
    );

    // For each descriptor in template, find closest match in image
    for (let i = 0; i < des1.rows; i++) {
      let bestDistance = Infinity;
      let bestMatch = -1;

      for (let j = 0; j < des2.rows; j++) {
        // Calculate Hamming distance between two descriptors
        let distance = 0;

        try {
          // Try to access descriptor data - handle different possible array types
          const des1Data = des1.data8U || des1.data32F;
          const des2Data = des2.data8U || des2.data32F;

          if (!des1Data || !des2Data) {
            log('Warning: Unable to access descriptor data');
            continue;
          }

          for (let k = 0; k < des1.cols; k++) {
            const idx1 = i * des1.cols + k;
            const idx2 = j * des2.cols + k;

            if (idx1 < des1Data.length && idx2 < des2Data.length) {
              const bit1 = des1Data[idx1];
              const bit2 = des2Data[idx2];
              // XOR and count bits
              const xor = bit1 ^ bit2;
              for (let b = 0; b < 8; b++) {
                if ((xor >> b) & 1) distance++;
              }
            }
          }
        } catch (e) {
          log('Error calculating distance for descriptors', i, j, e);
          continue;
        }

        if (distance < bestDistance) {
          bestDistance = distance;
          bestMatch = j;
        }
      }

      // Only accept good matches (low distance)
      if (bestDistance < 100 && bestMatch !== -1) {
        goodMatches.push({
          distance: bestDistance,
          queryIdx: i,
          trainIdx: bestMatch,
        });
      }
    }

    goodMatches.sort((a, b) => a.distance - b.distance);

    log('Matches found:', goodMatches.length);

    log('Good matches after filtering:', goodMatches.length);

    // Need at least 4 good matches to estimate grid position
    if (goodMatches.length < 4) {
      console.warn('Not enough good matches to determine grid position');
      gray.delete();
      kp1.delete();
      des1.delete();
      kp2.delete();
      des2.delete();
      orb.delete();
      return null;
    }

    // Calculate bounding box of matched keypoints in the image
    // This gives us a more accurate grid position than centroid
    let minX = Infinity,
      minY = Infinity,
      maxX = -Infinity,
      maxY = -Infinity;

    for (let i = 0; i < goodMatches.length; i++) {
      const trainIdx = goodMatches[i].trainIdx;
      const kp = kp2.get(trainIdx);
      minX = Math.min(minX, kp.pt.x);
      minY = Math.min(minY, kp.pt.y);
      maxX = Math.max(maxX, kp.pt.x);
      maxY = Math.max(maxY, kp.pt.y);
    }

    // Estimate the actual grid size based on the detected feature scale
    // The features are detected on the grid lines, so we need to estimate the full grid extent
    // by comparing the detected feature span to the template dimensions
    const templateWidth = template.cols;
    const templateHeight = template.rows;

    const detectedFeatureWidth = maxX - minX;
    const detectedFeatureHeight = maxY - minY;

    // Calculate the scale of the detected grid relative to the template
    // This tells us how much the detected features have been scaled
    const scaleX = detectedFeatureWidth / templateWidth;
    const scaleY = detectedFeatureHeight / templateHeight;

    // Key insight: Instead of trying to estimate what fraction of the grid
    // the features represent, use the template aspect ratio to properly scale
    // the detected bounding box. The features might be biased (e.g., concentrated
    // on one side due to perspective), but the aspect ratio of the full grid
    // should still be maintained from the template.

    const templateAspect = templateWidth / templateHeight;
    const detectedAspect = detectedFeatureWidth / detectedFeatureHeight;

    // Use whichever scale (X or Y) gives us an aspect ratio closer to the template
    let gridWidth, gridHeight;

    if (
      Math.abs(
        templateAspect -
          detectedFeatureWidth / (detectedFeatureHeight / scaleX),
      ) <
      Math.abs(
        templateAspect -
          detectedFeatureWidth / (detectedFeatureHeight / scaleY),
      )
    ) {
      // Use scaleX to scale everything uniformly
      gridWidth = templateWidth * scaleX;
      gridHeight = templateHeight * scaleX;
    } else {
      // Use scaleY to scale everything uniformly
      gridWidth = templateWidth * scaleY;
      gridHeight = templateHeight * scaleY;
    }

    const featureCenterX = (minX + maxX) / 2;
    const featureCenterY = (minY + maxY) / 2;

    const gridX = featureCenterX - gridWidth / 2;
    const gridY = featureCenterY - gridHeight / 2;
    const detectedWidth = gridWidth;
    const detectedHeight = gridHeight;

    // Confidence based on number of matches
    const confidence = Math.min(goodMatches.length / 100, 1.0);

    log(
      'Grid bounds - X:',
      gridX,
      'Y:',
      gridY,
      'W:',
      detectedWidth,
      'H:',
      detectedHeight,
      'Confidence:',
      confidence,
    );

    // Clean up
    gray.delete();
    kp1.delete();
    des1.delete();
    kp2.delete();
    des2.delete();
    orb.delete();

    return {
      x: Math.round(gridX),
      y: Math.round(gridY),
      width: Math.round(detectedWidth),
      height: Math.round(detectedHeight),
      confidence,
    };
  } catch (error) {
    console.error('Error in feature matching:', error);
    return null;
  }
}

/**
 * Multi-scale template matching to handle different sizes
 * @param image - The input image Mat to search in
 * @param templateBase - The base template grid Mat
 * @param scales - Array of scale factors to try [0.5, 0.75, 1.0, 1.25, 1.5]
 * @returns GridMatch object with the best match across scales
 */
export function detectGridMultiScale(
  image: any,
  templateBase: any,
  scales: number[] = [0.8, 0.9, 1.0, 1.1, 1.2],
): GridMatch | null {
  let bestMatch: GridMatch | null = null;
  let bestArea = 0;

  for (const scale of scales) {
    const width = Math.round(templateBase.cols * scale);
    const height = Math.round(templateBase.rows * scale);

    if (width > image.cols || height > image.rows) {
      continue; // Skip scales that would be larger than the image
    }

    // Resize template
    const resizedTemplate = new cv.Mat();
    cv.resize(templateBase, resizedTemplate, new cv.Size(width, height));

    // Perform matching
    const match = detectGridWithTemplateMatching(image, resizedTemplate);
    console.log(`Scale: ${scale}, Match:`, match);

    // Keep the match with the largest bounding box (most likely to be full grid)
    if (match) {
      const area = match.width * match.height;
      if (area > bestArea) {
        bestMatch = match;
        bestArea = area;
      }
    }

    resizedTemplate.delete();
  }

  return bestMatch;
}

/**
 * Extract cell positions from a detected grid
 * @param gridMatch - The detected grid match
 * @param rows - Number of rows in grid
 * @param cols - Number of columns in grid
 * @param cellSize - Size of each cell in pixels
 * @returns Array of cell positions [{ x, y, width, height }, ...]
 */
export function extractCellPositions(
  gridMatch: GridMatch,
  rows: number,
  cols: number,
  cellSize: number,
): Array<{ x: number; y: number; width: number; height: number }> {
  const cells: Array<{ x: number; y: number; width: number; height: number }> =
    [];

  const startX = gridMatch.x;
  const startY = gridMatch.y;

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      cells.push({
        x: startX + col * cellSize,
        y: startY + row * cellSize,
        width: cellSize,
        height: cellSize,
      });
    }
  }

  return cells;
}
