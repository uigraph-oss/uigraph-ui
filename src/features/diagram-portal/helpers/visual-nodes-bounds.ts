import { getNodesBounds, Node } from '@xyflow/react'

export function getVisualNodesBounds(nodes: Node[]) {
  const container = document.querySelector<HTMLElement>('.react-flow')
  const viewportElement = document.querySelector<HTMLElement>(
    '.react-flow__viewport'
  )

  if (!container || !viewportElement) {
    return getNodesBounds(nodes)
  }

  const transform = new DOMMatrixReadOnly(
    getComputedStyle(viewportElement).transform
  )
  const zoom = transform.a

  if (zoom === 0) {
    return getNodesBounds(nodes)
  }

  const containerRect = container.getBoundingClientRect()

  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity

  for (const nodeElement of container.querySelectorAll<HTMLElement>(
    '.react-flow__node'
  )) {
    for (const element of [
      nodeElement,
      ...nodeElement.querySelectorAll<HTMLElement>('*'),
    ]) {
      if (element.classList.contains('react-flow__handle')) continue

      const rect = element.getBoundingClientRect()
      if (rect.width === 0 && rect.height === 0) continue

      minX = Math.min(minX, rect.left)
      minY = Math.min(minY, rect.top)
      maxX = Math.max(maxX, rect.right)
      maxY = Math.max(maxY, rect.bottom)
    }
  }

  if (minX === Infinity) {
    return getNodesBounds(nodes)
  }

  return {
    x: (minX - containerRect.left - transform.e) / zoom,
    y: (minY - containerRect.top - transform.f) / zoom,
    width: (maxX - minX) / zoom,
    height: (maxY - minY) / zoom,
  }
}
