'use client'

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { formatMetric } from '../format'

export function MetricChips({
  metrics,
  columns,
}: {
  metrics: Record<string, number>
  columns: string[]
}) {
  const shown = columns.filter((key) => metrics[key] !== undefined)
  const rest = Object.keys(metrics).filter((key) => !shown.includes(key))

  if (shown.length === 0 && rest.length === 0) {
    return <span className="text-xs text-[#828DA3]">—</span>
  }

  return (
    <div className="flex shrink-0 items-center gap-1.5">
      {shown.map((key) => (
        <span
          key={key}
          className="border-stock text-muted-foreground rounded-md border bg-[#1E2533] px-2 py-0.5 text-[11px] whitespace-nowrap"
        >
          <span className="capitalize">{key.replace(/_/g, ' ')}</span>{' '}
          <span className="text-[#F4F7FC]">{formatMetric(metrics[key])}</span>
        </span>
      ))}
      {rest.length > 0 ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={(event) => event.stopPropagation()}
              className="border-stock text-muted-foreground hover:text-foreground rounded-md border border-dashed px-2 py-0.5 text-[11px] whitespace-nowrap"
            >
              +{rest.length} more
            </button>
          </TooltipTrigger>
          <TooltipContent
            side="top"
            align="start"
            className="max-h-64 overflow-y-auto"
          >
            <div className="flex flex-col gap-1">
              {rest.map((key) => (
                <div key={key} className="flex items-center gap-3 text-[11px]">
                  <span className="capitalize opacity-70">
                    {key.replace(/_/g, ' ')}
                  </span>
                  <span className="ml-auto font-medium">
                    {formatMetric(metrics[key])}
                  </span>
                </div>
              ))}
            </div>
          </TooltipContent>
        </Tooltip>
      ) : null}
    </div>
  )
}
