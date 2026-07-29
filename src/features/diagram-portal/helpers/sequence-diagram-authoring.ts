import { ComponentInputType } from '@/features/component-meta'
import { SEQUENCE_PARTICIPANT_COLOR } from '@uigraph/sdk'
import { Edge, Node } from '@xyflow/react'
import { generateUUID } from '../utils/uuid'
import {
  beautifySequenceDiagram,
  getNextSequenceRow,
} from './beautify-sequence-diagram'
import { DEFAULT_CONFIG, getRowY, rowHandleId } from './sequence-diagram-layout'

function nameField(value: string) {
  return {
    componentFieldId: 'name',
    type: ComponentInputType.TextInput,
    label: 'Name',
    data: [{ value }],
  }
}

/**
 * Where the next participant column should go: one column past whatever's
 * currently rightmost, inferring column width from the existing spacing
 * rather than a hardcoded constant (so a manually-widened diagram keeps its
 * own spacing). Shared between "Add participant" and sequence-aware
 * paste/duplicate — both need to append a new column consistently.
 */
export function getNextParticipantColumn(nodes: Node[]): {
  x: number
  columnWidth: number
} {
  const participants = [...nodes]
    .filter((n) => n.type === 'sequenceParticipant')
    .sort((a, b) => a.position.x - b.position.x)

  const columnWidth =
    participants.length >= 2
      ? Math.abs(participants[1].position.x - participants[0].position.x) ||
        DEFAULT_CONFIG.columnWidth
      : DEFAULT_CONFIG.columnWidth

  const x =
    participants.length > 0
      ? Math.max(...participants.map((p) => p.position.x)) + columnWidth
      : 0

  return { x, columnWidth }
}

export function createParticipantNode(nodes: Node[], name: string): Node {
  const { x } = getNextParticipantColumn(nodes)

  return {
    id: `participant-${generateUUID()}`,
    type: 'sequenceParticipant',
    position: { x, y: 0 },
    data: {
      style: { baseColor: SEQUENCE_PARTICIPANT_COLOR },
      componentFields: [nameField(name)],
    },
  }
}

/**
 * Appends a new message between two existing participants as the last row,
 * mirroring the SDK's own side/handle-id conventions verbatim (which side a
 * message attaches to, the `target-top`/`source-bottom` self-loop handles,
 * and the `rowIndex + 1` offset on a self-loop's return edge) rather than
 * inventing a new one — this is exactly what the Mermaid importer already
 * produces, just triggered by a form instead of parsed text.
 */
export function createMessage(
  nodes: Node[],
  edges: Edge[],
  fromParticipantId: string,
  toParticipantId: string,
  label: string
): { nodes: Node[]; edges: Edge[] } {
  const participantsById = new Map(
    nodes
      .filter((n) => n.type === 'sequenceParticipant')
      .map((p) => [p.id, p] as const)
  )
  const fromParticipant = participantsById.get(fromParticipantId)
  const toParticipant = participantsById.get(toParticipantId)
  if (!fromParticipant || !toParticipant) {
    return { nodes, edges }
  }

  const isSelf = fromParticipantId === toParticipantId
  const rowIndex = getNextSequenceRow(nodes, edges)

  const goesRight = fromParticipant.position.x < toParticipant.position.x
  const sourceSide = goesRight || isSelf ? 'right' : 'left'
  const targetSide = isSelf ? 'right' : goesRight ? 'left' : 'right'

  const messageId = `message-${generateUUID()}`

  const messageNode: Node = {
    id: messageId,
    type: 'shape',
    position: {
      x: 0,
      y:
        getRowY(rowIndex, DEFAULT_CONFIG) -
        DEFAULT_CONFIG.messageNodeHeight / 2,
    },
    data: {
      shape: 'rectangle',
      fill: '#f8fafc',
      stroke: '#CCCCCC',
      strokeWidth: 1,
      componentFields: [nameField(label)],
    },
    style: {
      width: DEFAULT_CONFIG.messageNodeWidth,
      height: DEFAULT_CONFIG.messageNodeHeight,
    },
  }

  const edgeA: Edge = {
    id: generateUUID(),
    source: fromParticipantId,
    target: messageId,
    sourceHandle: rowHandleId(rowIndex, sourceSide, 'source'),
    targetHandle: isSelf
      ? 'target-top'
      : sourceSide === 'right'
        ? 'target-left'
        : 'target-right',
    type: 'smoothstep',
  }

  const edgeB: Edge = {
    id: generateUUID(),
    source: messageId,
    target: toParticipantId,
    sourceHandle: isSelf
      ? 'source-bottom'
      : goesRight
        ? 'source-right'
        : 'source-left',
    targetHandle: rowHandleId(
      rowIndex + (isSelf ? 1 : 0),
      targetSide,
      'target'
    ),
    type: 'smoothstep',
  }

  return beautifySequenceDiagram(
    [...nodes, messageNode],
    [...edges, edgeA, edgeB]
  )
}

/**
 * Re-derives which side of each participant a message departs from and
 * arrives at, from the participants' *current* columns — the same rules
 * `createMessage` applies when a message is first authored. Reordering
 * participant columns flips those sides for every message that crossed the
 * moved column, and a stale side leaves the arrowhead pointing away from
 * the lifeline it's attached to.
 *
 * Only the side of a row handle is rewritten; its row number is left to
 * `renumberSequenceRows` (via beautify), which owns that half of the id.
 */
export function reorientSequenceMessages(nodes: Node[], edges: Edge[]): Edge[] {
  const participantsById = new Map(
    nodes
      .filter((n) => n.type === 'sequenceParticipant')
      .map((p) => [p.id, p] as const)
  )

  const links = new Map<string, { from?: string; to?: string }>()
  for (const edge of edges) {
    if (
      participantsById.has(edge.source) &&
      edge.target.startsWith('message-')
    ) {
      links.set(edge.target, { ...links.get(edge.target), from: edge.source })
    }
    if (
      edge.source.startsWith('message-') &&
      participantsById.has(edge.target)
    ) {
      links.set(edge.source, { ...links.get(edge.source), to: edge.target })
    }
  }

  return edges.map((edge) => {
    const outgoingLink = links.get(edge.source)
    const incomingLink = links.get(edge.target)
    const link = outgoingLink ?? incomingLink
    if (!link?.from || !link.to) return edge

    const fromParticipant = participantsById.get(link.from)
    const toParticipant = participantsById.get(link.to)
    if (!fromParticipant || !toParticipant) return edge

    const isSelf = link.from === link.to
    const goesRight = fromParticipant.position.x < toParticipant.position.x
    const sourceSide = goesRight || isSelf ? 'right' : 'left'
    const targetSide = isSelf ? 'right' : goesRight ? 'left' : 'right'

    if (outgoingLink) {
      return {
        ...edge,
        sourceHandle: isSelf
          ? 'source-bottom'
          : goesRight
            ? 'source-right'
            : 'source-left',
        targetHandle: edge.targetHandle?.replace(
          /^row-(\d+)-(left|right)-/,
          `row-$1-${targetSide}-`
        ),
      }
    }

    return {
      ...edge,
      sourceHandle: edge.sourceHandle?.replace(
        /^row-(\d+)-(left|right)-/,
        `row-$1-${sourceSide}-`
      ),
      targetHandle: isSelf
        ? 'target-top'
        : sourceSide === 'right'
          ? 'target-left'
          : 'target-right',
    }
  })
}
