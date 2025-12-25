import * as React from 'react';
import { processVideoFrame, extractGridCellsFromMat, GridData } from './frameProcessor';

const FrameProcessorSample = () => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const [gridData, setGridData] = React.useState<GridData | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [isProcessing, setIsProcessing] = React.useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError(null);
    setIsProcessing(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        if (!canvasRef.current) return;

        const canvas = canvasRef.current;
        canvas.width = img.width;
        canvas.height = img.height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          setError('Could not get canvas context');
          setIsProcessing(false);
          return;
        }

        // Draw the image on the canvas
        ctx.drawImage(img, 0, 0);

        // Wait for OpenCV to be loaded
        const checkAndProcess = () => {
          if (typeof (window as any).cv === 'undefined') {
            setTimeout(checkAndProcess, 100);
            return;
          }

          // Process the frame
          try {
            const extractedGridData = (warpedMat: any) => {
              const data = extractGridCellsFromMat(warpedMat);
              setGridData(data);
            };

            const result = processVideoFrame(canvas, extractedGridData);
            if (!result) {
              setError('Failed to process frame');
            }
          } catch (err: any) {
            setError(err.message || 'Error processing frame');
          } finally {
            setIsProcessing(false);
          }
        };

        checkAndProcess();
      };

      img.onerror = () => {
        setError('Failed to load image');
        setIsProcessing(false);
      };

      img.src = e.target?.result as string;
    };

    reader.onerror = () => {
      setError('Failed to read file');
      setIsProcessing(false);
    };

    reader.readAsDataURL(file);
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Frame Processor Test</h2>
      <p>Upload an image of a card to test the frame processing pipeline.</p>
      
      <form>
        <div style={{ marginBottom: '20px' }}>
          <label htmlFor="file-input" style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
            Select Image:
          </label>
          <input
            id="file-input"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={isProcessing}
            style={{ padding: '8px' }}
          />
        </div>
      </form>

      {isProcessing && (
        <div style={{ marginBottom: '20px', color: '#666' }}>
          Processing image...
        </div>
      )}

      {error && (
        <div style={{ marginBottom: '20px', padding: '12px', backgroundColor: '#ffebee', color: '#c62828', borderRadius: '4px' }}>
          Error: {error}
        </div>
      )}

      <div style={{ marginBottom: '20px' }}>
        <h3>Canvas Output:</h3>
        <canvas
          ref={canvasRef}
          style={{ 
            border: '2px solid #ccc', 
            maxWidth: '100%', 
            height: 'auto',
            display: 'block'
          }}
        />
      </div>

      {gridData && (
        <div style={{ marginTop: '20px' }}>
          <h3>Detected Grid ({gridData.rows} x {gridData.cols}):</h3>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: `repeat(${gridData.cols}, 1fr)`, 
            gap: '4px',
            maxWidth: '400px'
          }}>
            {gridData.cells.flat().map((stamped, index) => (
              <div
                key={index}
                style={{
                  width: '100%',
                  paddingBottom: '100%',
                  backgroundColor: stamped ? '#4caf50' : '#f0f0f0',
                  border: '1px solid #ccc',
                  position: 'relative',
                }}
                title={stamped ? 'Stamped' : 'Empty'}
              />
            ))}
          </div>
          <p style={{ marginTop: '10px', fontSize: '14px', color: '#666' }}>
            Green = Stamped, Gray = Empty
          </p>
        </div>
      )}
    </div>
  );
};

export default {
  title: 'Pages/CardScanner/frameProcessor',
  component: FrameProcessorSample,
  decorators: [],
  loaders: [],
};

export const Default = () => {
  return <FrameProcessorSample />;
};

