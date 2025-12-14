import { useState, useRef, useEffect } from 'react';
import {
  Box,
  Button,
  Paper,
  Typography,
  Breadcrumbs,
} from '@mui/material';
import { createStyles, makeStyles } from '@mui/styles';
import { Theme } from '@mui/material/styles';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import StopIcon from '@mui/icons-material/Stop';
import { useHistory } from 'react-router-dom';
import { useBreadcrumbStyles } from '../../hooks/useBreadcrumbStyles';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    container: {
      padding: theme.spacing(2),
    },
    videoContainer: {
      position: 'relative',
      width: '100%',
      maxWidth: 800,
      margin: '0 auto',
      marginTop: theme.spacing(2),
    },
    video: {
      width: '100%',
      height: 'auto',
      border: '2px solid #ccc',
      borderRadius: 8,
    },
    canvas: {
      position: 'absolute',
      top: 0,
      left: 0,
      pointerEvents: 'none',
    },
    controls: {
      display: 'flex',
      justifyContent: 'center',
      gap: theme.spacing(2),
      marginTop: theme.spacing(2),
    },
    infoBox: {
      marginTop: theme.spacing(2),
      padding: theme.spacing(2),
    },
    gridPreview: {
      marginTop: theme.spacing(2),
      padding: theme.spacing(2),
    },
    cellGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(7, 1fr)',
      gap: 4,
      maxWidth: 400,
      margin: '0 auto',
    },
    cell: {
      width: '100%',
      paddingBottom: '100%',
      backgroundColor: '#f0f0f0',
      border: '1px solid #ccc',
      position: 'relative',
    },
    cellStamped: {
      backgroundColor: '#4caf50',
    },
  })
);

interface GridData {
  rows: number;
  cols: number;
  cells: boolean[][]; // true = stamped, false = empty
}

