import { cn } from '@/lib/utils'
import type { CostBreakdownRow } from '../types'

const usd = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
})

export function CostBreakdownBarList({
  rows,
  activeKey,
  onRowClick,
}: {
  rows: CostBreakdownRow[]
  activeKey: string | null
  onRowClick: (row: CostBreakdownRow) => void
}) {
  if (rows.length === 0) {
    return (
      <p className="text-paragraph px-6 py-8 text-center text-sm">
        No cost data for this dimension.
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-1.5 px-6 py-4">
      {rows.map((row) => {
        const isActive = row.key === activeKey
        return (
          <button
            key={row.key}
            type="button"
            onClick={() => onRowClick(row)}
            className={cn(
              'group flex items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors',
              'hover:bg-muted/20',
              isActive && 'bg-primary/10 ring-primary ring-1'
            )}
          >
            <span className="text-foreground w-32 shrink-0 truncate text-sm font-medium">
              {row.label}
            </span>
            <div className="bg-muted/30 h-2 w-full flex-1 overflow-hidden rounded-full">
              <div
                className={cn(
                  'h-full rounded-full transition-colors',
                  isActive ? 'bg-primary' : 'bg-primary/60'
                )}
                style={{ width: `${Math.max(row.pctOfTotal, 2)}%` }}
              />
            </div>
            <span className="text-foreground w-20 shrink-0 text-right text-sm font-medium tabular-nums">
              {usd.format(row.costUsd)}
            </span>
            <span className="text-paragraph w-14 shrink-0 text-right text-xs tabular-nums">
              {row.resourceCount} res.
            </span>
          </button>
        )
      })}
    </div>
  )
}
