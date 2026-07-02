import {
  getVirtualPointPosition,
  getVirtualPointSize,
} from '@/features/image-frame-canvas/helpers'
import { useEffect, useRef, useState } from 'react'
import { useFocalPointContext } from '../context/focal-point-context'

type Point = {
  x: number
  y: number
}

export function DrawOnCanvas() {
  const { setDrawRectMode } = useFocalPointContext()
  const containerRef = useRef<HTMLDivElement>(null)

  const [containerRect, setContainerRect] = useState<DOMRect | null>(null)
  const [mouseDownPoint, setMouseDownPoint] = useState<Point | null>(null)
  const [currentPoint, setCurrentPoint] = useState<Point | null>(null)

  useEffect(() => {
    const container = containerRef.current!
    if (!container) return

    setContainerRect(container.getBoundingClientRect())
    let mouseDownPoint: Point | null = null

    function handleMouseDown(e: MouseEvent) {
      mouseDownPoint = { x: e.clientX, y: e.clientY }
      setMouseDownPoint(mouseDownPoint)
    }

    function handleMouseMove(e: MouseEvent) {
      setCurrentPoint({ x: e.clientX, y: e.clientY })
    }

    function handleMouseUp(e: MouseEvent) {
      setCurrentPoint(null)
      if (!mouseDownPoint) {
        return setMouseDownPoint(null)
      }

      container.removeEventListener('mousedown', handleMouseDown)
      container.removeEventListener('mousemove', handleMouseMove)
      container.removeEventListener('mouseup', handleMouseUp)

      const currentX = e.clientX
      const currentY = e.clientY
      const mouseDownX = mouseDownPoint.x
      const mouseDownY = mouseDownPoint.y

      const rect = container.getBoundingClientRect()
      const pointPosition = getVirtualPointPosition(rect.width, {
        x: mouseDownX - rect.left,
        y: mouseDownY - rect.top,
      })

      const pointSize = getVirtualPointSize(
        rect.width,
        Math.abs(mouseDownX - currentX),
        Math.abs(mouseDownY - currentY)
      )

      setDrawRectMode((prev) => ({
        ...prev!,
        position: {
          ...pointPosition,
          ...pointSize,
        },
      }))
    }

    container.addEventListener('mousedown', handleMouseDown)
    container.addEventListener('mousemove', handleMouseMove)
    container.addEventListener('mouseup', handleMouseUp)

    return () => {
      container.removeEventListener('mousedown', handleMouseDown)
      container.removeEventListener('mousemove', handleMouseMove)
      container.removeEventListener('mouseup', handleMouseUp)
    }
  }, [setDrawRectMode])

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 z-50 rounded-[0.75rem] bg-red-500/50 select-none"
    >
      {mouseDownPoint && currentPoint && (
        <div
          className="bg-opacity-20 absolute border-2 border-dashed border-blue-500 bg-blue-100"
          style={{
            left: mouseDownPoint.x - (containerRect?.left ?? 0),
            top: mouseDownPoint.y - (containerRect?.top ?? 0),
            width: Math.abs(currentPoint.x - mouseDownPoint.x),
            height: Math.abs(currentPoint.y - mouseDownPoint.y),
          }}
        />
      )}
    </div>
  )
}
