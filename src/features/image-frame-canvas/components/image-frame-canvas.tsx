/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable react/no-unknown-property */

import '../global.css'

import { DashboardFrame } from '@/features/dashboard-projects/api'
import { ReactNode, useEffect, useRef, useState } from 'react'

export type ImageFrameCanvasProps = {
  frame: DashboardFrame
  content?: ReactNode

  onEmptyClick?: () => void
  setCanvasSize?({ width, height }: { width: number; height: number }): void
}

export function ImageFrameCanvas({
  frame,
  content,
  onEmptyClick,
  setCanvasSize,
}: ImageFrameCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null)
  const [canvasWidth, setCanvasWidth] = useState(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const resizeObserver = new ResizeObserver(() => {
      setCanvasWidth(canvas.clientWidth)
    })

    setCanvasWidth(canvas.clientWidth)
    resizeObserver.observe(canvas)

    return () => resizeObserver.disconnect()
  }, [canvasRef])

  return (
    <div ref={canvasRef} className="canvas-container relative isolate w-full">
      <style jsx>{`
        .canvas-container {
          --frame-image-canvas-width: ${canvasWidth}px;
        }
      `}</style>

      <img
        src={frame.screenshotImageUrl ?? undefined}
        alt={frame.name ?? 'Default'}
        className="!h-auto !w-full rounded-sm"
        onClick={onEmptyClick}
        onLoad={(e) => {
          if (setCanvasSize) {
            const image = e.currentTarget
            setCanvasSize({
              width: image.naturalWidth,
              height: image.naturalHeight,
            })
          }
        }}
      />

      {content}
    </div>
  )
}
