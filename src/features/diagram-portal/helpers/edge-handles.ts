import { Edge, Node } from '@xyflow/react'
import {
  getAbsoluteRect,
  pickHandleSide,
  positionToHandleId,
} from './node-geometry'

const HANDLE_FIXABLE_EDGE_TYPES = new Set<string | undefined>([
  undefined,
  'default',
  'straight',
  'step',
  'smoothstep',
  'simplebezier',
])

function isSequenceEndpoint(node: Node): boolean {
  return node.type === 'sequenceParticipant' || node.id.startsWith('message-')
}

/**
 * Recomputes `sourceHandle`/`targetHandle` for edges between fixed-8-handle
 * nodes (NodeContainer / GroupNode) based on the nodes' *current* relative
 * positions. Fixes the "zigzag" bug where an edge stays pinned to a stale
 * handle after a layout pass repositions its endpoints.
 *
 * Deliberately skips:
 * - `type: 'dynamic'` edges — they already pick their handle side live every
 *   render via getEdgeParams(), so touching sourceHandle/targetHandle here
 *   would be inert.
 * - edges with `data.handlesLocked` — opt-out seam for manually-routed edges.
 * - edges touching sequence-diagram nodes — those use row-based handle ids
 *   (`row-{n}-{side}-{type}`), not the compass pattern.
 */
export function fixEdgeHandles(nodes: Node[], edges: Edge[]): Edge[] {
  const nodesById = new Map(nodes.map((n) => [n.id, n]))

  return edges.map((edge) => {
    if (edge.data?.handlesLocked) return edge
    if (!HANDLE_FIXABLE_EDGE_TYPES.has(edge.type)) return edge

    const source = nodesById.get(edge.source)
    const target = nodesById.get(edge.target)
    if (!source || !target) return edge
    if (isSequenceEndpoint(source) || isSequenceEndpoint(target)) return edge

    const sourceRect = getAbsoluteRect(source, nodesById)
    const targetRect = getAbsoluteRect(target, nodesById)

    const sourceSide = pickHandleSide(sourceRect, targetRect)
    const targetSide = pickHandleSide(targetRect, sourceRect)

    return {
      ...edge,
      sourceHandle: positionToHandleId(sourceSide, 'source'),
      targetHandle: positionToHandleId(targetSide, 'target'),
    }
  })
}
