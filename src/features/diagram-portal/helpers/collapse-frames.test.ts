import { Edge, Node } from '@xyflow/react'
import { describe, expect, it } from 'vitest'
import {
  applyCollapsedFrames,
  COLLAPSED_FRAME_HEIGHT,
  COLLAPSED_FRAME_WIDTH,
} from './collapse-frames'

function makeNode(
  id: string,
  type: string,
  parentId?: string,
  collapsed?: boolean
): Node {
  return {
    id,
    type,
    parentId,
    position: { x: 0, y: 0 },
    data: collapsed === undefined ? {} : { collapsed },
  } as Node
}

function nodeById(result: { nodes: Node[] }, id: string) {
  return result.nodes.find((node) => node.id === id)!
}

function edgeById(result: { edges: Edge[] }, id: string) {
  return result.edges.find((edge) => edge.id === id)!
}

describe('applyCollapsedFrames', () => {
  it('returns the input untouched when nothing is collapsed', () => {
    const nodes = [
      makeNode('frame', 'c4Boundary'),
      makeNode('a', 'c4', 'frame'),
    ]
    const edges: Edge[] = [{ id: 'e', source: 'a', target: 'a' }]

    const result = applyCollapsedFrames(nodes, edges)

    expect(result.nodes).toBe(nodes)
    expect(result.edges).toBe(edges)
  })

  it('hides descendants and shrinks the collapsed frame', () => {
    const nodes = [
      makeNode('frame', 'c4Boundary', undefined, true),
      makeNode('inner', 'c4Boundary', 'frame'),
      makeNode('leaf', 'c4', 'inner'),
      makeNode('outside', 'c4'),
    ]

    const result = applyCollapsedFrames(nodes, [])

    expect(nodeById(result, 'inner').hidden).toBe(true)
    expect(nodeById(result, 'leaf').hidden).toBe(true)
    expect(nodeById(result, 'outside').hidden).toBeUndefined()

    expect(nodeById(result, 'frame').hidden).toBeUndefined()
    expect(nodeById(result, 'frame').width).toBe(COLLAPSED_FRAME_WIDTH)
    expect(nodeById(result, 'frame').height).toBe(COLLAPSED_FRAME_HEIGHT)
  })

  it('folds a nested collapsed frame into its outermost collapsed ancestor', () => {
    const nodes = [
      makeNode('outer', 'c4Boundary', undefined, true),
      makeNode('inner', 'c4Boundary', 'outer', true),
      makeNode('leaf', 'c4', 'inner'),
    ]

    const result = applyCollapsedFrames(nodes, [
      { id: 'e', source: 'leaf', target: 'outside' },
    ])

    expect(nodeById(result, 'inner').hidden).toBe(true)
    expect(nodeById(result, 'inner').width).toBeUndefined()
    expect(edgeById(result, 'e').source).toBe('outer')
  })

  it('reroutes edges to the collapsed frame and hides internal ones', () => {
    const nodes = [
      makeNode('frame', 'c4Boundary', undefined, true),
      makeNode('a', 'c4', 'frame'),
      makeNode('b', 'c4', 'frame'),
      makeNode('external', 'c4'),
    ]

    const result = applyCollapsedFrames(nodes, [
      { id: 'internal', source: 'a', target: 'b' },
      {
        id: 'out',
        source: 'a',
        target: 'external',
        sourceHandle: 'source-top',
      },
    ])

    expect(edgeById(result, 'internal').hidden).toBe(true)

    expect(edgeById(result, 'out').hidden).toBeUndefined()
    expect(edgeById(result, 'out').source).toBe('frame')
    expect(edgeById(result, 'out').target).toBe('external')
    expect(edgeById(result, 'out').sourceHandle).toBeUndefined()
    expect(edgeById(result, 'out').reconnectable).toBe(false)
  })

  it('dedupes rerouted edges but keeps untouched parallel edges', () => {
    const nodes = [
      makeNode('frame', 'c4Boundary', undefined, true),
      makeNode('a', 'c4', 'frame'),
      makeNode('b', 'c4', 'frame'),
      makeNode('external', 'c4'),
    ]

    const result = applyCollapsedFrames(nodes, [
      { id: 'parallel-1', source: 'external', target: 'frame' },
      { id: 'parallel-2', source: 'external', target: 'frame' },
      { id: 'first', source: 'external', target: 'a' },
      { id: 'duplicate', source: 'external', target: 'b' },
    ])

    expect(edgeById(result, 'parallel-1').hidden).toBeUndefined()
    expect(edgeById(result, 'parallel-2').hidden).toBeUndefined()

    expect(edgeById(result, 'first').hidden).toBe(true)
    expect(edgeById(result, 'duplicate').hidden).toBe(true)
  })
})
