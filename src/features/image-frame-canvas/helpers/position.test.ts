import { describe, expect, it } from 'vitest'
import { FOCAL_POINT_RESOLUTION } from '../constants'
import { getVirtualPointPosition } from './position'

describe('getVirtualPointPosition', () => {
  it('returns correct virtual position for center input', () => {
    const canvasWidth = 1000
    const input = { x: canvasWidth / 2, y: canvasWidth / 2 }
    const result = getVirtualPointPosition(canvasWidth, input)
    expect(result.x).toBeCloseTo(FOCAL_POINT_RESOLUTION / 2)
    expect(result.y).toBeCloseTo(FOCAL_POINT_RESOLUTION / 2)
  })

  it('clamps virtual position to resolution bounds', () => {
    const canvasWidth = 500
    const input = { x: 10000, y: -10000 }
    const result = getVirtualPointPosition(canvasWidth, input)
    expect(result.x).toBe(FOCAL_POINT_RESOLUTION)
    expect(result.y).toBe(0)
  })

  it('returns zero for zero input', () => {
    const canvasWidth = 800
    const input = { x: 0, y: 0 }
    const result = getVirtualPointPosition(canvasWidth, input)
    expect(result.x).toBe(0)
    expect(result.y).toBe(0)
  })

  it('handles negative input values', () => {
    const canvasWidth = 400
    const input = { x: -100, y: -200 }
    const result = getVirtualPointPosition(canvasWidth, input)
    expect(result.x).toBe(0)
    expect(result.y).toBe(0)
  })

  it('handles fractional input values', () => {
    const canvasWidth = 1000
    const input = { x: 0.5, y: 0.25 }
    const result = getVirtualPointPosition(canvasWidth, input)
    expect(result.x).toBeCloseTo(0.5 * (FOCAL_POINT_RESOLUTION / canvasWidth))
    expect(result.y).toBeCloseTo(0.25 * (FOCAL_POINT_RESOLUTION / canvasWidth))
  })

  it('handles canvasWidth of 1', () => {
    const canvasWidth = 1
    const input = { x: 0.5, y: 0.25 }
    const result = getVirtualPointPosition(canvasWidth, input)
    expect(result.x).toBeCloseTo(0.5 * (FOCAL_POINT_RESOLUTION / 1))
    expect(result.y).toBeCloseTo(0.25 * (FOCAL_POINT_RESOLUTION / 1))
  })

  it('handles input at max canvasWidth', () => {
    const canvasWidth = FOCAL_POINT_RESOLUTION
    const input = { x: FOCAL_POINT_RESOLUTION, y: FOCAL_POINT_RESOLUTION }
    const result = getVirtualPointPosition(canvasWidth, input)
    expect(result.x).toBe(FOCAL_POINT_RESOLUTION)
    expect(result.y).toBe(FOCAL_POINT_RESOLUTION)
  })

  it('handles input at min canvasWidth', () => {
    const canvasWidth = FOCAL_POINT_RESOLUTION
    const input = { x: 0, y: 0 }
    const result = getVirtualPointPosition(canvasWidth, input)
    expect(result.x).toBe(0)
    expect(result.y).toBe(0)
  })
})
