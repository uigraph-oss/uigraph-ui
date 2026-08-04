import { estimateSequenceMessageBoxSize, SEQUENCE_LAYOUT } from '@uigraph/sdk'
import { Edge, MarkerType, Node } from '@xyflow/react'
import { createEdgeMarker } from '../edges/helpers'
import { getComponentField } from '../hooks/use-component-field'
import { TComponentField } from '../types/component-fields'
import { DEFAULT_CONFIG } from './sequence-diagram-layout'

const ROW_HEIGHT_VERTICAL_PADDING = SEQUENCE_LAYOUT.ROW_VERTICAL_PADDING
const PARTICIPANT_CENTER_OFFSET = 5

type ParticipantLink = { from?: string; to?: string }

function buildMessageParticipantLinks(edges: Edge[]) {
  const links = new Map<string, ParticipantLink>()

  for (const e of edges) {
    if (
      e.source.startsWith('participant-') &&
      e.target.startsWith('message-')
    ) {
      const existing = links.get(e.target) ?? {}
      links.set(e.target, { ...existing, from: e.source })
    }
    if (
      e.source.startsWith('message-') &&
      e.target.startsWith('participant-')
    ) {
      const existing = links.get(e.source) ?? {}
      links.set(e.source, { ...existing, to: e.target })
    }
  }

  return links
}

function getMessageLabel(message: Node): string {
  const componentFields = message.data?.componentFields as
    (TComponentField | undefined | null)[] | undefined

  const fromFields = getComponentField<string>(componentFields, {
    componentFieldId: 'name',
  })

  return fromFields ?? (message.data?.label as string | undefined) ?? ''
}

const ROW_HANDLE_RE = /^row-\d+-(left|right)-(source|target)$/

function isSelfMessage(
  messageId: string,
  links: Map<string, ParticipantLink>
): boolean {
  const link = links.get(messageId)
  return Boolean(link?.from && link.from === link.to)
}

/** Messages and notes both occupy rows; frames and participants do not. */
function isRowItem(node: Node): boolean {
  return node.id.startsWith('message-') || node.id.startsWith('note-')
}

/**
 * A self-message occupies TWO rows, not one: it leaves its lifeline at row n
 * and returns to it at row n+1. Handing out a plain 0..n-1 sequence lets the
 * item after a self-loop claim the row that loop returns into, so both land on
 * the same point of the lifeline.
 */
function assignMessageRowIndices(
  nodes: Node[],
  links: Map<string, ParticipantLink>
): Map<string, number> {
  const ordered = nodes
    .filter(isRowItem)
    .sort((a, b) => a.position.y - b.position.y)

  const rowIndexByMessageId = new Map<string, number>()
  let row = 0
  for (const item of ordered) {
    rowIndexByMessageId.set(item.id, row)
    row += isSelfMessage(item.id, links) ? 2 : 1
  }

  return rowIndexByMessageId
}

type SequenceBlockData = {
  startRow: number
  endRow: number
  depth?: number
  sections?: Array<{ startRow: number; endRow: number }>
}

function getBlockData(node: Node): SequenceBlockData | undefined {
  const block = node.data?.sequenceBlock as SequenceBlockData | undefined
  if (!block) return undefined
  if (typeof block.startRow !== 'number') return undefined
  if (typeof block.endRow !== 'number') return undefined
  return block
}

/**
 * Row Y positions for the whole diagram. Rows are NOT a uniform grid once
 * `loop`/`alt`/`rect` frames are present: each frame needs label space above
 * its first row and a margin below its last, and every row after it shifts
 * down by that much. Mirrors the SDK's import-time grid so a Beautify pass
 * reproduces the imported layout instead of collapsing the frames.
 */
function buildRowYs(
  nodes: Node[],
  rowCount: number,
  rowHeight: number
): { tops: number[]; centers: number[]; height: number } {
  const padBefore = new Array<number>(rowCount + 1).fill(0)
  const padAfter = new Array<number>(rowCount + 1).fill(0)

  for (const node of nodes) {
    const block = getBlockData(node)
    if (!block) continue
    if (block.startRow > rowCount - 1) continue
    padBefore[block.startRow] +=
      SEQUENCE_LAYOUT.BLOCK_TOP_PADDING + SEQUENCE_LAYOUT.BLOCK_FRAME_GAP
    padAfter[Math.min(block.endRow, rowCount - 1)] +=
      SEQUENCE_LAYOUT.BLOCK_BOTTOM_PADDING
    for (const section of (block.sections ?? []).slice(1)) {
      if (section.startRow > rowCount - 1) continue
      padBefore[section.startRow] += SEQUENCE_LAYOUT.BLOCK_SECTION_PADDING
    }
  }

  const tops: number[] = []
  let y = SEQUENCE_LAYOUT.HEADER_HEIGHT
  for (let row = 0; row < rowCount; row++) {
    y += padBefore[row]
    tops.push(y)
    y += rowHeight + padAfter[row]
  }

  return { tops, centers: tops.map((top) => top + rowHeight / 2), height: y }
}

