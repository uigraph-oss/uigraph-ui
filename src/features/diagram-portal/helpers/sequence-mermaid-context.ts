import { flattenMetaData } from '@uigraph/sdk'
import { Node } from '@xyflow/react'
import { TComponentField } from '../types/component-fields'

export type SequenceMermaidContext = {
  participants?: Record<string, { color?: string }>
}

function participantName(node: Node): string | undefined {
  const fields = (node.data?.componentFields ?? []) as TComponentField[]
  const meta = flattenMetaData(fields, fields)

  if (typeof meta.name === 'string') return meta.name
  if (typeof node.data?.label === 'string') return node.data.label
  return undefined
}

export function buildSequenceMermaidContext(
  nodes: Node[]
): SequenceMermaidContext {
  const participants: Record<string, { color?: string }> = {}

  for (const node of nodes) {
    if (node.type !== 'sequenceParticipant') continue

    const name = participantName(node)
    const color = (node.data?.style as { baseColor?: string } | undefined)
      ?.baseColor

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

    const name = participantName(node)
    const color = name ? participants[name]?.color : undefined

    if (!color) return node

    return {
      ...node,
      data: {
        ...node.data,
        style: {
          ...(node.data?.style as Record<string, unknown> | undefined),
          baseColor: color,
        },
      },
    }
  })
}
