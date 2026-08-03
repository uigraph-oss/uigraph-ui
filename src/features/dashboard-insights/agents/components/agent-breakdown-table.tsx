import { Bot, Cpu, User } from 'lucide-react'
import { formatDuration } from '../../lib/format-duration'
import { formatCost, successRate } from '../lib/agent-session-format'
import type { AgentGroupRow } from '../lib/agent-session-group'

export function AgentBreakdownTable({ rows }: { rows: AgentGroupRow[] }) {
  if (rows.length === 0) {
    return (
      <p className="text-paragraph px-6 py-8 text-center text-sm">
        No agent runs for this period.
      </p>
    )
  }

  const totalTokens = rows.reduce((sum, row) => sum + row.tokens, 0)

  return (
    <div className="overflow-x-auto rounded-b-[12px]">
      <table className="w-full min-w-[1000px] table-fixed text-sm">
        <colgroup>
          <col />
          <col className="w-[92px]" />
          <col className="w-[176px]" />
          <col className="w-[88px]" />
          <col className="w-[112px]" />
          <col className="w-[96px]" />
          <col className="w-[116px]" />
          <col className="w-[168px]" />
        </colgroup>
        <thead>
          <tr className="text-paragraph border-stock border-b text-left text-xs tracking-wide uppercase">
            <th className="px-6 py-3 font-medium">Name</th>
            <th className="px-4 py-3 text-right font-medium">Runs</th>
            <th className="px-4 py-3 font-medium">Outcome</th>
            <th className="px-4 py-3 text-right font-medium">Steps</th>
            <th className="px-4 py-3 text-right font-medium">Tokens</th>
            <th className="px-4 py-3 text-right font-medium">Cost</th>
            <th className="px-4 py-3 text-right font-medium">Avg Duration</th>
            <th className="px-6 py-3 font-medium">% of Tokens</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const pct = totalTokens > 0 ? (row.tokens / totalTokens) * 100 : 0
            const avgDurationMs =
              row.finishedSessions > 0
                ? row.totalDurationMs / row.finishedSessions
                : 0

            return (
              <tr
                key={row.key}
                className="border-stock hover:bg-muted/20 border-b transition-colors last:border-b-0"
              >
                <td className="px-6 py-3">
                  <div className="flex items-center gap-2.5">
                    <span className="bg-muted/40 text-paragraph flex size-6 shrink-0 items-center justify-center overflow-hidden rounded-full">
                      {row.avatarUrl ? (
                        <img
                          src={row.avatarUrl}
                          alt=""
                          className="size-full object-cover"
                        />
                      ) : row.accountType === 'service' ? (
                        <Bot className="size-3.5" />
                      ) : row.accountType === 'user' ? (
                        <User className="size-3.5" />
                      ) : (
                        <Cpu className="size-3.5" />
                      )}
                    </span>
                    <span
                      className="text-foreground min-w-0 truncate font-medium"
                      title={row.label}
                    >
                      {row.label}
                    </span>
                    {row.accountType === 'service' ? (
                      <span className="bg-muted/40 text-paragraph shrink-0 rounded-full px-2 py-0.5 text-xs font-medium">
                        Service
                      </span>
                    ) : null}
                  </div>
                </td>
                <td className="text-foreground px-4 py-3 text-right tabular-nums">
                  {row.totalSessions.toLocaleString()}
                </td>
                <td className="overflow-hidden px-4 py-3">
                  <div className="text-paragraph flex items-center gap-2 text-xs whitespace-nowrap">
                    <span className="text-foreground font-medium tabular-nums">
                      {successRate(row.completedSessions, row.failedSessions)}
                    </span>
                    <span className="text-success">
                      {row.completedSessions.toLocaleString()} ok
                    </span>
                    <span className="text-destructive">
                      {row.failedSessions.toLocaleString()} failed
                    </span>
                    {row.runningSessions > 0 ? (
                      <span className="text-primary">
                        {row.runningSessions.toLocaleString()} running
                      </span>
                    ) : null}
                  </div>
                </td>
                <td className="text-foreground px-4 py-3 text-right tabular-nums">
                  {row.stepCount.toLocaleString()}
                </td>
                <td className="text-foreground px-4 py-3 text-right tabular-nums">
                  {row.tokens.toLocaleString()}
                </td>
                <td className="text-foreground px-4 py-3 text-right tabular-nums">
                  {formatCost(row.costUsd, row.unpricedSteps)}
                </td>
                <td className="text-foreground px-4 py-3 text-right tabular-nums">
                  {row.finishedSessions === 0
                    ? '—'
                    : formatDuration(avgDurationMs)}
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
                      {totalTokens > 0 ? `${pct.toFixed(1)}%` : '—'}
                    </span>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
