import { getVirtualPointPosition } from '@/features/image-frame-canvas/helpers'
import { useFocalPointContext } from '../context/focal-point-context'

export function AddPointOnCanvas() {
  const { setNewPoint, canvasTarget } = useFocalPointContext()

  function handleAddPointOnCanvasClick(e: React.MouseEvent<HTMLImageElement>) {
    canvasTarget.clearTarget()

    const rect = e.currentTarget.getBoundingClientRect()

    const pointPosition = getVirtualPointPosition(rect.width, {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    })

    setNewPoint((prev) => ({ ...prev!, position: pointPosition }))
  }

  return (
    <div
      className="absolute inset-0 z-50 cursor-crosshair rounded-[0.75rem]"
      onClick={handleAddPointOnCanvasClick}
    />
  )
}
