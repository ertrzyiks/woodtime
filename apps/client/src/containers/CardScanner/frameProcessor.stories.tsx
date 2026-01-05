import * as React from 'react';
import {
  processVideoFrame,
  extractGridCellsFromMat,
  GridData,
} from './frameProcessor';

interface FrameProcessorSampleProps {
  imageData?: string;
}

const FrameProcessorSample = ({ imageData }: FrameProcessorSampleProps) => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const [gridData, setGridData] = React.useState<GridData | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [isProcessing, setIsProcessing] = React.useState(false);

  // Process image if provided via props
  React.useEffect(() => {
    if (!imageData || !canvasRef.current) return;

    setError(null);
    setIsProcessing(true);

    const img = new Image();
    img.onload = () => {
      if (!canvasRef.current) return;

      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        setError('Could not get canvas context');
        setIsProcessing(false);
        return;
      }

      // Draw the image on the canvas
      ctx.drawImage(img, 0, 0, 800, 600);

      // Wait for OpenCV to be loaded
      const checkAndProcess = () => {
        if (typeof window.cv === 'undefined') {
          setTimeout(checkAndProcess, 100);
          return;
        }

        // Process the frame
        try {
          const extractedGridData = (warpedMat: any, context?: any) => {
            const data = extractGridCellsFromMat(warpedMat, context);
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

    img.src = imageData;
  }, [imageData]);

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

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          setError('Could not get canvas context');
          setIsProcessing(false);
          return;
        }

        // Draw the image on the canvas
        ctx.drawImage(img, 0, 0, 800, 600);

        // Wait for OpenCV to be loaded
        const checkAndProcess = () => {
          if (typeof window.cv === 'undefined') {
            setTimeout(checkAndProcess, 100);
            return;
          }

          // Process the frame
          try {
            const extractedGridData = (warpedMat: any, context?: any) => {
              const data = extractGridCellsFromMat(warpedMat, context);
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
      <p>
        {imageData
          ? 'Processing provided card image.'
          : 'Upload an image of a card to test the frame processing pipeline.'}
      </p>

      {!imageData && (
        <form>
          <div style={{ marginBottom: '20px' }}>
            <label
              htmlFor="file-input"
              style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: 'bold',
              }}
            >
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
      )}

      {isProcessing && (
        <div style={{ marginBottom: '20px', color: '#666' }}>
          Processing image...
        </div>
      )}

      {error && (
        <div
          style={{
            marginBottom: '20px',
            padding: '12px',
            backgroundColor: '#ffebee',
            color: '#c62828',
            borderRadius: '4px',
          }}
        >
          Error: {error}
        </div>
      )}

      <div style={{ marginBottom: '20px' }}>
        <h3>Canvas Output:</h3>
        <canvas
          ref={canvasRef}
          width={800}
          height={600}
          style={{
            border: '2px solid #ccc',
            maxWidth: '100%',
            height: 'auto',
            display: 'block',
          }}
        />
      </div>

      {gridData && (
        <div style={{ marginTop: '20px' }}>
          <h3>
            Detected Grid ({gridData.rows} x {gridData.cols}):
          </h3>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${gridData.cols}, 1fr)`,
              gap: '4px',
              maxWidth: '400px',
            }}
          >
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

// Helper function to load image and convert to data URL
const loadImage = async (url: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }
      ctx.drawImage(img, 0, 0);
      resolve(canvas.toDataURL());
    };
    img.onerror = () => reject(new Error(`Failed to load image from ${url}`));
    img.src = url;
  });
};

export default {
  title: 'Pages/CardScanner/frameProcessor',
  component: FrameProcessorSample,
  decorators: [],
};

export const Default = () => {
  return <FrameProcessorSample />;
};

// Remote image URLs for card samples from Google Photos album
const CARD_IMAGES = {
  first: 'https://lh3.googleusercontent.com/rd-pw/AP1GczMgotKOF9lHBjNDFQ1tB8nVQu3-pkHm5MXNllmb-GILgdi3X2P7P9PG5IelMHyQ4JAm0_w3IAGz9Hv6onN5SBu3FzVQ9YiXm2NrwGNoSncVapkTm6Z6ji0nXoJMpq3NsQMIA5j-LsUk3Jt7pEkmtZ9swRwfh36em3j0w0kaYObu7SCM8d8IeKV2qKIPydIempKamPaAXmKfK80oIv9gb_GD1oKjkV72Fw0aj0jNT-lKJhqDGsv5x-ldBIHWL7zhnspB9AwBVJFxaYgnTqulsCFV-q9zBY2EKhtpW91gMXVfF08MurHhyPwC1dbinqfQBMyRwZEEKU5615kmIHtl-iEWG5JHkhTIxiWCDTAbtfWNrG-UwNnpUCidMfKbXAzwSUGpuS_fI1FUHMRvTCrs7_vEC6x91KHSZGVFZa5bP9cWh_DJ9k804K_TmIB5ysP3x_oWMAamu6WFjYo0FdEWnPtPDntFqj7U4RKfZSunm2iL5Qw2AClBbxT0iJr-BnG56hxYQPsbT8qd-uRt2opPffCjyHl-FUy_RBNOyXajLonTJVFZJVrbI33_WbZee6lYjR_K4K-E9M4SLLBHHyRU5b0yiR-4ejBhVkCt-5BXAO33LWwMsorUtye-7eNRvXAnPW88PDxH8vZNYKgZJuHzUvYSx8hoMf2WRM_ePtVHEsew6R3dKZT2CSGTpZnNvNREOBP75xM5lRSdHkPgfPFVMQTaSOybG1HVeKPQSx4rsO1SYLotK4JS1jFA1NSvTEqZzKnc3Dl0dFKKlSgfcWvV-AwBXlBeAYFlkqOxRHF-k8PZQkTvlTiYjk5Qy2bplAnEqBb2EUIAEjF-Mcf4TZY5pv-0xzoKJe1PXrpfWbAwg-XRCrMPbnry6MguicJNJmt7Cs36cqhdOPoTHW6w6ohzo_S_ix8w-kenrtG0ripFqmGgDbUCfcrHu98ut3LCUDN1nqTVnQW-spMi-O5B8GXgF2dYpURFHF7AhecoT33QWfx58LAb98W5xrpXNTd8Kpsefn9MjiwQmDdYZv5zunCKCbo4l-VyLnVZaerY1WZFmuNnfRxA0zw4K119gKjXvtnLAzxgPX-jDdQQcXNiwMdsyG3KzwshRf18Ypgw8NamKKISqGLTPnPdkq5uGZ2KDrZqQTBsA9ugh7iz_YFmbtzN0AiW4g_tt0VMg8ssM7Is7SV0Lx4=s2522-w2522-h1892-s-no-gm?authuser=0',
};

// Story with first card from Google Photos album
export const FirstCard = {
  loaders: [
    async () => ({
      imageData: await loadImage(CARD_IMAGES.first),
    }),
  ],
  render: (args: any, { loaded }: any) => {
    return <FrameProcessorSample imageData={loaded.imageData} />;
  },
};
