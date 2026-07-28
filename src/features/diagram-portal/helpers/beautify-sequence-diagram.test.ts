import { ComponentInputType } from '@uigraph/sdk'
import { Edge, Node } from '@xyflow/react'
import { describe, expect, it } from 'vitest'
import {
  beautifySequenceDiagram,
  renumberSequenceRows,
} from './beautify-sequence-diagram'
import { DEFAULT_CONFIG, getRowY, rowHandleId } from './sequence-diagram-layout'

function participant(id: string, x: number): Node {
  return {
    id,
    type: 'sequenceParticipant',
    position: { x, y: 0 },
    data: {},
  } as Node
}

function message(
  id: string,
  rowIndex: number,
  overrides: Partial<Node> = {}
): Node {
  const height = DEFAULT_CONFIG.messageNodeHeight
  return {
    id,
    type: 'shape',
    position: { x: 0, y: getRowY(rowIndex, DEFAULT_CONFIG) - height / 2 },
    height,
    width: DEFAULT_CONFIG.messageNodeWidth,
    data: {},
    ...overrides,
  } as Node
}

function labeledMessage(id: string, rowIndex: number, label: string): Node {
  return message(id, rowIndex, {
    data: {
      componentFields: [
        {
          componentFieldId: 'name',
          type: ComponentInputType.TextInput,
          data: [{ value: label }],
        },
      ],
    },
  })
}

function linkEdges(
  participantId: string,
  messageId: string,
  otherParticipantId: string
): Edge[] {
  return [
    {
      id: `${participantId}-${messageId}`,
      source: participantId,
      target: messageId,
    } as Edge,
    {
      id: `${messageId}-${otherParticipantId}`,
      source: messageId,
      target: otherParticipantId,
    } as Edge,
  ]
}

// Mirrors the SDK's real edge shape: only ONE endpoint per message-edge is
// row-based (the other is an ordinary compass handle on the message node).
function rowLinkEdges(
  participantId: string,
  messageId: string,
  otherParticipantId: string,
  rowIndex: number
): Edge[] {
  return [
    {
      id: `${participantId}-${messageId}`,
      source: participantId,
      target: messageId,
      sourceHandle: rowHandleId(rowIndex, 'right', 'source'),
      targetHandle: 'target-left',
    } as Edge,
    {
      id: `${messageId}-${otherParticipantId}`,
      source: messageId,
      target: otherParticipantId,
      sourceHandle: 'source-right',
      targetHandle: rowHandleId(rowIndex, 'left', 'target'),
    } as Edge,
  ]
}

