import type { Edge, Node } from '@xyflow/react'
import { describe, expect, it } from 'vitest'
import {
  applyPendingPatches,
  buildEmbedUrl,
  isCyclicEmbed,
  parseEmbedPath,
  pathsEqual,
  selectedIdsOf,
} from './embed-protocol'

function node(id: string, extra?: Partial<Node>): Node {
  return {
    id,
    position: { x: 0, y: 0 },
    data: { label: id },
    ...extra,
  }
}

function edge(id: string, extra?: Partial<Edge>): Edge {
  return { id, source: 'a', target: 'b', ...extra }
}

describe('pathsEqual', () => {
  it('matches identical paths', () => {
    expect(pathsEqual(['a', 'b'], ['a', 'b'])).toBe(true)
  })

  it('rejects different lengths', () => {
    expect(pathsEqual(['a'], ['a', 'b'])).toBe(false)
  })

  it('rejects different segments', () => {
    expect(pathsEqual(['a', 'b'], ['a', 'c'])).toBe(false)
  })

  it('matches two empty paths', () => {
    expect(pathsEqual([], [])).toBe(true)
  })
})

describe('isCyclicEmbed', () => {
  it('flags a diagram already open further up', () => {
    expect(isCyclicEmbed('d2', ['d1', 'd2'])).toBe(true)
  })

  it('allows an unrelated diagram', () => {
    expect(isCyclicEmbed('d3', ['d1', 'd2'])).toBe(false)
  })

  it('allows anything at the root', () => {
    expect(isCyclicEmbed('d1', [])).toBe(false)
  })
})

describe('parseEmbedPath', () => {
  it('returns an empty array for null', () => {
    expect(parseEmbedPath(null)).toEqual([])
  })

  it('returns an empty array for an empty string', () => {
    expect(parseEmbedPath('')).toEqual([])
  })

  it('splits on commas and drops empty segments', () => {
    expect(parseEmbedPath('a,,b,')).toEqual(['a', 'b'])
  })
})

describe('selectedIdsOf', () => {
  it('keeps only selected items', () => {
    expect(
      selectedIdsOf([
        { id: 'a', selected: true },
        { id: 'b' },
        { id: 'c', selected: false },
      ])
    ).toEqual(['a'])
  })

  it('dedupes repeated ids', () => {
    expect(
      selectedIdsOf([
        { id: 'a', selected: true },
        { id: 'a', selected: true },
      ])
    ).toEqual(['a'])
  })
})

describe('applyPendingPatches', () => {
  const mirror = {
    nodes: [node('n1'), node('n2')],
    edges: [edge('e1')],
  }

  it('returns the mirror untouched with no pending patches', () => {
    expect(applyPendingPatches(mirror, [])).toEqual(mirror)
  })

  it('merges a node patch without dropping untouched data', () => {
    const result = applyPendingPatches(mirror, [
      { kind: 'node', nodeId: 'n1', patch: { width: 300 } },
    ])

    expect(result.nodes[0].width).toBe(300)
    expect(result.nodes[0].data).toEqual({ label: 'n1' })
    expect(result.nodes[1]).toBe(mirror.nodes[1])
  })

  it('merges node data patches', () => {
    const result = applyPendingPatches(mirror, [
      { kind: 'node-data', nodeId: 'n2', data: { color: 'red' } },
    ])

    expect(result.nodes[1].data).toEqual({ label: 'n2', color: 'red' })
  })

  it('merges an edge patch', () => {
    const result = applyPendingPatches(mirror, [
      { kind: 'edge', edgeId: 'e1', patch: { animated: true } },
    ])

    expect(result.edges[0].animated).toBe(true)
  })

  it('replaces the whole node array', () => {
    const nodes = [node('n9')]
    const result = applyPendingPatches(mirror, [{ kind: 'nodes', nodes }])

    expect(result.nodes).toBe(nodes)
    expect(result.edges).toBe(mirror.edges)
  })

  it('applies patches in order so the latest wins', () => {
    const result = applyPendingPatches(mirror, [
      { kind: 'node-data', nodeId: 'n1', data: { color: 'red' } },
      { kind: 'node-data', nodeId: 'n1', data: { color: 'blue' } },
    ])

    expect(result.nodes[0].data).toEqual({ label: 'n1', color: 'blue' })
  })

  it('does not mutate the incoming mirror', () => {
    applyPendingPatches(mirror, [
      { kind: 'node-data', nodeId: 'n1', data: { color: 'red' } },
    ])

    expect(mirror.nodes[0].data).toEqual({ label: 'n1' })
  })

  it('throws on an unknown patch kind', () => {
    expect(() =>
      applyPendingPatches(mirror, [{ kind: 'unknown' } as never])
    ).toThrow('Unknown embed patch kind: unknown')
  })
})

describe('buildEmbedUrl', () => {
  it('omits empty params', () => {
    expect(buildEmbedUrl({ diagramId: 'd1', ancestors: [], path: [] })).toBe(
      '/diagram-embed/d1?'
    )
  })

  it('joins ancestors and path with commas', () => {
    expect(
      buildEmbedUrl({
        diagramId: 'd3',
        ancestors: ['d1', 'd2'],
        path: ['n1', 'n2'],
      })
    ).toBe('/diagram-embed/d3?ancestors=d1%2Cd2&path=n1%2Cn2')
  })

  it('round-trips through parseEmbedPath', () => {
    const url = buildEmbedUrl({
      diagramId: 'd3',
      ancestors: ['d1', 'd2'],
      path: ['n1'],
    })

    const params = new URLSearchParams(url.split('?')[1])

    expect(parseEmbedPath(params.get('ancestors'))).toEqual(['d1', 'd2'])
    expect(parseEmbedPath(params.get('path'))).toEqual(['n1'])
  })
})
