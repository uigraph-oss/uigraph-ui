import { format } from 'date-fns'
import { Bot, GitBranch, User } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { formatDuration } from '../../lib/format-duration'
import { formatCost } from '../lib/agent-session-format'
import { gitMetadata } from '../lib/agent-session-metadata'
import { AgentStatusBadge } from './agent-status-badge'

export type AgentSessionRow = {
  id: string
  type: string
  status: string
  title?: string | null
  modelName?: string | null
  actorName?: string | null
  actorAvatarUrl?: string | null
  serviceAccountId?: string | null
  metadata?: unknown
  startedAt: string
  durationMs?: number | null
  totals: {
    stepCount: number
    inputTokens: number
    outputTokens: number
    costUsd?: number | null
    unpricedSteps: number
  }
}

export function AgentSessionsTable({ rows }: { rows: AgentSessionRow[] }) {
  const navigate = useNavigate()

  if (rows.length === 0) {
    return (
      <p className="text-paragraph px-6 py-8 text-center text-sm">
        No agent runs for this period.
      </p>
    )
  }

  return (
    <div className="overflow-x-auto rounded-b-[12px]">
      <table className="w-full min-w-[1180px] table-fixed text-sm">
        <colgroup>
          <col />
          <col className="w-[132px]" />
          <col className="w-[168px]" />
          <col className="w-[184px]" />
          <col className="w-[76px]" />
          <col className="w-[104px]" />
          <col className="w-[88px]" />
          <col className="w-[96px]" />
          <col className="w-[124px]" />
        </colgroup>
        <thead>
          <tr className="text-paragraph border-stock border-b text-left text-xs tracking-wide uppercase">
            <th className="px-6 py-3 font-medium">Run</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium">Triggered By</th>
            <th className="px-4 py-3 font-medium">Model</th>
            <th className="px-4 py-3 text-right font-medium">Steps</th>
            <th className="px-4 py-3 text-right font-medium">Tokens</th>
            <th className="px-4 py-3 text-right font-medium">Cost</th>
            <th className="px-4 py-3 text-right font-medium">Duration</th>
            <th className="px-6 py-3 text-right font-medium">Started</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const git = gitMetadata(row.metadata)
            const title = row.title ?? row.type

            return (
              <tr
                key={row.id}
                onClick={() =>
                  void navigate(`/dashboard/insights/agents/${row.id}`)
                }
                className="border-stock hover:bg-muted/20 cursor-pointer border-b transition-colors last:border-b-0"
              >
                <td className="px-6 py-3">
                  <p
                    className="text-foreground truncate font-medium"
                    title={title}
                  >
                    {title}
                  </p>
                  <div className="text-paragraph mt-1 flex items-center gap-2 text-xs">
                    <span className="bg-muted/40 shrink-0 rounded-full px-2 py-0.5 font-medium">
                      {row.type}
                    </span>
                    {git.repo ? (
                      <span className="min-w-0 truncate" title={git.repo}>
                        {git.repo}
                      </span>
                    ) : null}
                    {git.branch ? (
                      <span
                        className="flex max-w-[180px] shrink-0 items-center gap-1"
                        title={git.branch}
                      >
                        <GitBranch className="size-3 shrink-0" />
                        <span className="truncate">{git.branch}</span>
                      </span>
                    ) : null}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <AgentStatusBadge status={row.status} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <span className="bg-muted/40 text-paragraph flex size-6 shrink-0 items-center justify-center overflow-hidden rounded-full">
                      {row.actorAvatarUrl ? (
                        <img
                          src={row.actorAvatarUrl}
                          alt=""
                          className="size-full object-cover"
                        />
                      ) : row.serviceAccountId ? (
                        <Bot className="size-3.5" />
                      ) : (
                        <User className="size-3.5" />
                      )}
                    </span>
                    <span
                      className="text-foreground min-w-0 truncate"
                      title={row.actorName ?? 'Unknown'}
                    >
                      {row.actorName ?? 'Unknown'}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div
                    className="text-paragraph truncate"
                    title={row.modelName ?? undefined}
                  >
                    {row.modelName ?? '—'}
                  </div>
                </td>
                <td className="text-foreground px-4 py-3 text-right tabular-nums">
                  {row.totals.stepCount.toLocaleString()}
                </td>
                <td className="text-foreground px-4 py-3 text-right tabular-nums">
                  {(
                    row.totals.inputTokens + row.totals.outputTokens
                  ).toLocaleString()}
                </td>
                <td className="text-foreground px-4 py-3 text-right tabular-nums">
                  {formatCost(row.totals.costUsd, row.totals.unpricedSteps) ?? (
                    <span className="text-paragraph">—</span>
                  )}
                </td>
                <td className="text-foreground px-4 py-3 text-right tabular-nums">
                  {row.durationMs === null || row.durationMs === undefined ? (
                    <span className="text-paragraph">—</span>
                  ) : (
                    formatDuration(row.durationMs)
                  )}
                </td>
                <td className="text-paragraph px-6 py-3 text-right whitespace-nowrap">
                  {format(new Date(row.startedAt), 'MMM d, HH:mm')}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
