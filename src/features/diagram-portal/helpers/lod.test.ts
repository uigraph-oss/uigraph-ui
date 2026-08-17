import { Edge, Node } from '@xyflow/react'
import { describe, expect, it } from 'vitest'
import {
  applyLevelOfDetail,
  LOD_COLLAPSED_CLASS,
  LOD_HIDDEN_CLASS,
  resolveVisibleDepth,
} from './lod'

function makeNode(id: string, type: string, parentId?: string): Node {
  return {
    id,
    type,
    parentId,
    position: { x: 0, y: 0 },
    data: {},
  } as Node
}

const nodes = [
  makeNode('person', 'c4'),
  makeNode('enterprise', 'c4Boundary'),
  makeNode('system-boundary', 'c4Boundary', 'enterprise'),
  makeNode('system', 'c4', 'system-boundary'),
  makeNode('group', 'group'),
  makeNode('grouped', 'c4', 'group'),
]

const edges: Edge[] = [
  { id: 'a', source: 'person', target: 'system' },
  { id: 'b', source: 'person', target: 'group' },
]

function classOf(result: { nodes: Node[] }, id: string) {
  return result.nodes.find((node) => node.id === id)?.className
}

describe('resolveVisibleDepth', () => {
  it('maps each zoom band to its depth', () => {
    expect(resolveVisibleDepth(0.1, Infinity)).toBe(0)
    expect(resolveVisibleDepth(0.2, Infinity)).toBe(1)
    expect(resolveVisibleDepth(0.5, Infinity)).toBe(2)
    expect(resolveVisibleDepth(0.6, Infinity)).toBe(Infinity)
    expect(resolveVisibleDepth(8, Infinity)).toBe(Infinity)
  })

  it('holds the current depth inside the hysteresis margin', () => {
    expect(resolveVisibleDepth(0.16, 0)).toBe(0)
    expect(resolveVisibleDepth(0.16, 1)).toBe(1)
    expect(resolveVisibleDepth(0.18, 0)).toBe(1)
    expect(resolveVisibleDepth(0.14, 1)).toBe(0)
  })
})

describe('applyLevelOfDetail', () => {
  it('hides everything below the visible depth', () => {
    const result = applyLevelOfDetail(nodes, edges, 0)

    expect(classOf(result, 'person')).toBeUndefined()
    expect(classOf(result, 'enterprise')).toBe(LOD_COLLAPSED_CLASS)
    expect(classOf(result, 'system-boundary')).toBe(LOD_HIDDEN_CLASS)
    expect(classOf(result, 'system')).toBe(LOD_HIDDEN_CLASS)
  })

  it('collapses only the boundary sitting at the visible depth', () => {
    const result = applyLevelOfDetail(nodes, edges, 1)

    expect(classOf(result, 'enterprise')).toBeUndefined()
    expect(classOf(result, 'system-boundary')).toBe(LOD_COLLAPSED_CLASS)
    expect(classOf(result, 'system')).toBe(LOD_HIDDEN_CLASS)
  })

  it('ignores generic group nodes', () => {
    const result = applyLevelOfDetail(nodes, edges, 0)

    expect(classOf(result, 'group')).toBeUndefined()
    expect(classOf(result, 'grouped')).toBeUndefined()
  })

  it('hides an edge when either end is hidden', () => {
    const result = applyLevelOfDetail(nodes, edges, 0)

    expect(result.edges[0].className).toBe(LOD_HIDDEN_CLASS)
    expect(result.edges[1].className).toBeUndefined()
  })

  it('clears every class at full detail', () => {
    const result = applyLevelOfDetail(nodes, edges, Infinity)

    expect(result.nodes.every((node) => node.className === undefined)).toBe(
      true
    )
    expect(result.edges.every((edge) => edge.className === undefined)).toBe(
      true
    )
  })
})
