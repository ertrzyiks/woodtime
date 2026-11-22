import { useState, useRef, useEffect, useCallback } from 'react';
import { Box, Button, Paper, Typography, Breadcrumbs } from '@mui/material';
import { createStyles, makeStyles } from '@mui/styles';
import { Theme } from '@mui/material/styles';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import StopIcon from '@mui/icons-material/Stop';
import { useHistory } from 'react-router-dom';
import { useBreadcrumbStyles } from '../../hooks/useBreadcrumbStyles';
import { CardReaderClient, OPENCV_INTEGRITY, OPENCV_URL } from './cardReader';
import referenceCardUrl from './reference/reference-card.jpg?url';

/** Stamped state of the 3 x 10 cell grid, row 0 is the top row of the card. */
interface GridData {
  rows: number;
  cols: number;
  cells: boolean[][];
}

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
      gridTemplateColumns: 'repeat(10, 1fr)',
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
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
  const [showOverlay, setShowOverlay] = useState(false);
  // Mirrors showOverlay for the frame loop, which does not re-create on change.
  const showOverlayRef = useRef(false);
  showOverlayRef.current = showOverlay;
  const animationFrameRef = useRef<number | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [gridData, setGridData] = useState<GridData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isReaderReady, setIsReaderReady] = useState(false);
  // The card reader runs in a Web Worker; it is created once per page.
  const readerRef = useRef<CardReaderClient | null>(null);

  useEffect(() => {
    const reader = new CardReaderClient({
      opencvUrl: OPENCV_URL,
      opencvIntegrity: OPENCV_INTEGRITY,
      referenceUrl: referenceCardUrl,
    });
    readerRef.current = reader;
    reader
      .whenReady()
      .then(() => setIsReaderReady(true))
      .catch((err) => {
        console.error('Card reader failed to load:', err);
        setError('The card reader could not be loaded.');
      });
    return () => {
      reader.terminate();
      readerRef.current = null;
    };
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

  const processFrame = useCallback(() => {
    const video = videoRef.current;
    const reader = readerRef.current;
    if (!video || !reader || !isRecording) return;

    const scheduleNext = () => {
      animationFrameRef.current = requestAnimationFrame(processFrame);
    };

    // Skip this frame if the video has no picture yet or the worker is still busy.
    if (video.videoWidth === 0 || !reader.isReady || reader.isBusy) {
      scheduleNext();
      return;
    }

    createImageBitmap(video)
      .then((bitmap) => reader.read(bitmap, showOverlayRef.current))
      .then((result) => {
        if (!result.aligned) return;
        setGridData({ rows: 3, cols: 10, cells: result.grid });
        const overlayCanvas = overlayCanvasRef.current;
        if (result.overlay && overlayCanvas) {
          overlayCanvas.width = result.overlay.width;
          overlayCanvas.height = result.overlay.height;
          overlayCanvas.getContext('2d')?.drawImage(result.overlay, 0, 0);
          result.overlay.close();
        }
      })
      .catch((err) => {
        if (err instanceof Error && err.message === 'Reader is busy') return;
        console.warn('Skipping camera frame:', err);
      });

    scheduleNext();
  }, [isRecording]);

  useEffect(() => {
    if (isRecording && isReaderReady) {
      processFrame();
    }
  }, [isRecording, isReaderReady, processFrame]);

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
        <Button
          variant={showOverlay ? 'contained' : 'outlined'}
          onClick={() => setShowOverlay((v) => !v)}
        >
          {showOverlay ? 'Hide overlay' : 'Show overlay'}
        </Button>
        <Button variant="outlined" onClick={handleBack}>
          Back
        </Button>
      </div>

      {showOverlay && (
        <Paper style={{ padding: 8, marginTop: 8 }}>
          <Typography variant="h6" gutterBottom>
            Debug overlay
          </Typography>
          <Typography variant="body2" gutterBottom>
            Green frame: stamped. Orange frame: empty. Red circle: detected
            hole. Yellow dots: alignment matches.
          </Typography>
          <canvas
            ref={overlayCanvasRef}
            style={{ width: '100%', height: 'auto', display: 'block' }}
          />
        </Paper>
      )}

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