const CardScanner = () => {
  const classes = useStyles();
  const breadcrumbClasses = useBreadcrumbStyles();
  const history = useHistory();
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [gridData, setGridData] = useState<GridData | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  const startCamera = async () => {
    try {
      setError(null);
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: 1280, height: 720 }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        setStream(mediaStream);
        setIsRecording(true);
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      setError('Failed to access camera. Please check permissions.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsRecording(false);
  };

  const processFrame = () => {
    if (!videoRef.current || !canvasRef.current || !isRecording) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video frame to canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Check if OpenCV is loaded
    if (typeof cv === 'undefined') {
      console.log('OpenCV.js not yet loaded');
      setTimeout(processFrame, 100);
      return;
    }

    try {
      // Get image data from canvas
      const src = cv.imread(canvas);
      
      // Convert to grayscale
      const gray = new cv.Mat();
      cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);
      
      // Apply Gaussian blur
      const blurred = new cv.Mat();
      cv.GaussianBlur(gray, blurred, new cv.Size(5, 5), 0);
      
      // Edge detection with Canny
      const edges = new cv.Mat();
      cv.Canny(blurred, edges, 50, 150);
      
      // Find contours
      const contours = new cv.MatVector();
      const hierarchy = new cv.Mat();
      cv.findContours(edges, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);
      
      // Find the largest quadrilateral
      let maxArea = 0;
      let bestContour = null;
      
      for (let i = 0; i < contours.size(); i++) {
        const contour = contours.get(i);
        const area = cv.contourArea(contour);
        
        if (area > maxArea && area > 10000) { // Minimum area threshold
          const peri = cv.arcLength(contour, true);
          const approx = new cv.Mat();
          cv.approxPolyDP(contour, approx, 0.02 * peri, true);
          
          if (approx.rows === 4) {
            maxArea = area;
            if (bestContour) bestContour.delete();
            bestContour = approx;
          } else {
            approx.delete();
          }
        }
      }
      
      if (bestContour) {
        // Draw the detected quadrilateral
        const color = new cv.Scalar(0, 255, 0, 255);
        const pts = new cv.MatVector();
        pts.push_back(bestContour);
        cv.drawContours(src, pts, 0, color, 3);
        
        // Perform perspective transform
        const srcPoints = cv.Mat.zeros(4, 1, cv.CV_32FC2);
        for (let i = 0; i < 4; i++) {
          srcPoints.data32F[i * 2] = bestContour.data32S[i * 2];
          srcPoints.data32F[i * 2 + 1] = bestContour.data32S[i * 2 + 1];
        }
        
        // Define destination points (800x600 rectangle)
        const dstPoints = cv.matFromArray(4, 1, cv.CV_32FC2, [
          0, 0,
          800, 0,
          800, 600,
          0, 600
        ]);
        
        // Get perspective transform matrix
        const M = cv.getPerspectiveTransform(srcPoints, dstPoints);
        const warped = new cv.Mat();
        cv.warpPerspective(src, warped, M, new cv.Size(800, 600));
        
        // Extract grid cells (assuming 5 rows x 7 cols)
        extractGridCells(warped);
        
        // Cleanup
        M.delete();
        warped.delete();
        dstPoints.delete();
        srcPoints.delete();
        pts.delete();
        bestContour.delete();
      }
      
      // Display result
      cv.imshow(canvas, src);
      
      // Cleanup
      src.delete();
      gray.delete();
      blurred.delete();
      edges.delete();
      contours.delete();
      hierarchy.delete();
      
    } catch (err) {
      console.error('Error processing frame:', err);
    }

    // Continue processing
    if (isRecording) {
      requestAnimationFrame(processFrame);
    }
  };

  const extractGridCells = (warpedMat: any) => {
    const rows = 5;
    const cols = 7;
    const width = warpedMat.cols;
    const height = warpedMat.rows;
    const cellWidth = width / cols;
    const cellHeight = height / rows;
    
    const cells: boolean[][] = [];
    
    for (let row = 0; row < rows; row++) {
      cells[row] = [];
      for (let col = 0; col < cols; col++) {
        const x = Math.floor(col * cellWidth);
        const y = Math.floor(row * cellHeight);
        const w = Math.floor(cellWidth);
        const h = Math.floor(cellHeight);
        
        try {
          // Extract cell region
          const roi = warpedMat.roi(new cv.Rect(x, y, w, h));
          
          // Convert to grayscale if needed
          const gray = new cv.Mat();
          if (roi.channels() === 4) {
            cv.cvtColor(roi, gray, cv.COLOR_RGBA2GRAY);
          } else {
            roi.copyTo(gray);
          }
          
          // Calculate mean intensity
          const mean = cv.mean(gray);
          const intensity = mean[0];
          
          // Simple threshold: if mean intensity is below 128, consider it stamped
          cells[row][col] = intensity < 128;
          
          // Cleanup
          gray.delete();
          roi.delete();
        } catch (err) {
          console.error('Error extracting cell:', err);
          cells[row][col] = false;
        }
      }
    }
    
    setGridData({ rows, cols, cells });
  };

  useEffect(() => {
    if (isRecording) {
      processFrame();
    }
  }, [isRecording]);

  const handleBack = () => {
    history.push('/');
  };

  return (
    <div className={classes.container}>
      <Box px={1} py={2}>
        <Breadcrumbs aria-label="breadcrumb">
          <Typography color="textPrimary" className={breadcrumbClasses.link}>
            <CameraAltIcon className={breadcrumbClasses.icon} />
            Card Scanner
          </Typography>
        </Breadcrumbs>
      </Box>

      <Paper className={classes.infoBox}>
        <Typography variant="h6" gutterBottom>
          Card Scanner
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Use your camera to scan a card with a grid. The scanner will detect the grid and extract each cell.
        </Typography>
      </Paper>

      {error && (
        <Paper className={classes.infoBox} style={{ backgroundColor: '#ffebee' }}>
          <Typography color="error">{error}</Typography>
        </Paper>
      )}

      <div className={classes.videoContainer}>
        <video
          ref={videoRef}
          className={classes.video}
          autoPlay
          playsInline
          muted
        />
        <canvas
          ref={canvasRef}
          className={classes.canvas}
          style={{ display: isRecording ? 'block' : 'none' }}
        />
      </div>

      <div className={classes.controls}>
        {!isRecording ? (
          <Button
            variant="contained"
            color="primary"
            startIcon={<CameraAltIcon />}
            onClick={startCamera}
          >
            Start Camera
          </Button>
        ) : (
          <Button
            variant="contained"
            color="secondary"
            startIcon={<StopIcon />}
            onClick={stopCamera}
          >
            Stop Camera
          </Button>
        )}
        <Button variant="outlined" onClick={handleBack}>
          Back
        </Button>
      </div>

      {gridData && (
        <Paper className={classes.gridPreview}>
          <Typography variant="h6" gutterBottom>
            Detected Grid ({gridData.rows} x {gridData.cols})
          </Typography>
          <div className={classes.cellGrid}>
            {gridData.cells.flat().map((stamped, index) => (
              <div
                key={index}
                className={`${classes.cell} ${stamped ? classes.cellStamped : ''}`}
              />
            ))}
          </div>
        </Paper>
      )}
    </div>
  );
};

export default CardScanner;
