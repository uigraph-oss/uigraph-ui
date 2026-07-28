import { Edge, Node } from '@xyflow/react'
import { describe, expect, it } from 'vitest'
import { beautifyDiagram } from './beautify-diagram'

function makeNode(overrides: Partial<Node>): Node {
  return {
    id: 'n',
    type: 'default',
    position: { x: 0, y: 0 },
    measured: { width: 160, height: 60 },
    data: {},
    ...overrides,
  } as Node
}

describe('beautifyDiagram', () => {
  it('dispatches to the sequence-diagram pass when a sequenceParticipant node is present', () => {
    const p1 = makeNode({ id: 'participant-p1', type: 'sequenceParticipant' })
    const p2 = makeNode({
      id: 'participant-p2',
      type: 'sequenceParticipant',
      position: { x: 300, y: 0 },
    })
    const m0 = makeNode({ id: 'message-m0', height: 32, width: 140 })

    const edges: Edge[] = [
      { id: 'e1', source: 'participant-p1', target: 'message-m0' } as Edge,
      { id: 'e2', source: 'message-m0', target: 'participant-p2' } as Edge,
    ]

    const { nodes } = beautifyDiagram([p1, p2, m0], edges)
    const resultP1 = nodes.find((n) => n.id === 'participant-p1')!
    // Sequence beautify stamps rowHeight onto participants; the standard
    // (dagre) pass would not touch this field at all.
    expect(resultP1.data?.rowHeight).toBeDefined()
  })

  it('dispatches to the standard (dagre + edge-fix) pass for non-sequence diagrams', () => {
    const a = makeNode({ id: 'a', position: { x: 0, y: 0 } })
    const b = makeNode({ id: 'b', position: { x: 500, y: 500 } })
    const edges: Edge[] = [
      {
        id: 'e1',
        source: 'a',
        target: 'b',
        sourceHandle: 'source-right',
        targetHandle: 'target-left',
      } as Edge,
    ]

    const { nodes, edges: resultEdges } = beautifyDiagram([a, b], edges, 'LR')

    // Standard pass repositions via dagre — result should not carry sequence
    // diagram fields.
    expect(nodes.every((n) => n.data?.rowHeight === undefined)).toBe(true)
    // Edge handles should reflect the *final* relative geometry, not stay
    // pinned to whatever was passed in.
    expect(resultEdges[0].sourceHandle).toBeDefined()
    expect(resultEdges[0].targetHandle).toBeDefined()
  })

  it('stamps data.autoLayout = false on groups the dagre pass just laid out', () => {
    const group = makeNode({
      id: 'g',
      type: 'group',
      data: { autoLayout: true },
      style: { width: 400, height: 300 },
    })
    const child = makeNode({
      id: 'c',
      parentId: 'g',
      position: { x: 10, y: 10 },
    })

    const { nodes } = beautifyDiagram([group, child], [], 'LR')
    const resultGroup = nodes.find((n) => n.id === 'g')!
    expect(resultGroup.data?.autoLayout).toBe(false)
  })
})
