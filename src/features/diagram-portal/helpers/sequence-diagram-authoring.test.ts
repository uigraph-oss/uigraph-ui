import { ComponentInputType } from '@/features/component-meta'
import { SEQUENCE_PARTICIPANT_COLOR } from '@uigraph/sdk'
import { Node } from '@xyflow/react'
import { describe, expect, it } from 'vitest'
import {
  createMessage,
  createParticipantNode,
  getNextParticipantColumn,
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

  it('gives the participant a color field, like an imported one', () => {
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

    expect(fields.map((f) => f.componentFieldId)).toEqual(['name', 'color'])
    expect(fields[1].type).toBe(ComponentInputType.ColorPicker)
    expect(fields[1].data[0].value).toBe(SEQUENCE_PARTICIPANT_COLOR)
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
