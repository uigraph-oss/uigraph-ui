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
    <table className="w-full text-sm">
      <thead>
        <tr className="text-paragraph border-stock border-b text-left text-xs tracking-wide uppercase">
          <th className="px-6 py-3 font-medium">Run</th>
          <th className="px-6 py-3 font-medium">Status</th>
          <th className="px-6 py-3 font-medium">Triggered By</th>
          <th className="px-6 py-3 font-medium">Model</th>
          <th className="px-6 py-3 text-right font-medium">Steps</th>
          <th className="px-6 py-3 text-right font-medium">Tokens</th>
          <th className="px-6 py-3 text-right font-medium">Cost</th>
          <th className="px-6 py-3 text-right font-medium">Duration</th>
          <th className="px-6 py-3 text-right font-medium">Started</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => {
          const git = gitMetadata(row.metadata)

          return (
            <tr
              key={row.id}
              onClick={() =>
                void navigate(`/dashboard/insights/agents/${row.id}`)
              }
              className="border-stock hover:bg-muted/20 cursor-pointer border-b transition-colors last:border-b-0"
            >
              <td className="px-6 py-3">
                <p className="text-foreground font-medium">
                  {row.title ?? row.type}
                </p>
                <span className="text-paragraph mt-1 flex items-center gap-3 text-xs">
                  <span className="bg-muted/40 rounded-full px-2 py-0.5 font-medium">
                    {row.type}
                  </span>
                  {git.repo ? <span>{git.repo}</span> : null}
                  {git.branch ? (
                    <span className="flex items-center gap-1">
                      <GitBranch className="size-3" />
                      {git.branch}
                    </span>
                  ) : null}
                </span>
              </td>
              <td className="px-6 py-3">
                <AgentStatusBadge status={row.status} />
              </td>
              <td className="text-foreground px-6 py-3">
                <span className="flex items-center gap-2.5">
                  <span className="bg-muted/40 text-paragraph flex size-6 items-center justify-center overflow-hidden rounded-full">
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
                  {row.actorName ?? 'Unknown'}
                </span>
              </td>
              <td className="text-paragraph px-6 py-3">
                {row.modelName ?? '—'}
              </td>
              <td className="text-foreground px-6 py-3 text-right tabular-nums">
                {row.totals.stepCount.toLocaleString()}
              </td>
              <td className="text-foreground px-6 py-3 text-right tabular-nums">
                {(
                  row.totals.inputTokens + row.totals.outputTokens
                ).toLocaleString()}
              </td>
              <td className="text-foreground px-6 py-3 text-right tabular-nums">
                {formatCost(row.totals.costUsd, row.totals.unpricedSteps)}
              </td>
              <td className="text-foreground px-6 py-3 text-right tabular-nums">
                {row.durationMs === null || row.durationMs === undefined
                  ? '—'
                  : formatDuration(row.durationMs)}
              </td>
              <td className="text-paragraph px-6 py-3 text-right whitespace-nowrap">
                {format(new Date(row.startedAt), 'MMM d, HH:mm')}
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}
