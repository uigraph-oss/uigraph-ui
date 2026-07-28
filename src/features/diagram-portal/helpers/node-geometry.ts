import { Node, Position } from '@xyflow/react'

export type Rect = { x: number; y: number; width: number; height: number }

const MAX_PARENT_CHAIN_DEPTH = 32

/**
 * Resolves a node's canvas-absolute position by walking its `parentId` chain.
 * `node.position` is only absolute for top-level nodes; nested nodes store
 * positions relative to their immediate parent.
 */
export function resolveAbsolutePosition(
  node: Node,
  nodesById: Map<string, Node>
): { x: number; y: number } {
  let x = node.position.x
  let y = node.position.y
  let current = node
  let depth = 0

  while (current.parentId && depth < MAX_PARENT_CHAIN_DEPTH) {
    const parent = nodesById.get(current.parentId)
    if (!parent) break
    x += parent.position.x
    y += parent.position.y
    current = parent
    depth++
  }

  return { x, y }
}

/**
 * Measured-first size resolution. Assumes this runs after nodes have been
 * rendered/measured (e.g. gated on `useNodesInitialized()`), so no static
 * per-type fallback table is needed here.
 */
export function resolveMeasuredSize(node: Node): {
  width: number
  height: number
} {
  return {
    width: node.measured?.width ?? node.width ?? 0,
    height: node.measured?.height ?? node.height ?? 0,
  }
}

export function getAbsoluteRect(
  node: Node,
  nodesById: Map<string, Node>
): Rect {
  const { x, y } = resolveAbsolutePosition(node, nodesById)
  const { width, height } = resolveMeasuredSize(node)
  return { x, y, width, height }
}

function getRectCenter(rect: Rect) {
  return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 }
}

/**
 * Picks which side of `sourceRect` an edge should leave from, given the
 * relative position of `targetRect`. Ported from the center-comparison logic
 * in `helpers/floating-edge.ts`'s `getParams`, minus its InternalNode-only
 * handle-coordinate lookup — this variant works on plain rects so it can run
 * synchronously on a `Node[]` array right after a layout pass.
 */
export function pickHandleSide(sourceRect: Rect, targetRect: Rect): Position {
  const centerA = getRectCenter(sourceRect)
  const centerB = getRectCenter(targetRect)

  const horizontalDiff = Math.abs(centerA.x - centerB.x)
  const verticalDiff = Math.abs(centerA.y - centerB.y)

  if (horizontalDiff > verticalDiff) {
    return centerA.x > centerB.x ? Position.Left : Position.Right
  }
  return centerA.y > centerB.y ? Position.Top : Position.Bottom
}

/**
 * Maps a Position + handle kind to the `source-{side}` / `target-{side}`
 * handle id convention used by NodeContainer (node-card.tsx) and GroupNode.
 */
export function positionToHandleId(
  position: Position,
  kind: 'source' | 'target'
): string {
  return `${kind}-${position}`
}
