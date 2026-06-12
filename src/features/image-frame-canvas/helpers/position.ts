import { FOCAL_POINT_RESOLUTION } from '../constants'

type VirtualViewPointInput = {
  x: number
  y: number
}

const CANVAS_WIDTH_VAR = 'var(--frame-image-canvas-width, 0)'

export function getViewPointPositionStyle(input: VirtualViewPointInput) {
  const yPosition = `calc((${input.y} / ${FOCAL_POINT_RESOLUTION}) * ${CANVAS_WIDTH_VAR})`
  const xPosition = `calc((${input.x} / ${FOCAL_POINT_RESOLUTION}) * ${CANVAS_WIDTH_VAR})`

  return {
    top: yPosition,
    left: xPosition,
  }
}

export function getViewPointSizeStyle(width: number, height: number) {
  const widthStyle = `calc((${width} / ${FOCAL_POINT_RESOLUTION}) * ${CANVAS_WIDTH_VAR})`
  const heightStyle = `calc((${height} / ${FOCAL_POINT_RESOLUTION}) * ${CANVAS_WIDTH_VAR})`

  return {
    width: widthStyle,
    height: heightStyle,
  }
}

export function getVirtualPointPosition(
  canvasWidth: number,
  input: VirtualViewPointInput
) {
  const scale = FOCAL_POINT_RESOLUTION / canvasWidth
  const simulatedX = Math.max(0, input.x * scale)
  const simulatedY = Math.max(0, input.y * scale)

  return {
    x: Math.min(FOCAL_POINT_RESOLUTION, simulatedX),
    y: simulatedY,
  }
}

export function getVirtualPointSize(
  canvasWidth: number,
  width: number,
  height: number
) {
  const scale = FOCAL_POINT_RESOLUTION / canvasWidth
  const simulatedWidth = Math.max(0, width * scale)
  const simulatedHeight = Math.max(0, height * scale)

  return {
    width: Math.min(FOCAL_POINT_RESOLUTION, simulatedWidth),
    height: simulatedHeight,
  }
}

export function isPointWithinRect(
  position: VirtualViewPointInput & { width: number; height: number },
  point: VirtualViewPointInput
): boolean {
  return (
    point.x >= position.x &&
    point.x <= position.x + position.width &&
    point.y >= position.y &&
    point.y <= position.y + position.height
  )
}
