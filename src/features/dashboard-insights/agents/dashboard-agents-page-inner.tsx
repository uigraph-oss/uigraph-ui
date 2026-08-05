'use client'

import { SectionLoader } from '@/components/section-loader'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import {
  DashboardSectionContent,
  DashboardSectionHeader,
} from '@/features/dashboard'
import { useSearchParamsState } from '@/hooks/use-search-params-state'
import { useCurrentOrganization } from '@/store/auth-store'
import { useQuery } from '@apollo/client'
import { useState } from 'react'
import { AGENT_SESSIONS, AGENT_SESSION_SUMMARY } from './api/agent-sessions'
import { AgentBreakdownTable } from './components/agent-breakdown-table'
import { AgentSessionsEmptyState } from './components/agent-sessions-empty-state'
import { AgentSessionsTable } from './components/agent-sessions-table'
import { AgentSummaryCards } from './components/agent-summary-cards'
import { groupAgentSessions } from './lib/agent-session-group'

const PERIODS = [
  { value: '1d', label: 'Today' },
  { value: '7d', label: '7d' },
  { value: '30d', label: '30d' },
  { value: '1y', label: '1y' },
]

const STATUSES = [
  { value: 'all', label: 'All statuses' },
  { value: 'running', label: 'Running' },
  { value: 'completed', label: 'Completed' },
  { value: 'failed', label: 'Failed' },
  { value: 'cancelled', label: 'Cancelled' },
]

const TYPES = [
  { value: 'all', label: 'All agents' },
  { value: 'artifacts', label: 'Artifacts' },
  { value: 'impact', label: 'Impact' },
]

const VIEWS = [
  { value: 'runs', label: 'Runs' },
  { value: 'agent', label: 'By Agent' },
  { value: 'model', label: 'By Model' },
  { value: 'user', label: 'By User' },
] as const

type AgentsView = (typeof VIEWS)[number]['value']

export function DashboardAgentsPageInner() {
  const orgId = useCurrentOrganization().id
  const [view, setView] = useState<AgentsView>('runs')
  const [
    { period: periodParam, status: statusParam, type: typeParam },
    setSearchParams,
  ] = useSearchParamsState('period', 'status', 'type')

  const period = periodParam ?? '7d'
  const status = statusParam ?? 'all'
  const type = typeParam ?? 'all'

  const summary = useQuery(AGENT_SESSION_SUMMARY, {
    variables: {
      orgId,
      period,
    },
  })

  const sessions = useQuery(AGENT_SESSIONS, {
    variables: {
      orgId,
      period,
      status: view === 'runs' && status !== 'all' ? status : undefined,
      type: view === 'runs' && type !== 'all' ? type : undefined,
      limit: 50,
    },
    pollInterval:
      (summary.data?.agentSessionSummary.runningSessions ?? 0) > 0
        ? 5000
        : undefined,
  })

  const loading = summary.loading || sessions.loading
  const error = summary.error || sessions.error
  const rows = sessions.data?.agentSessions.sessions ?? []
  const totalRuns = sessions.data?.agentSessions.total ?? 0
  const groupRows = view === 'runs' ? [] : groupAgentSessions(rows, view)
  const isEmpty =
    !loading &&
    !error &&
    (summary.data?.agentSessionSummary.totalSessions ?? 0) === 0

  return (
    <>
      <DashboardSectionHeader
        title="Agent Runs"
        description="Every UiGraph agent run, its steps, tokens and cost."
      >
        <ToggleGroup
          type="single"
          value={period}
          onValueChange={(value) => value && setSearchParams({ period: value })}
          variant="outline"
        >
          {PERIODS.map((p) => (
            <ToggleGroupItem
              key={p.value}
              value={p.value}
              aria-label={p.label}
              className="hover:bg-muted hover:text-foreground px-5"
            >
              {p.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </DashboardSectionHeader>

      <DashboardSectionContent>
        {loading ? (
          <SectionLoader label="Loading agent runs..." />
        ) : error ? (
          <p className="text-paragraph px-6 py-16 text-center text-sm">
            Couldn&apos;t load agent runs right now. Please try again.
          </p>
        ) : isEmpty ? (
          <AgentSessionsEmptyState />
        ) : (
          <div className="space-y-6 pb-6">
            <AgentSummaryCards
              totalSessions={summary.data!.agentSessionSummary.totalSessions}
              completedSessions={
                summary.data!.agentSessionSummary.completedSessions
              }
              failedSessions={summary.data!.agentSessionSummary.failedSessions}
              runningSessions={
                summary.data!.agentSessionSummary.runningSessions
              }
              totalDurationMs={
                summary.data!.agentSessionSummary.totalDurationMs
              }
              inputTokens={summary.data!.agentSessionSummary.totals.inputTokens}
              outputTokens={
                summary.data!.agentSessionSummary.totals.outputTokens
              }
              costUsd={summary.data!.agentSessionSummary.totals.costUsd}
              unpricedSteps={
                summary.data!.agentSessionSummary.totals.unpricedSteps
              }
            />

            <div className="border-stock bg-shading/40 rounded-[12px] border">
              <div className="border-stock flex flex-wrap items-center justify-between gap-3 border-b px-6 py-4">
                <ToggleGroup
                  type="single"
                  value={view}
                  onValueChange={(value) =>
                    value && setView(value as AgentsView)
                  }
                  variant="outline"
                >
                  {VIEWS.map((v) => (
                    <ToggleGroupItem
                      key={v.value}
                      value={v.value}
                      className="hover:bg-muted hover:text-foreground px-5"
                    >
                      {v.label}
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>

                <div className="flex flex-wrap items-center gap-3">
                  <p className="text-paragraph text-xs">
                    {view === 'runs'
                      ? `Showing ${rows.length} of ${totalRuns} runs`
                      : `${groupRows.length} grouped from ${rows.length} of ${totalRuns} runs`}
                  </p>

                  {view === 'runs' ? (
                    <>
                      <Select
                        value={type}
                        onValueChange={(value) =>
                          setSearchParams({
                            type: value === 'all' ? null : value,
                          })
                        }
                      >
                        <SelectTrigger className="h-9 w-[150px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {TYPES.map((t) => (
                            <SelectItem key={t.value} value={t.value}>
                              {t.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Select
                        value={status}
                        onValueChange={(value) =>
                          setSearchParams({
                            status: value === 'all' ? null : value,
                          })
                        }
                      >
                        <SelectTrigger className="h-9 w-[150px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {STATUSES.map((s) => (
                            <SelectItem key={s.value} value={s.value}>
                              {s.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </>
                  ) : null}
                </div>
              </div>

              {view === 'runs' ? (
                <AgentSessionsTable rows={rows} />
              ) : (
                <AgentBreakdownTable rows={groupRows} />
              )}
            </div>

            {summary.data!.agentSessionSummary.totals.unpricedSteps > 0 ? (
              <p className="text-paragraph text-center text-xs">
                * Cost is an estimate.{' '}
                {summary.data!.agentSessionSummary.totals.unpricedSteps} step(s)
                ran on a model with no known price and are not included.
              </p>
            ) : null}
          </div>
        )}
      </DashboardSectionContent>
    </>
  )
}
