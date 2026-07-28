import { Edge, Node } from '@xyflow/react'
import { applyAutoLayout } from './auto-layout'
import { beautifySequenceDiagram } from './beautify-sequence-diagram'
import { fixEdgeHandles } from './edge-handles'

function beautifyStandardDiagram(
  nodes: Node[],
  edges: Edge[],
  direction: 'LR' | 'TB'
): { nodes: Node[]; edges: Edge[] } {
  const laidOut = applyAutoLayout(nodes, edges, direction)

  // Prevent GroupNode's live `computeGroupAutoLayout` effect from
  // immediately re-fighting the box Beautify just computed for this group.
  const stabilized = laidOut.map((n) =>
    n.type === 'group' && n.data?.autoLayout
      ? { ...n, data: { ...n.data, autoLayout: false } }
      : n
  )

  const fixedEdges = fixEdgeHandles(stabilized, edges)

  return { nodes: stabilized, edges: fixedEdges }
}

/**
 * Cleans up an AI-generated or manually-arranged diagram: re-runs auto
 * layout, fixes edges that got pinned to a stale handle side after
 * repositioning, and (for sequence diagrams) fixes overlapping message rows.
 */
export function beautifyDiagram(
  nodes: Node[],
  edges: Edge[],
  direction: 'LR' | 'TB' = 'LR'
): { nodes: Node[]; edges: Edge[] } {
  const isSequenceDiagram = nodes.some((n) => n.type === 'sequenceParticipant')

  return isSequenceDiagram
    ? beautifySequenceDiagram(nodes, edges)
    : beautifyStandardDiagram(nodes, edges, direction)
}