/**
 * The first free row below every existing message — i.e. where a newly
 * appended message belongs. Not the message count: self-messages own two
 * rows each.
 */
export function getNextSequenceRow(nodes: Node[], edges: Edge[]): number {
  const links = buildMessageParticipantLinks(edges)
  const rowIndexByMessageId = assignMessageRowIndices(nodes, links)

  let next = 0
  for (const [messageId, rowIndex] of rowIndexByMessageId) {
    next = Math.max(next, rowIndex + (isSelfMessage(messageId, links) ? 2 : 1))
  }

  return next
}

/**
 * Keeps edges' row-based handle ids (`row-{n}-{side}-{type}`) in sync with
 * where their message actually is. Only one endpoint per message-edge is
 * ever row-based (the other end, on the message node itself, is an ordinary
 * compass handle) — verified against the SDK's own edge-generation logic —
 * so this is a cheap string replace on the numeral, not a geometry recompute.
 * Needed any time the SET of messages (or their Y-order) changes: add,
 * delete, or drag-reorder all shift row indices out from under any edge
 * whose id string still encodes the old one.
 *
 * The one asymmetry: a self-message's return edge (message -> participant)
 * lands on row n+1, so it must be renumbered to its message's row PLUS one,
 * or the loop collapses onto the single row it departs from.
 */
export function renumberSequenceRows(
  nodes: Node[],
  edges: Edge[]
): { nodes: Node[]; edges: Edge[] } {
  const links = buildMessageParticipantLinks(edges)
  const rowIndexByMessageId = assignMessageRowIndices(nodes, links)

  if (rowIndexByMessageId.size === 0) {
    return { nodes, edges }
  }

  const updatedEdges = edges.map((edge) => {
    const outgoingRowIndex = rowIndexByMessageId.get(edge.source)
    const baseRowIndex =
      outgoingRowIndex ?? rowIndexByMessageId.get(edge.target)
    if (baseRowIndex === undefined) return edge

    const isReturnEdge =
      outgoingRowIndex !== undefined && isSelfMessage(edge.source, links)
    const rowIndex = isReturnEdge ? baseRowIndex + 1 : baseRowIndex

    let sourceHandle = edge.sourceHandle
    let targetHandle = edge.targetHandle
    let changed = false

    if (sourceHandle && ROW_HANDLE_RE.test(sourceHandle)) {
      sourceHandle = sourceHandle.replace(/^row-\d+-/, `row-${rowIndex}-`)
      changed = changed || sourceHandle !== edge.sourceHandle
    }
    if (targetHandle && ROW_HANDLE_RE.test(targetHandle)) {
      targetHandle = targetHandle.replace(/^row-\d+-/, `row-${rowIndex}-`)
      changed = changed || targetHandle !== edge.targetHandle
    }

    return changed ? { ...edge, sourceHandle, targetHandle } : edge
  })

  return { nodes, edges: updatedEdges }
}

function withMessageArrowheads(edges: Edge[]): Edge[] {
  return edges.map((edge) => {
    if (!edge.source.startsWith('message-')) return edge
    if (!edge.target.startsWith('participant-')) return edge
    if (edge.markerEnd !== undefined) return edge
    if (edge.markerStart !== undefined) return edge
    if (edge.data?.arrowType !== undefined) return edge

    return {
      ...edge,
      markerEnd: createEdgeMarker({ type: MarkerType.ArrowClosed }),
    }
  })
}

function computeMessageX(
  fromX: number,
  toX: number,
  messageWidth: number,
  isSelfMessage: boolean
): number {
  // Left edge, not centered: a self-message box centered on the offset
  // straddles its own lifeline once the label is wide enough, and the edges
  // then wrap around the outside of the box to reach its top/bottom handles.
  if (isSelfMessage) {
    return fromX + PARTICIPANT_CENTER_OFFSET + DEFAULT_CONFIG.selfLoopOffset
  }
  return (fromX + toX) / 2 + PARTICIPANT_CENTER_OFFSET - messageWidth / 2
}

/**
 * Recomputes sequence-diagram layout so wrapped/multi-line message labels
 * no longer overlap the row below them:
 *
 * - Each message's box is sized from its own label text (see
 *   `estimateSequenceMessageBoxSize`), instead of a fixed width — a fixed
 *   width is what causes the aggressive word-breaking wrap in AI/mermaid
 *   -imported diagrams.
 * - Row order is derived by sorting messages on their *current* Y position,
 *   not by inverting the row-placement formula — robust to manually dragged
 *   nodes or repeated Beautify passes, and needs no prior `rowHeight` state.
 * - A single uniform row height (tallest estimated box + padding) keeps
 *   every row's band tall enough for its message, which — combined with
 *   correct row ordering — guarantees no two messages ever overlap
 *   vertically.
 *
 * Participant column X positions are left untouched; only row spacing and
 * message sizing/X-centering are adjusted. Row-based edge handle ids are
 * kept in sync via `renumberSequenceRows` — required whenever the set of
 * messages or their Y-order changed (add/delete/reorder), and a no-op
 * otherwise.
 */
