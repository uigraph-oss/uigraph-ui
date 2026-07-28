import { Node, Position } from '@xyflow/react'
import { describe, expect, it } from 'vitest'
import {
  pickHandleSide,
  positionToHandleId,
  resolveAbsolutePosition,
} from './node-geometry'

function makeNode(overrides: Partial<Node>): Node {
  return {
    id: 'n',
    type: 'default',
    position: { x: 0, y: 0 },
    data: {},
    ...overrides,
  } as Node
}

describe('pickHandleSide', () => {
  it('picks Right when target is far to the right', () => {
    const source = { x: 0, y: 0, width: 100, height: 50 }
    const target = { x: 400, y: 0, width: 100, height: 50 }
    expect(pickHandleSide(source, target)).toBe(Position.Right)
  })

  it('picks Left when target is far to the left', () => {
    const source = { x: 400, y: 0, width: 100, height: 50 }
    const target = { x: 0, y: 0, width: 100, height: 50 }
    expect(pickHandleSide(source, target)).toBe(Position.Left)
  })

  it('picks Bottom when target is far below', () => {
    const source = { x: 0, y: 0, width: 100, height: 50 }
    const target = { x: 0, y: 400, width: 100, height: 50 }
    expect(pickHandleSide(source, target)).toBe(Position.Bottom)
  })

  it('picks Top when target is far above', () => {
    const source = { x: 0, y: 400, width: 100, height: 50 }
    const target = { x: 0, y: 0, width: 100, height: 50 }
    expect(pickHandleSide(source, target)).toBe(Position.Top)
  })

  it('breaks a horizontal/vertical tie toward the vertical branch', () => {
    // equal center offsets on both axes (200 each): horizontalDiff is not
    // strictly greater than verticalDiff, so it falls through to the
    // vertical branch and the target (below) resolves to Bottom.
    const source = { x: 0, y: 0, width: 100, height: 100 }
    const target = { x: 200, y: 200, width: 100, height: 100 }
    expect(pickHandleSide(source, target)).toBe(Position.Bottom)
  })
})

describe('positionToHandleId', () => {
  it('maps each position + kind to the source-{side}/target-{side} convention', () => {
    expect(positionToHandleId(Position.Top, 'source')).toBe('source-top')
    expect(positionToHandleId(Position.Bottom, 'target')).toBe('target-bottom')
    expect(positionToHandleId(Position.Left, 'source')).toBe('source-left')
    expect(positionToHandleId(Position.Right, 'target')).toBe('target-right')
  })
})

describe('resolveAbsolutePosition', () => {
  it('returns the position unchanged for a top-level node', () => {
    const node = makeNode({ id: 'a', position: { x: 50, y: 60 } })
    const nodesById = new Map([['a', node]])
    expect(resolveAbsolutePosition(node, nodesById)).toEqual({ x: 50, y: 60 })
  })

  it('sums positions up a single-level parent chain', () => {
    const group = makeNode({
      id: 'group',
      type: 'group',
      position: { x: 100, y: 100 },
    })
    const child = makeNode({
      id: 'child',
      parentId: 'group',
      position: { x: 10, y: 20 },
    })
    const nodesById = new Map([
      ['group', group],
      ['child', child],
    ])
    expect(resolveAbsolutePosition(child, nodesById)).toEqual({
      x: 110,
      y: 120,
    })
  })

  it('sums positions up a multi-level (nested group) parent chain', () => {
    const outer = makeNode({
      id: 'outer',
      type: 'group',
      position: { x: 1000, y: 500 },
    })
    const inner = makeNode({
      id: 'inner',
      type: 'group',
      parentId: 'outer',
      position: { x: 20, y: 30 },
    })
    const leaf = makeNode({
      id: 'leaf',
      parentId: 'inner',
      position: { x: 5, y: 5 },
    })
    const nodesById = new Map([
      ['outer', outer],
      ['inner', inner],
      ['leaf', leaf],
    ])
    expect(resolveAbsolutePosition(leaf, nodesById)).toEqual({
      x: 1025,
      y: 535,
    })
  })
})
