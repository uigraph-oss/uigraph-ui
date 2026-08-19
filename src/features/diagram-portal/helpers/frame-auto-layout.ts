import { Node } from '@xyflow/react'

const AUTO_LAYOUT_PAD_X = 16
const AUTO_LAYOUT_PAD_LABEL = 44
const AUTO_LAYOUT_PAD_PLAIN = 16

export type FrameLabelSide = 'top' | 'bottom'

export function computeFrameAutoLayout(
  nodes: Node[],
  frameId: string,
  labelSide: FrameLabelSide
) {
  const frame = nodes.find((node) => node.id === frameId)
  if (!frame) return null

  const children = nodes.filter((node) => node.parentId === frameId)
  if (children.length === 0) return null

  const padTop =
    labelSide === 'top' ? AUTO_LAYOUT_PAD_LABEL : AUTO_LAYOUT_PAD_PLAIN
  const padBottom =
    labelSide === 'bottom' ? AUTO_LAYOUT_PAD_LABEL : AUTO_LAYOUT_PAD_PLAIN

  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity

  for (const child of children) {
    const width = child.measured?.width ?? child.width ?? 0
    const height = child.measured?.height ?? child.height ?? 0
    minX = Math.min(minX, child.position.x)
    minY = Math.min(minY, child.position.y)
    maxX = Math.max(maxX, child.position.x + width)
    maxY = Math.max(maxY, child.position.y + height)
  }

  const shiftX = AUTO_LAYOUT_PAD_X - minX
  const shiftY = padTop - minY

  const nextWidth = maxX - minX + AUTO_LAYOUT_PAD_X * 2
  const nextHeight = maxY - minY + padTop + padBottom

  const currentWidth =
    frame.width ??
    frame.measured?.width ??
    (frame.style?.width as number | undefined) ??
    0
  const currentHeight =
    frame.height ??
    frame.measured?.height ??
    (frame.style?.height as number | undefined) ??
    0

  const isConverged =
    Math.abs(shiftX) < 0.5 &&
    Math.abs(shiftY) < 0.5 &&
    Math.abs(nextWidth - currentWidth) < 0.5 &&
    Math.abs(nextHeight - currentHeight) < 0.5

  if (isConverged) return null

  const childIds = new Set(children.map((child) => child.id))

  return nodes.map((node) => {
    if (node.id === frameId) {
      return {
        ...node,
        position: {
          x: node.position.x - shiftX,
          y: node.position.y - shiftY,
        },
        width: nextWidth,
        height: nextHeight,
        style: { ...node.style, width: nextWidth, height: nextHeight },
      }
    }

    if (childIds.has(node.id)) {
      return {
        ...node,
        position: {
          x: node.position.x + shiftX,
          y: node.position.y + shiftY,
        },
      }
    }

    return node
  })
}
