import { ComponentInputType } from '@/features/component-meta'
import { Node } from '@xyflow/react'
import { describe, expect, it } from 'vitest'
import {
  createMessage,
  createParticipantNode,
  getNextParticipantColumn,
  reorientSequenceMessages,
} from './sequence-diagram-authoring'

function participant(id: string, x: number): Node {
  return {
    id,
    type: 'sequenceParticipant',
    position: { x, y: 0 },
    data: {},
  } as Node
}

describe('getNextParticipantColumn', () => {
  it('starts at x=0 on an empty canvas', () => {
    expect(getNextParticipantColumn([]).x).toBe(0)
  })

  it('appends one default column width past a single participant', () => {
    const { x, columnWidth } = getNextParticipantColumn([
      participant('participant-a', 0),
    ])
    expect(x).toBe(columnWidth)
  })

  it('infers column width from existing spacing rather than a hardcoded default', () => {
    const nodes = [
      participant('participant-a', 0),
      participant('participant-b', 500),
    ]
    const { x, columnWidth } = getNextParticipantColumn(nodes)
    expect(columnWidth).toBe(500)
    expect(x).toBe(1000)
  })
})

describe('createParticipantNode', () => {
  it('creates a participant at y=0 with the participant- id prefix', () => {
    const node = createParticipantNode([], 'New Participant')
    expect(node.type).toBe('sequenceParticipant')
    expect(node.id.startsWith('participant-')).toBe(true)
    expect(node.position).toEqual({ x: 0, y: 0 })
  })

  it('keeps name as the only component field', () => {
    const node = createParticipantNode([], 'New Participant')
    const fields = (
      node.data as {
        componentFields: Array<{
          componentFieldId: string
          type: string
          data: Array<{ value: string }>
        }>
      }
    ).componentFields

    expect(fields.map((f) => f.componentFieldId)).toEqual(['name'])
    expect(fields[0].type).toBe(ComponentInputType.TextInput)
  })
})

