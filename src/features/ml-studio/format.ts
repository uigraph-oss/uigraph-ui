import { formatToHumanReadableMS } from '@/utils/time'
import type { Run } from './types'

export function formatMetric(value: number) {
  if (Number.isInteger(value)) return String(value)
  return Number(value.toPrecision(4)).toString()
}

export function runDurationMS(
  startedAt: string,
  endedAt: string
): number | null {
  const start = Date.parse(startedAt)
  if (Number.isNaN(start)) return null

  const end = Date.parse(endedAt)
  if (Number.isNaN(end)) return null
  if (end < start) return null
  return end - start
}

export function formatRunDuration(run: Run): string {
  const ms = runDurationMS(run.startedAt, run.endedAt)
  if (ms === null) return '—'
  return formatToHumanReadableMS(ms)
}
