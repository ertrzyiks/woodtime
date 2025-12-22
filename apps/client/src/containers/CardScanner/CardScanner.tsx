import { useState, useRef, useEffect, useCallback } from 'react';
import { Box, Button, Paper, Typography, Breadcrumbs } from '@mui/material';
import { createStyles, makeStyles } from '@mui/styles';
import { Theme } from '@mui/material/styles';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import StopIcon from '@mui/icons-material/Stop';
import { useHistory } from 'react-router-dom';
import { useBreadcrumbStyles } from '../../hooks/useBreadcrumbStyles';
import {
  processVideoFrame,
  extractGridCellsFromMat,
  GridData,
} from './frameProcessor';

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
      maxWidth: '100%',
      height: 'auto',
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
  }),
);

// TODO: Integrate TensorFlow.js for ML-based cell classification
// The @tensorflow/tfjs dependency is installed and ready for future enhancement
// to replace the simple intensity threshold with a trained model

const CardScanner = () => {
  const classes = useStyles();
  const breadcrumbClasses = useBreadcrumbStyles();
  const history = useHistory();

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [gridData, setGridData] = useState<GridData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isOpenCVLoaded, setIsOpenCVLoaded] = useState(false);

  // Check if OpenCV is loaded
  useEffect(() => {
    const checkOpenCV = () => {
      if (typeof cv !== 'undefined') {
        setIsOpenCVLoaded(true);
      } else {
        setTimeout(checkOpenCV, 100);
      }
    };
    checkOpenCV();
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [stream]);

  const startCamera = async () => {
    try {
      setError(null);
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: 1280, height: 720 },
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
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsRecording(false);
  };

  const extractGridCells = useCallback((warpedMat: any) => {
    const gridData = extractGridCellsFromMat(warpedMat);
    setGridData(gridData);
  }, []);

  const processFrame = useCallback(() => {
    if (!videoRef.current || !canvasRef.current || !isRecording) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    // Wait for video to have valid dimensions
    if (video.videoWidth === 0 || video.videoHeight === 0) {
      animationFrameRef.current = requestAnimationFrame(processFrame);
      return;
    }

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video frame to canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Check if OpenCV is loaded
    if (!isOpenCVLoaded) {
      animationFrameRef.current = requestAnimationFrame(processFrame);
      return;
    }

    // Process the frame
    processVideoFrame(canvas, extractGridCells);

    // Continue processing
    if (isRecording) {
      animationFrameRef.current = requestAnimationFrame(processFrame);
    }
  }, [isRecording, isOpenCVLoaded, extractGridCells]);

  useEffect(() => {
    if (isRecording && isOpenCVLoaded) {
      processFrame();
    }
  }, [isRecording, isOpenCVLoaded, processFrame]);

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
          Use your camera to scan a card with a grid. The scanner will detect
          the grid and extract each cell.
        </Typography>
      </Paper>

      {error && (
        <Paper
          className={classes.infoBox}
          style={{ backgroundColor: '#ffebee' }}
        >
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
