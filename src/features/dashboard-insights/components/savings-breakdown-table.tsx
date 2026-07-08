import { Bot } from 'lucide-react'
import { formatDuration } from '../lib/format-duration'

export type BreakdownRow = {
  key: string
  label: string
  iconUrl?: string
  totalCalls: number
  tokensSaved: number
  estimatedCostUsd: number
  costSavedUsd: number
  totalDurationMs?: number
}

function NameCell({ row }: { row: BreakdownRow }) {
  return (
    <span className="flex items-center gap-2.5">
      <span className="bg-muted/40 text-paragraph flex size-6 items-center justify-center overflow-hidden rounded-md">
        {row.iconUrl ? (
          <img src={row.iconUrl} alt="" className="size-3.5" />
        ) : (
          <Bot className="size-3.5" />
        )}
      </span>
      {row.label}
    </span>
  )
}

export function SavingsBreakdownTable({
  rows,
  variant = 'default',
}: {
  rows: BreakdownRow[]
  variant?: 'default' | 'model'
}) {
  const totalSaved = rows.reduce((sum, r) => sum + r.costSavedUsd, 0)
  function usd(value: number) {
    return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
  }

  if (rows.length === 0) {
    return (
      <p className="text-paragraph px-6 py-8 text-center text-sm">
        No data for this period.
      </p>
    )
  }

  if (variant === 'model') {
    return (
      <table className="w-full text-sm">
        <thead>
          <tr className="text-paragraph border-stock border-b text-left text-xs tracking-wide uppercase">
            <th className="px-6 py-3 font-medium">Name</th>
            <th className="px-6 py-3 text-right font-medium">Estimated Cost</th>
            <th className="px-6 py-3 text-right font-medium">Savings</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.key}
              className="border-stock hover:bg-muted/20 border-b transition-colors last:border-b-0"
            >
              <td className="text-foreground px-6 py-3 font-medium">
                <NameCell row={row} />
              </td>
              <td className="text-foreground px-6 py-3 text-right tabular-nums">
                {usd(row.estimatedCostUsd)}
              </td>
              <td className="text-success px-6 py-3 text-right font-medium tabular-nums">
                {usd(row.costSavedUsd)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    )
  }

  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="text-paragraph border-stock border-b text-left text-xs tracking-wide uppercase">
          <th className="px-6 py-3 font-medium">Name</th>
          <th className="px-6 py-3 text-right font-medium">Calls</th>
          <th className="px-6 py-3 text-right font-medium">Tokens Saved</th>
          <th className="px-6 py-3 text-right font-medium">Resolve Time</th>
          <th className="px-6 py-3 text-right font-medium">$ Saved</th>
          <th className="px-6 py-3 font-medium">% of Total</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => {
          const pct = totalSaved > 0 ? (row.costSavedUsd / totalSaved) * 100 : 0
          return (
            <tr
              key={row.key}
              className="border-stock hover:bg-muted/20 border-b transition-colors last:border-b-0"
            >
              <td className="text-foreground px-6 py-3 font-medium">
                <NameCell row={row} />
              </td>
              <td className="text-foreground px-6 py-3 text-right tabular-nums">
                {row.totalCalls.toLocaleString()}
              </td>
              <td className="text-foreground px-6 py-3 text-right tabular-nums">
                {row.tokensSaved.toLocaleString()}
              </td>
              <td className="text-foreground px-6 py-3 text-right tabular-nums">
                {row.totalDurationMs === undefined
                  ? '—'
                  : formatDuration(row.totalDurationMs)}
              </td>
              <td className="text-success px-6 py-3 text-right font-medium tabular-nums">
                {usd(row.costSavedUsd)}
              </td>
              <td className="px-6 py-3">
                <div className="flex items-center gap-2">
                  <div className="bg-muted/30 h-1.5 w-full max-w-[80px] overflow-hidden rounded-full">
                    <div
                      className="bg-primary h-full rounded-full"
                      style={{ width: `${Math.max(pct, 2)}%` }}
                    />
                  </div>
                  <span className="text-paragraph tabular-nums">
                    {totalSaved > 0 ? `${pct.toFixed(1)}%` : '—'}
                  </span>
                </div>
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}
