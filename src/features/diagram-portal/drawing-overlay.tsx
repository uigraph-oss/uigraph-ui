'use client'

import { useCallback, useState } from 'react'

interface DrawingOverlayProps {
  isDrawing: boolean
  onDrawComplete: (bounds: {
    x: number
    y: number
    width: number
    height: number
  }) => void
}

export function DrawingOverlay({
  isDrawing,
  onDrawComplete,
}: DrawingOverlayProps) {
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(
    null
  )
  const [currentPoint, setCurrentPoint] = useState<{
    x: number
    y: number
  } | null>(null)

  const handleMouseDown = useCallback(
    (event: React.MouseEvent) => {
      if (!isDrawing) return

      const rect = event.currentTarget.getBoundingClientRect()
      const x = event.clientX - rect.left
      const y = event.clientY - rect.top

      setStartPoint({ x, y })
      setCurrentPoint({ x, y })
    },
    [isDrawing]
  )

  const handleMouseMove = useCallback(
    (event: React.MouseEvent) => {
      if (!isDrawing || !startPoint) return

      const rect = event.currentTarget.getBoundingClientRect()
      const x = event.clientX - rect.left
      const y = event.clientY - rect.top

      setCurrentPoint({ x, y })
    },
    [isDrawing, startPoint]
  )

  const handleMouseUp = useCallback(() => {
    if (!isDrawing || !startPoint || !currentPoint) return

    const bounds = {
      x: Math.min(startPoint.x, currentPoint.x),
      y: Math.min(startPoint.y, currentPoint.y),
      width: Math.abs(currentPoint.x - startPoint.x),
      height: Math.abs(currentPoint.y - startPoint.y),
    }

    if (bounds.width > 50 && bounds.height > 50) {
      onDrawComplete(bounds)
    }

    setStartPoint(null)
    setCurrentPoint(null)
  }, [isDrawing, startPoint, currentPoint, onDrawComplete])

  if (!isDrawing) return null

  return (
    <div
      className="absolute inset-0 z-20"
      style={{ cursor: isDrawing ? 'crosshair' : 'default' }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      {startPoint && currentPoint && (
        <div
          className="bg-opacity-20 absolute border-2 border-dashed border-blue-500 bg-blue-100"
          style={{
            left: Math.min(startPoint.x, currentPoint.x),
            top: Math.min(startPoint.y, currentPoint.y),
            width: Math.abs(currentPoint.x - startPoint.x),
            height: Math.abs(currentPoint.y - startPoint.y),
          }}
        />
      )}
    </div>
  )
}
