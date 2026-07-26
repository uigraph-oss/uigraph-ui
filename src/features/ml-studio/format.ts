import { formatToHumanReadableMS } from '@/utils/time'
import type { Run, RunStatus } from './types'

export function formatMetric(value: number) {
  if (Number.isInteger(value)) return String(value)
  return Number(value.toPrecision(4)).toString()
}

export function runDurationMS(
  startedAt: string,
  endedAt: string | undefined,
  status: RunStatus,
  now: number
): number | null {
  if (!startedAt) return null
  const start = Date.parse(startedAt)
  if (Number.isNaN(start)) return null

  if (!endedAt) {
    if (status === 'running') return now - start
    return null
  }

  const end = Date.parse(endedAt)
  if (Number.isNaN(end)) return null
  if (end < start) return null
  return end - start
}

export function formatRunDuration(run: Run, now: number): string {
  const ms = runDurationMS(run.startedAt, run.endedAt, run.status, now)
  if (ms === null) return '—'
  return formatToHumanReadableMS(ms)
}
