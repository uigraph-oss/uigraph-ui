import { Edge, Node } from '@xyflow/react'
import { getComponentField } from '../hooks/use-component-field'
import { TComponentField } from '../types/component-fields'
import { DEFAULT_CONFIG, getRowY } from './sequence-diagram-layout'

const ROW_HEIGHT_VERTICAL_PADDING = 16
const PARTICIPANT_CENTER_OFFSET = 5

const MIN_MESSAGE_WIDTH = DEFAULT_CONFIG.messageNodeWidth
const MAX_MESSAGE_WIDTH = 240
const TARGET_WRAP_LINES = 2
const CHAR_WIDTH = 7
const LINE_HEIGHT = 20
const BOX_HORIZONTAL_PADDING = 24
const BOX_VERTICAL_PADDING = 8

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

/**
 * Simulates greedy word-boundary wrapping (like CSS `overflow-wrap: break-word`)
 * to count the resulting lines. A naive `totalChars / charsPerLine` estimate
 * is wrong whenever a short word is followed by a long unbreakable token —
 * e.g. "GET /v1/stores/{storeId} (batch hydrate)" strands "GET" alone on its
 * own line because "/v1/stores/{storeId}" doesn't fit next to it, producing
 * 3 real lines where a char-count average predicts 2 — undercounting the
 * rendered height enough for the box to spill into the row below it.
 */
function estimateLines(words: string[], charsPerLine: number): number {
  let lines = 1
  let current = 0

  for (const word of words) {
    if (word.length > charsPerLine) {
      if (current > 0) lines += 1
      const wordLines = Math.ceil(word.length / charsPerLine)
      lines += wordLines - 1
      current = word.length - (wordLines - 1) * charsPerLine
      continue
    }

    const next = current === 0 ? word.length : current + 1 + word.length
    if (next > charsPerLine) {
      lines += 1
      current = word.length
    } else {
      current = next
    }
  }

  return lines
}

/**
 * Estimates a message box's width/height from its label text, targeting a
 * ~2-line wrap instead of trusting whatever narrow fixed width the diagram
 * was created with (the SDK hardcodes 120px, which forces long labels into
 * 4+ jagged, mid-word-broken lines).
 */
function estimateMessageBoxSize(label: string): {
  width: number
  height: number
} {
  const text = label.trim()

  if (!text) {
    return {
      width: MIN_MESSAGE_WIDTH,
      height: DEFAULT_CONFIG.messageNodeHeight,
    }
  }

  const words = text.split(/\s+/).filter(Boolean)
  const longestWord = Math.max(1, ...words.map((w) => w.length))

  // Never choose a width narrower than the longest word needs — a width
  // picked purely from the average would strand that word alone on its own
  // line (or force mid-word breaks), inflating the real line count beyond
  // what an average-based estimate predicts.
  const idealCharsPerLine = Math.max(
    1,
    Math.ceil(text.length / TARGET_WRAP_LINES)
  )
  const charsPerLineNeeded = Math.max(idealCharsPerLine, longestWord)

  const width = Math.min(
    MAX_MESSAGE_WIDTH,
    Math.max(
      MIN_MESSAGE_WIDTH,
      BOX_HORIZONTAL_PADDING + charsPerLineNeeded * CHAR_WIDTH
    )
  )

  const charsPerLine = Math.max(
    1,
    Math.floor((width - BOX_HORIZONTAL_PADDING) / CHAR_WIDTH)
  )
  const lines = estimateLines(words, charsPerLine)
  const height = Math.max(
    DEFAULT_CONFIG.messageNodeHeight,
    lines * LINE_HEIGHT + BOX_VERTICAL_PADDING
  )

  return { width, height }
}

const ROW_HANDLE_RE = /^row-\d+-(left|right)-(source|target)$/

function isSelfMessage(
  messageId: string,
  links: Map<string, ParticipantLink>
): boolean {
  const link = links.get(messageId)
  return Boolean(link?.from && link.from === link.to)
}

/**
 * A self-message occupies TWO rows, not one: it leaves its lifeline at row n
 * and returns to it at row n+1. Handing out a plain 0..n-1 sequence lets the
 * message after a self-loop claim the row that loop returns into, so both
 * land on the same point of the lifeline.
 */
function assignMessageRowIndices(
  nodes: Node[],
  links: Map<string, ParticipantLink>
): Map<string, number> {
  const messages = nodes.filter((n) => n.id.startsWith('message-'))
  const ordered = [...messages].sort((a, b) => a.position.y - b.position.y)

  const rowIndexByMessageId = new Map<string, number>()
  let row = 0
  for (const message of ordered) {
    rowIndexByMessageId.set(message.id, row)
    row += isSelfMessage(message.id, links) ? 2 : 1
  }

  return rowIndexByMessageId
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
 *   `estimateMessageBoxSize`), instead of a fixed 120px width — this is
 *   what causes the aggressive word-breaking wrap in AI/mermaid-imported
 *   diagrams.
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
  const messages = nodes.filter((n) => n.id.startsWith('message-'))

  if (participants.length === 0 || messages.length === 0) {
    return { nodes, edges }
  }

  const links = buildMessageParticipantLinks(edges)
  const participantsById = new Map(participants.map((p) => [p.id, p]))

  const orderedMessages = [...messages].sort(
    (a, b) => a.position.y - b.position.y
  )

  const sizesById = new Map(
    orderedMessages.map((m) => [
      m.id,
      estimateMessageBoxSize(getMessageLabel(m)),
    ])
  )

  const effectiveRowHeight = Math.max(
    DEFAULT_CONFIG.rowHeight,
    ...orderedMessages.map(
      (m) => sizesById.get(m.id)!.height + ROW_HEIGHT_VERTICAL_PADDING
    )
  )

  const cfg = { ...DEFAULT_CONFIG, rowHeight: effectiveRowHeight }

  const rowIndexByMessageId = assignMessageRowIndices(nodes, links)

  const updatedMessages = orderedMessages.map((message) => {
    const size = sizesById.get(message.id)!
    const newY =
      getRowY(rowIndexByMessageId.get(message.id)!, cfg) - size.height / 2

    const link = links.get(message.id)
    const fromParticipant = link?.from
      ? participantsById.get(link.from)
      : undefined
    const toParticipant = link?.to ? participantsById.get(link.to) : undefined

    const newX =
      fromParticipant && toParticipant
        ? computeMessageX(
            fromParticipant.position.x,
            toParticipant.position.x,
            size.width,
            link!.from === link!.to
          )
        : message.position.x

    return {
      ...message,
      position: { x: newX, y: newY },
      width: size.width,
      height: size.height,
      style: {
        ...(message.style ?? {}),
        width: size.width,
        height: size.height,
      },
    }
  })

  const updatedMessagesById = new Map(updatedMessages.map((m) => [m.id, m]))

  const updatedParticipants = participants.map((p) => ({
    ...p,
    data: { ...p.data, rowHeight: effectiveRowHeight },
  }))
  const updatedParticipantsById = new Map(
    updatedParticipants.map((p) => [p.id, p])
  )

  const updatedNodes = nodes.map(
    (n) =>
      updatedParticipantsById.get(n.id) ?? updatedMessagesById.get(n.id) ?? n
  )

  return renumberSequenceRows(updatedNodes, edges)
}