describe('beautifySequenceDiagram', () => {
  it('grows row height and eliminates overlap when a message label is long', () => {
    const p1 = participant('participant-p1', 0)
    const p2 = participant('participant-p2', 300)
    const m0 = labeledMessage('message-m0', 0, 'short')
    const m1 = labeledMessage(
      'message-m1',
      1,
      'a very long message label that will wrap across several lines of text'
    )
    const m2 = labeledMessage('message-m2', 2, 'short')

    const edges = [
      ...linkEdges('participant-p1', 'message-m0', 'participant-p2'),
      ...linkEdges('participant-p1', 'message-m1', 'participant-p2'),
      ...linkEdges('participant-p1', 'message-m2', 'participant-p2'),
    ]

    const nodes = [p1, p2, m0, m1, m2]
    const { nodes: result } = beautifySequenceDiagram(nodes, edges)

    const resultById = new Map(result.map((n) => [n.id, n]))
    const rp1 = resultById.get('participant-p1')!
    const rp2 = resultById.get('participant-p2')!
    const rm0 = resultById.get('message-m0')!
    const rm1 = resultById.get('message-m1')!
    const rm2 = resultById.get('message-m2')!

    // Row height grew to fit the longest label.
    expect(rp1.data?.rowHeight).toBeGreaterThan(DEFAULT_CONFIG.rowHeight)
    expect(rp1.data?.rowHeight).toBe(rp2.data?.rowHeight)

    // No two messages overlap vertically after beautify, even though their
    // box heights differ (m1's label is much longer than m0/m2's).
    const ordered = [rm0, rm1, rm2].sort((a, b) => a.position.y - b.position.y)
    for (let i = 0; i < ordered.length - 1; i++) {
      const current = ordered[i]
      const next = ordered[i + 1]
      const currentBottom = current.position.y + (current.height as number)
      expect(next.position.y).toBeGreaterThanOrEqual(currentBottom)
    }

    // Relative row ordering is preserved.
    expect(rm0.position.y).toBeLessThan(rm1.position.y)
    expect(rm1.position.y).toBeLessThan(rm2.position.y)
  })

  it('widens the message box for longer labels, up to a cap', () => {
    const p1 = participant('participant-p1', 0)
    const p2 = participant('participant-p2', 300)
    const short = labeledMessage('message-short', 0, 'ok')
    const long = labeledMessage(
      'message-long',
      1,
      'GET /v1/search/stores?q=pizza&zip=85001 with a very long trailing description'
    )

    const edges = [
      ...linkEdges('participant-p1', 'message-short', 'participant-p2'),
      ...linkEdges('participant-p1', 'message-long', 'participant-p2'),
    ]

    const { nodes: result } = beautifySequenceDiagram(
      [p1, p2, short, long],
      edges
    )
    const resultById = new Map(result.map((n) => [n.id, n]))
    const shortWidth = resultById.get('message-short')!.style?.width as number
    const longWidth = resultById.get('message-long')!.style?.width as number

    expect(longWidth).toBeGreaterThan(shortWidth)
    expect(longWidth).toBeLessThanOrEqual(240)
  })

  it('accounts for word-boundary wrapping, not just average char count', () => {
    // Regression test: "GET" is stranded alone on its own line because the
    // next word ("/v1/stores/{storeId}") doesn't fit next to it, so this
    // label wraps to 3 real lines — a naive totalChars/2 estimate predicts
    // only 2, which under-allocates row height and lets this box spill into
    // the row below it.
    const p1 = participant('participant-p1', 0)
    const p2 = participant('participant-p2', 300)
    const m0 = labeledMessage(
      'message-m0',
      0,
      'GET /v1/stores/{storeId} (batch hydrate)'
    )
    const m1 = labeledMessage(
      'message-m1',
      1,
      'live ETA, delivery fee, rating, badges'
    )

    const edges = [
      ...linkEdges('participant-p1', 'message-m0', 'participant-p2'),
      ...linkEdges('participant-p1', 'message-m1', 'participant-p2'),
    ]

    const { nodes: result } = beautifySequenceDiagram([p1, p2, m0, m1], edges)
    const resultById = new Map(result.map((n) => [n.id, n]))
    const rm0 = resultById.get('message-m0')!
    const rm1 = resultById.get('message-m1')!

    expect(rm0.height as number).toBeGreaterThanOrEqual(60)
    expect(rm1.position.y).toBeGreaterThanOrEqual(
      rm0.position.y + (rm0.height as number)
    )
  })

  it('is idempotent — a second pass leaves positions unchanged', () => {
    const p1 = participant('participant-p1', 0)
    const p2 = participant('participant-p2', 300)
    const m0 = labeledMessage('message-m0', 0, 'short reply')
    const m1 = labeledMessage(
      'message-m1',
      1,
      'a much longer label that forces the row taller than default'
    )

    const edges = [
      ...linkEdges('participant-p1', 'message-m0', 'participant-p2'),
      ...linkEdges('participant-p1', 'message-m1', 'participant-p2'),
    ]

    const once = beautifySequenceDiagram([p1, p2, m0, m1], edges)
    const twice = beautifySequenceDiagram(once.nodes, once.edges)

    expect(twice.nodes).toEqual(once.nodes)
  })

  it('is robust to messages that arrive out of row order (e.g. dragged nodes)', () => {
    const p1 = participant('participant-p1', 0)
    const p2 = participant('participant-p2', 300)
    // m1 is passed in before m0 despite m0 being visually above it.
    const m1 = labeledMessage('message-m1', 1, 'second')
    const m0 = labeledMessage('message-m0', 0, 'first')

    const edges = [
      ...linkEdges('participant-p1', 'message-m0', 'participant-p2'),
      ...linkEdges('participant-p1', 'message-m1', 'participant-p2'),
    ]

    const { nodes: result } = beautifySequenceDiagram([p1, p2, m1, m0], edges)
    const resultById = new Map(result.map((n) => [n.id, n]))

    expect(resultById.get('message-m0')!.position.y).toBeLessThan(
      resultById.get('message-m1')!.position.y
    )
  })

  it('centers each message between its participants', () => {
    const p1 = participant('participant-p1', 0)
    const p2 = participant('participant-p2', 300)
    const m0 = message('message-m0', 0)

    const edges = linkEdges('participant-p1', 'message-m0', 'participant-p2')
    const { nodes: result } = beautifySequenceDiagram([p1, p2, m0], edges)
    const rm0 = result.find((n) => n.id === 'message-m0')!

    const messageWidth = rm0.style?.width as number
    const expectedCenterX = (0 + 300) / 2 + 5
    expect(rm0.position.x).toBeCloseTo(expectedCenterX - messageWidth / 2)
  })

  it('returns nodes/edges unchanged when there are no participants or messages', () => {
    const nodes: Node[] = [
      { id: 'x', type: 'default', position: { x: 0, y: 0 }, data: {} } as Node,
    ]
    const edges: Edge[] = []
    const result = beautifySequenceDiagram(nodes, edges)
    expect(result.nodes).toBe(nodes)
    expect(result.edges).toBe(edges)
  })

  it('closes the row gap left by a deleted message and updates the remaining edges', () => {
    const p1 = participant('participant-p1', 0)
    const p2 = participant('participant-p2', 300)
    const m0 = message('message-m0', 0)
    // m2 (originally row 2) is what's left after row 1 was deleted — its
    // edges still say "row-2", which no longer matches its sorted position.
    const m2 = message('message-m2', 2)

    const edges = [
      ...rowLinkEdges('participant-p1', 'message-m0', 'participant-p2', 0),
      ...rowLinkEdges('participant-p1', 'message-m2', 'participant-p2', 2),
    ]

    const { nodes: result, edges: resultEdges } = beautifySequenceDiagram(
      [p1, p2, m0, m2],
      edges
    )

    const rm2 = result.find((n) => n.id === 'message-m2')!
    const rm0 = result.find((n) => n.id === 'message-m0')!
    const rowHeight = result.find((n) => n.id === 'participant-p1')!.data
      ?.rowHeight as number

    // Rows compacted: m2 now occupies row 1 (right after m0's row 0), not
    // the row-2 slot it used to encode.
    expect(rm2.position.y).toBeCloseTo(rm0.position.y + rowHeight)

    const m2Edges = resultEdges.filter(
      (e) => e.source === 'message-m2' || e.target === 'message-m2'
    )
    for (const edge of m2Edges) {
      expect(edge.sourceHandle).not.toMatch(/^row-2-/)
      expect(edge.targetHandle).not.toMatch(/^row-2-/)
    }
    expect(
      m2Edges.some((e) => e.sourceHandle === rowHandleId(1, 'right', 'source'))
    ).toBe(true)
    expect(
      m2Edges.some((e) => e.targetHandle === rowHandleId(1, 'left', 'target'))
    ).toBe(true)
  })

  it('updates row-handle ids to match a manually reordered message', () => {
    const p1 = participant('participant-p1', 0)
    const p2 = participant('participant-p2', 300)
    // m0/m1 are passed in with their ORIGINAL row-handle ids (0 and 1), but
    // m1 has already been dragged above m0 (its Y position is now lower).
    const m0 = message('message-m0', 1)
    const m1 = message('message-m1', 0)

    const edges = [
      ...rowLinkEdges('participant-p1', 'message-m0', 'participant-p2', 0),
      ...rowLinkEdges('participant-p1', 'message-m1', 'participant-p2', 1),
    ]

    const { edges: resultEdges } = beautifySequenceDiagram(
      [p1, p2, m0, m1],
      edges
    )

    const m1Edges = resultEdges.filter(
      (e) => e.source === 'message-m1' || e.target === 'message-m1'
    )
    const m0Edges = resultEdges.filter(
      (e) => e.source === 'message-m0' || e.target === 'message-m0'
    )

    // m1 is now visually first (row 0), m0 second (row 1) — handle ids
    // should reflect the new order, not the ids they arrived with.
    expect(
      m1Edges.some((e) => e.sourceHandle === rowHandleId(0, 'right', 'source'))
    ).toBe(true)
    expect(
      m0Edges.some((e) => e.sourceHandle === rowHandleId(1, 'right', 'source'))
    ).toBe(true)
  })
})

describe('renumberSequenceRows', () => {
  it('leaves non-row (compass) handles untouched', () => {
    const p1 = participant('participant-p1', 0)
    const p2 = participant('participant-p2', 300)
    const m0 = message('message-m0', 0)

    const edges = rowLinkEdges(
      'participant-p1',
      'message-m0',
      'participant-p2',
      5
    )
    const { edges: result } = renumberSequenceRows([p1, p2, m0], edges)

    const messageToParticipant = result.find((e) => e.source === 'message-m0')!
    expect(messageToParticipant.sourceHandle).toBe('source-right')
  })

  it('is a no-op when there are no messages', () => {
    const p1 = participant('participant-p1', 0)
    const edges: Edge[] = []
    const result = renumberSequenceRows([p1], edges)
    expect(result.edges).toBe(edges)
  })
})
