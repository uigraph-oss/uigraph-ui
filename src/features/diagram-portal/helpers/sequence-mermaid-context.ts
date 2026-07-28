import { buildMetaData, flattenMetaData } from '@uigraph/sdk'
import { Node } from '@xyflow/react'
import { TComponentField } from '../types/component-fields'

/**
 * Sequence mermaid text is otherwise fully self-describing on round-trip —
 * the one piece of state(TODO) it can't carry is each participant's custom color
 * (set via the node's color picker), so that's all this context preserves.
 */
export type SequenceMermaidContext = {
  participants?: Record<string, { color?: string }>
}

export function buildSequenceMermaidContext(
  nodes: Node[]
): SequenceMermaidContext {
  const participants: Record<string, { color?: string }> = {}

  for (const node of nodes) {
    if (node.type !== 'sequenceParticipant') continue

    const fields = (node.data?.componentFields ?? []) as TComponentField[]
    const meta = flattenMetaData(fields, fields)

    const name = typeof meta.name === 'string' ? meta.name : undefined
    const color = typeof meta.color === 'string' ? meta.color : undefined

    if (name && color) participants[name] = { color }
  }

  return { participants }
}

export function applySequenceMermaidContext(
  nodes: Node[],
  parsedContext: unknown
): Node[] {
  if (
    parsedContext === null ||
    typeof parsedContext !== 'object' ||
    Array.isArray(parsedContext)
  ) {
    return nodes
  }

  const participants = (parsedContext as SequenceMermaidContext).participants
  if (!participants || typeof participants !== 'object') return nodes

  return nodes.map((node) => {
    if (node.type !== 'sequenceParticipant') return node

    const fields = (node.data?.componentFields ?? []) as TComponentField[]
    const meta = flattenMetaData(fields, fields)
    const name = typeof meta.name === 'string' ? meta.name : undefined
    const color = name ? participants[name]?.color : undefined

    if (!color) return node

    return {
      ...node,
      data: {
        ...node.data,
        componentFields: buildMetaData(fields, { ...meta, color }),
      },
    }
  })
}
