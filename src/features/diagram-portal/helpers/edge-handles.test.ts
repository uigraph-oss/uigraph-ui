import { Edge, Node } from '@xyflow/react'
import { describe, expect, it } from 'vitest'
import { fixEdgeHandles } from './edge-handles'

function makeNode(overrides: Partial<Node>): Node {
  return {
    id: 'n',
    type: 'default',
    position: { x: 0, y: 0 },
    measured: { width: 100, height: 50 },
    data: {},
    ...overrides,
  } as Node
}

function makeEdge(overrides: Partial<Edge>): Edge {
  return {
    id: 'e',
    source: 'a',
    target: 'b',
    ...overrides,
  } as Edge
}

describe('fixEdgeHandles', () => {
  it('recomputes stale handles after nodes move to a new relative position', () => {
    // Regression case for the diagnosed zigzag bug: edge originally created
    // when target was to the right of source, but source has since been
    // repositioned below the target by a layout pass.
    const a = makeNode({ id: 'a', position: { x: 0, y: 400 } })
    const b = makeNode({ id: 'b', position: { x: 0, y: 0 } })
    const edge = makeEdge({
      source: 'a',
      target: 'b',
      sourceHandle: 'source-right',
      targetHandle: 'target-left',
    })

    const [fixed] = fixEdgeHandles([a, b], [edge])
    expect(fixed.sourceHandle).toBe('source-top')
    expect(fixed.targetHandle).toBe('target-bottom')
  })

  it('is idempotent across repeated passes', () => {
    const a = makeNode({ id: 'a', position: { x: 0, y: 400 } })
    const b = makeNode({ id: 'b', position: { x: 0, y: 0 } })
    const edge = makeEdge({
      source: 'a',
      target: 'b',
      sourceHandle: 'source-right',
      targetHandle: 'target-left',
    })

    const once = fixEdgeHandles([a, b], [edge])
    const twice = fixEdgeHandles([a, b], once)
    expect(twice).toEqual(once)
  })

  it('skips edges with type "dynamic"', () => {
    const a = makeNode({ id: 'a', position: { x: 0, y: 400 } })
    const b = makeNode({ id: 'b', position: { x: 0, y: 0 } })
    const edge = makeEdge({
      source: 'a',
      target: 'b',
      type: 'dynamic',
      sourceHandle: 'source-right',
      targetHandle: 'target-left',
    })

    const [fixed] = fixEdgeHandles([a, b], [edge])
    expect(fixed.sourceHandle).toBe('source-right')
    expect(fixed.targetHandle).toBe('target-left')
  })

  it('skips edges with data.handlesLocked', () => {
    const a = makeNode({ id: 'a', position: { x: 0, y: 400 } })
    const b = makeNode({ id: 'b', position: { x: 0, y: 0 } })
    const edge = makeEdge({
      source: 'a',
      target: 'b',
      sourceHandle: 'source-right',
      targetHandle: 'target-left',
      data: { handlesLocked: true },
    })

    const [fixed] = fixEdgeHandles([a, b], [edge])
    expect(fixed.sourceHandle).toBe('source-right')
    expect(fixed.targetHandle).toBe('target-left')
  })

  it('skips edges touching sequence-diagram nodes', () => {
    const participant = makeNode({
      id: 'participant-1',
      type: 'sequenceParticipant',
      position: { x: 0, y: 0 },
    })
    const message = makeNode({
      id: 'message-1',
      position: { x: 200, y: 200 },
    })
    const edge = makeEdge({
      source: 'participant-1',
      target: 'message-1',
      sourceHandle: 'row-0-right-source',
      targetHandle: 'row-0-left-target',
    })

    const [fixed] = fixEdgeHandles([participant, message], [edge])
    expect(fixed.sourceHandle).toBe('row-0-right-source')
    expect(fixed.targetHandle).toBe('row-0-left-target')
  })

  it('leaves an edge unchanged if an endpoint node is missing', () => {
    const a = makeNode({ id: 'a', position: { x: 0, y: 0 } })
    const edge = makeEdge({
      source: 'a',
      target: 'missing',
      sourceHandle: 'source-right',
      targetHandle: 'target-left',
    })

    const [fixed] = fixEdgeHandles([a], [edge])
    expect(fixed.sourceHandle).toBe('source-right')
    expect(fixed.targetHandle).toBe('target-left')
  })
})