export function beautifySequenceDiagram(
  nodes: Node[],
  edges: Edge[]
): { nodes: Node[]; edges: Edge[] } {
  const participants = nodes.filter((n) => n.type === 'sequenceParticipant')
  const items = nodes.filter(isRowItem)

  if (participants.length === 0 || items.length === 0) {
    return { nodes, edges }
  }

  const links = buildMessageParticipantLinks(edges)
  const participantsById = new Map(participants.map((p) => [p.id, p]))

  const orderedItems = [...items].sort((a, b) => a.position.y - b.position.y)

  const sizesById = new Map(
    orderedItems.map((item) => [
      item.id,
      estimateSequenceMessageBoxSize(getMessageLabel(item)),
    ])
  )

  const rowHeight = Math.max(
    DEFAULT_CONFIG.rowHeight,
    ...orderedItems.map(
      (item) => sizesById.get(item.id)!.height + ROW_HEIGHT_VERTICAL_PADDING
    )
  )

  const rowIndexByItemId = assignMessageRowIndices(nodes, links)
  const rowCount = Math.max(
    ...[...rowIndexByItemId].map(
      ([id, row]) => row + (isSelfMessage(id, links) ? 2 : 1)
    )
  )
  const rows = buildRowYs(nodes, rowCount, rowHeight)

  const updatedItems = orderedItems.map((item) => {
    const size = sizesById.get(item.id)!
    const row = rowIndexByItemId.get(item.id)!
    const newY = rows.centers[row] - size.height / 2

    const link = links.get(item.id)
    const fromParticipant = link?.from
      ? participantsById.get(link.from)
      : undefined
    const toParticipant = link?.to ? participantsById.get(link.to) : undefined

    // Notes hang off a lifeline rather than spanning two of them, so their X
    // is left where the importer put it.
    const newX =
      fromParticipant && toParticipant
        ? computeMessageX(
            fromParticipant.position.x,
            toParticipant.position.x,
            size.width,
            link!.from === link!.to
          )
        : item.position.x

    const width = item.id.startsWith('note-')
      ? (item.width ?? size.width)
      : size.width

    return {
      ...item,
      position: { x: newX, y: newY },
      width,
      height: size.height,
      style: {
        ...(item.style ?? {}),
        width,
        height: size.height,
      },
    }
  })

  const updatedItemsById = new Map(updatedItems.map((item) => [item.id, item]))

  const updatedParticipants = participants.map((p) => ({
    ...p,
    data: {
      ...p.data,
      rowHeight,
      rowCount,
      rowYs: rows.centers,
      lifelineHeight: rows.height,
    },
  }))
  const updatedParticipantsById = new Map(
    updatedParticipants.map((p) => [p.id, p])
  )

  // Frames keep the row range they were imported with, so they follow the
  // recomputed rows instead of drifting away from the messages they enclose.
  const updatedFrames = new Map<string, Node>()
  for (const node of nodes) {
    const block = getBlockData(node)
    if (block) {
      // A frame nested inside another shares its rows, so it takes only its
      // own share of the label space — the parent keeps the rest and stays
      // visibly outside it.
      const startRow = Math.min(block.startRow, rowCount - 1)
      const endRow = Math.min(block.endRow, rowCount - 1)
      const deeperAtTop = nodes.filter((other) => {
        const otherBlock = getBlockData(other)
        if (!otherBlock) return false
        if (other.id === node.id) return false
        if ((otherBlock.depth ?? 0) <= (block.depth ?? 0)) return false
        return Math.min(otherBlock.startRow, rowCount - 1) === startRow
      }).length
      const deeperAtBottom = nodes.filter((other) => {
        const otherBlock = getBlockData(other)
        if (!otherBlock) return false
        if (other.id === node.id) return false
        if ((otherBlock.depth ?? 0) <= (block.depth ?? 0)) return false
        return Math.min(otherBlock.endRow, rowCount - 1) === endRow
      }).length

      const top =
        rows.tops[startRow] -
        SEQUENCE_LAYOUT.BLOCK_TOP_PADDING * (deeperAtTop + 1)
      const bottom =
        rows.tops[endRow] +
        rowHeight +
        SEQUENCE_LAYOUT.BLOCK_BOTTOM_PADDING * (deeperAtBottom + 1)
      updatedFrames.set(node.id, {
        ...node,
        position: { ...node.position, y: top },
        height: bottom - top,
        style: { ...(node.style ?? {}), height: bottom - top },
      })
      continue
    }

    if (node.data?.sequenceBox) {
      const height =
        rows.height +
        SEQUENCE_LAYOUT.BOX_TOP_INSET +
        SEQUENCE_LAYOUT.BOX_BOTTOM_PADDING
      updatedFrames.set(node.id, {
        ...node,
        height,
        style: { ...(node.style ?? {}), height },
      })
    }
  }

  const updatedNodes = nodes.map(
    (n) =>
      updatedParticipantsById.get(n.id) ??
      updatedItemsById.get(n.id) ??
      updatedFrames.get(n.id) ??
      n
  )

  return renumberSequenceRows(updatedNodes, withMessageArrowheads(edges))
}
