'use client'

import { formatMetric } from '../format'

export function MetricChips({
  metrics,
  columns,
}: {
  metrics: Record<string, number>
  columns: string[]
}) {
  const present = columns.filter((key) => metrics[key] !== undefined)
  if (present.length === 0) {
    return null
  }

  return (
    <div className="flex shrink-0 items-center gap-1.5">
      {present.map((key) => (
        <span
          key={key}
          className="border-stock text-muted-foreground rounded-md border bg-[#1E2533] px-2 py-0.5 text-[11px] whitespace-nowrap"
        >
          <span className="capitalize">{key.replace(/_/g, ' ')}</span>{' '}
          <span className="text-[#F4F7FC]">{formatMetric(metrics[key])}</span>
        </span>
      ))}
    </div>
  )
}
