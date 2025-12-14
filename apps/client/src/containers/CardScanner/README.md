# Card Scanner

The Card Scanner is a feature that allows users to scan physical cards with a grid pattern using their device camera. It uses OpenCV.js for computer vision processing.

## Features

- **Camera Access**: Access device camera (front or back)
- **Real-time Grid Detection**: Automatically detects the card outline and grid pattern
- **Cell Extraction**: Extracts individual cells from the grid (5 rows × 7 columns)
- **Visual Feedback**: Shows the detected grid with color-coded cells

## How It Works

### 1. Grid Recognition Pipeline

The scanner uses the following steps to recognize the grid:

1. **Preprocessing**: Converts the camera frame to grayscale and applies Gaussian blur to reduce noise
2. **Edge Detection**: Uses Canny edge detection to highlight borders
3. **Contour Detection**: Finds the largest quadrilateral shape (the card outline)
4. **Perspective Transform**: Warps the detected quadrilateral to a perfect rectangle view
5. **Cell Extraction**: Divides the rectified image into a 5×7 grid and extracts each cell

### 2. Cell Detection

Each cell is analyzed to determine if it's stamped or empty:
- Calculates the mean intensity of the cell
- If intensity is below threshold (128), the cell is considered stamped (darker)
- If intensity is above threshold, the cell is considered empty (lighter)

## Usage

1. Navigate to the main events list page
2. Click the camera icon floating action button
3. Allow camera permissions when prompted
4. Click "Start Camera" to begin scanning
5. Point the camera at a card with a visible grid
6. The scanner will automatically detect the grid and show the results
7. Click "Stop Camera" to stop scanning
8. Click "Back" to return to the events list

## Technical Details

- **OpenCV.js**: Loaded via CDN for computer vision operations
- **TensorFlow.js**: Included for future ML model integration
- **Grid Size**: Fixed at 5 rows × 7 columns (35 cells total)
- **Detection Threshold**: 128 (on a 0-255 scale)

## Security Considerations

- OpenCV.js is currently loaded from CDN without integrity hash
- For production deployment, consider:
  - Adding integrity hash to the script tag
  - Self-hosting OpenCV.js for better security and reliability
  - Using Subresource Integrity (SRI) to ensure script hasn't been tampered with

## Future Enhancements

- Add ML model for improved cell classification
- Add stabilization logic to reduce flickering
- Support for different grid sizes
- Export/save grid data
- Share grid results
- Self-host OpenCV.js with integrity verification