describe('createMessage', () => {
  it('returns unchanged input when either participant id is unknown', () => {
    const nodes = [participant('participant-a', 0)]
    const result = createMessage(
      nodes,
      [],
      'participant-a',
      'participant-missing',
      'hi'
    )
    expect(result.nodes).toBe(nodes)
  })

  it('appends a new message as the last row, wired with row-handle edges', () => {
    const p1 = participant('participant-a', 0)
    const p2 = participant('participant-b', 300)
    const { nodes, edges } = createMessage(
      [p1, p2],
      [],
      'participant-a',
      'participant-b',
      'GET /v1/stores'
    )

    const message = nodes.find((n) => n.id.startsWith('message-'))!
    expect(message).toBeDefined()
    expect(message.type).toBe('shape')

    const messageEdges = edges.filter(
      (e) => e.source === message.id || e.target === message.id
    )
    expect(messageEdges).toHaveLength(2)

    const fromEdge = messageEdges.find((e) => e.source === 'participant-a')!
    const toEdge = messageEdges.find((e) => e.target === 'participant-b')!
    expect(fromEdge.sourceHandle).toMatch(/^row-0-right-source$/)
    expect(toEdge.targetHandle).toMatch(/^row-0-left-target$/)
  })

  it('supports self-messages (from === to)', () => {
    const p1 = participant('participant-a', 0)
    const { nodes, edges } = createMessage(
      [p1],
      [],
      'participant-a',
      'participant-a',
      'internal check'
    )

    const message = nodes.find((n) => n.id.startsWith('message-'))!
    const messageEdges = edges.filter(
      (e) => e.source === message.id || e.target === message.id
    )
    expect(
      messageEdges.filter(
        (e) => e.source === 'participant-a' || e.target === 'participant-a'
      )
    ).toHaveLength(2)
  })

  it('points an arrowhead at the destination lifeline, in both directions', () => {
    const p1 = participant('participant-a', 0)
    const p2 = participant('participant-b', 300)

    const forward = createMessage(
      [p1, p2],
      [],
      'participant-a',
      'participant-b',
      'GET /v1/stores'
    )
    const forwardMessage = forward.nodes.find((n) =>
      n.id.startsWith('message-')
    )!
    const forwardFrom = forward.edges.find(
      (e) => e.source === 'participant-a' && e.target === forwardMessage.id
    )!
    const forwardTo = forward.edges.find(
      (e) => e.source === forwardMessage.id && e.target === 'participant-b'
    )!

    expect(forwardTo.markerEnd).toMatchObject({ type: 'arrowclosed' })
    expect(forwardFrom.markerEnd).toBeUndefined()
    expect(forwardFrom.markerStart).toBeUndefined()

    const backward = createMessage(
      [p1, p2],
      [],
      'participant-b',
      'participant-a',
      '200 OK'
    )
    const backwardMessage = backward.nodes.find((n) =>
      n.id.startsWith('message-')
    )!
    const backwardTo = backward.edges.find(
      (e) => e.source === backwardMessage.id && e.target === 'participant-a'
    )!

    expect(backwardTo.markerEnd).toMatchObject({ type: 'arrowclosed' })
  })

  it('points a self-message arrowhead at its return row', () => {
    const p1 = participant('participant-a', 0)
    const { nodes, edges } = createMessage(
      [p1],
      [],
      'participant-a',
      'participant-a',
      'internal check'
    )

    const message = nodes.find((n) => n.id.startsWith('message-'))!
    const returnEdge = edges.find(
      (e) => e.source === message.id && e.target === 'participant-a'
    )!

    expect(returnEdge.markerEnd).toMatchObject({ type: 'arrowclosed' })
    expect(returnEdge.targetHandle).toBe('row-1-right-target')
  })

  it('appends subsequent messages below existing ones', () => {
    const p1 = participant('participant-a', 0)
    const p2 = participant('participant-b', 300)
    const first = createMessage(
      [p1, p2],
      [],
      'participant-a',
      'participant-b',
      'first'
    )
    const second = createMessage(
      first.nodes,
      first.edges,
      'participant-a',
      'participant-b',
      'second'
    )

    const messages = second.nodes
      .filter((n) => n.id.startsWith('message-'))
      .sort((a, b) => a.position.y - b.position.y)
    expect(messages).toHaveLength(2)
    expect(messages[0].position.y).toBeLessThan(messages[1].position.y)
  })
})

describe('reorientSequenceMessages', () => {
  it('flips handle sides when the participant columns are swapped', () => {
    const p1 = participant('participant-a', 0)
    const p2 = participant('participant-b', 300)
    const { nodes, edges } = createMessage(
      [p1, p2],
      [],
      'participant-a',
      'participant-b',
      'GET /v1/stores'
    )

    const swapped = nodes.map((n) => {
      if (n.id === 'participant-a') return { ...n, position: { x: 300, y: 0 } }
      if (n.id === 'participant-b') return { ...n, position: { x: 0, y: 0 } }
      return n
    })

    const reoriented = reorientSequenceMessages(swapped, edges)
    const message = nodes.find((n) => n.id.startsWith('message-'))!
    const fromEdge = reoriented.find((e) => e.source === 'participant-a')!
    const toEdge = reoriented.find((e) => e.target === 'participant-b')!

    expect(fromEdge.sourceHandle).toBe('row-0-left-source')
    expect(fromEdge.targetHandle).toBe('target-right')
    expect(toEdge.sourceHandle).toBe('source-left')
    expect(toEdge.targetHandle).toBe('row-0-right-target')
    expect(fromEdge.target).toBe(message.id)
  })

  it('leaves handles untouched when the column order is unchanged', () => {
    const p1 = participant('participant-a', 0)
    const p2 = participant('participant-b', 300)
    const { nodes, edges } = createMessage(
      [p1, p2],
      [],
      'participant-a',
      'participant-b',
      'GET /v1/stores'
    )

    expect(reorientSequenceMessages(nodes, edges)).toEqual(edges)
  })
})
