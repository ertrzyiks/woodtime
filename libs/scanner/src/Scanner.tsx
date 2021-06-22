import * as React from 'react'
import {useEffect, useRef, useState} from 'react'
import {Worker} from "tesseract.js";
import {prepareImage} from "./prepareImage";
import {scan, buildWorker} from "./scan";
import {detectHarpus} from "./detectHarpus";

export interface Props {
  onRead: (value: { id: number, code: string }) => void
}

const Scanner = ({ onRead }: Props) => {
  const workerRef = useRef<Worker>()
  const canvasRef = useRef<HTMLCanvasElement>()
  const videoRef = useRef<HTMLVideoElement>()
  const [stream, setStream] = useState<MediaStream|null>(null)

  if (!canvasRef.current) {
    canvasRef.current = document.createElement('canvas')
  }

  useEffect (() => {
    buildWorker().then(w => workerRef.current = w)

    return () => {
      workerRef.current && workerRef.current.terminate()
    }
  }, [workerRef])

  useEffect(() => {
    let ignored = false

    const cleanUp = () => {
      ignored = true

      if (stream) {
        stream.getTracks().forEach(track => {
          track.stop()
        })
      }
    }

    if (stream) {
      return cleanUp
    }

    const video = videoRef.current

    function handleSuccess(stream: MediaStream) {
      if (ignored) {
        return
      }

      setStream(stream)
      video.srcObject = stream
    }

    function handleError(error: Error) {
      if (ignored) {
        return
      }

      console.log('navigator.MediaDevices.getUserMedia error: ', error);
    }

    const constraints = navigator.mediaDevices.getSupportedConstraints()
    navigator.mediaDevices.getUserMedia({
      audio: false,
      video: {
        width: { exact: 320 },
        height: { exact: 240 },
        ...(constraints.facingMode ? {  facingMode: 'environment' } : {})
      }
    }).then(handleSuccess).catch(handleError)

    return cleanUp
  }, [stream, videoRef])


  useEffect(() => {
    const ref = setInterval(async () => {
      const canvas = canvasRef.current
      const video = videoRef.current
      if (video.videoWidth === 0 || video.videoHeight === 0) {
        return
      }

      canvas.width = video.videoWidth
      canvas.height = video.videoHeight

      const ctx = canvas.getContext('2d')
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

      prepareImage(ctx)

      if (!workerRef.current) {
        return
      }

      const text = await scan(workerRef.current, canvas.toDataURL())
      const point = detectHarpus(text)

      if (point) {
        onRead(point)
      }
    }, 1000)

    return () => {
      clearInterval(ref)
    }
  }, [canvasRef, videoRef])

  return (
    <video playsInline autoPlay ref={videoRef} style={{ width: '100%', height: 'calc(var(--width) * 0.75)' }}></video>
  )
}

export default Scanner
