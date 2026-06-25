import { describe, expect, it } from 'vitest'
import {
  costSavedPerUser,
  periodToDays,
  projectedAnnualSavings,
} from './derived-metrics'

describe('periodToDays', () => {
  it('maps known periods to day counts', () => {
    expect(periodToDays('1d')).toBe(1)
    expect(periodToDays('7d')).toBe(7)
    expect(periodToDays('30d')).toBe(30)
    expect(periodToDays('1y')).toBe(365)
  })

  it('defaults unknown periods to 7 days', () => {
    expect(periodToDays('bogus')).toBe(7)
  })
})

describe('projectedAnnualSavings', () => {
  it('extrapolates a 7-day total to a year', () => {
    expect(projectedAnnualSavings(70, '7d')).toBeCloseTo(3650, 5)
  })

  it('extrapolates a 1-day total to a year', () => {
    expect(projectedAnnualSavings(10, '1d')).toBeCloseTo(3650, 5)
  })

  it('returns 0 for 0 savings', () => {
    expect(projectedAnnualSavings(0, '30d')).toBe(0)
  })
})

describe('costSavedPerUser', () => {
  it('divides cost saved by unique users', () => {
    expect(costSavedPerUser(100, 4)).toBe(25)
  })

  it('returns null when there are zero users (guards division by zero)', () => {
    expect(costSavedPerUser(100, 0)).toBeNull()
  })

  it('returns null for a negative user count (defensive)', () => {
    expect(costSavedPerUser(100, -1)).toBeNull()
  })
})
