import * as React from 'react'
import {useEffect, useRef, useState} from 'react'
import * as Tesseract from 'tesseract.js'

export interface Props {
  onRead: (value: string) => void
}

const Scanner = ({ onRead }: Props) => {
  const canvasRef = useRef<HTMLCanvasElement>()
  const videoRef = useRef<HTMLVideoElement>()
  const [stream, setStream] = useState<MediaStream|null>(null)

  if (!canvasRef.current) {
    canvasRef.current = document.createElement('canvas')
  }

  useEffect(() => {
    let ignored = false

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

      console.log('navigator.MediaDevices.getUserMedia error: ', error.message, error.name);
    }

    navigator.mediaDevices.getUserMedia({ audio: false, video: true }).then(handleSuccess).catch(handleError)

    return () => {
      ignored = true

      if (stream) {
        stream.getTracks().forEach(track => {
          track.stop()
        })
      }
    }
  }, [videoRef])


  useEffect(() => {
    const ref = setInterval(() => {
      const canvas = canvasRef.current
      const video = videoRef.current
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height)
      const image = canvas.toDataURL()
      Tesseract.recognize(
        image,
        'pol',
        // { logger: m => console.log(m) }
      ).then(({ data: { text } }) => {
        onRead(text)
      })
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
