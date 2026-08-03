'use client'

import { SectionLoader } from '@/components/section-loader'
import { Button } from '@/components/ui/button'
import {
  DashboardSectionContent,
  DashboardSectionHeader,
} from '@/features/dashboard'
import { cn } from '@/lib/utils'
import { useCurrentOrganization } from '@/store/auth-store'
import { useQuery } from '@apollo/client'
import { format } from 'date-fns'
import {
  ActivityIcon,
  AlertTriangleIcon,
  ArrowLeftIcon,
  CoinsIcon,
  FileDiffIcon,
  FileTextIcon,
  InfoIcon,
  LayersIcon,
  TimerIcon,
  WalletIcon,
} from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { useNavigate, useParams } from 'react-router-dom'
import remarkGfm from 'remark-gfm'
import { formatDuration } from '../lib/format-duration'
import { AGENT_SESSION } from './api/agent-sessions'
import {
  AgentSessionSteps,
  type AgentSessionStepRow,
} from './components/agent-session-steps'
import { AgentStatusBadge } from './components/agent-status-badge'
import { REPORT_MARKDOWN_COMPONENTS } from './components/report-markdown'
import { formatCost } from './lib/agent-session-format'
import { gitMetadata, metadataEntries } from './lib/agent-session-metadata'

export function DashboardAgentSessionPageInner() {
  const orgId = useCurrentOrganization().id
  const { sessionId } = useParams<{ sessionId: string }>()
  const navigate = useNavigate()

  const { data, loading, error } = useQuery(AGENT_SESSION, {
    variables: { orgId, id: sessionId! },
    pollInterval: 5000,
    skip: !sessionId,
  })

  const session = data?.agentSession.session
  const steps = (data?.agentSession.steps ?? []) as AgentSessionStepRow[]

  if (loading && !session) {
    return (
      <DashboardSectionContent>
        <SectionLoader label="Loading agent run..." />
      </DashboardSectionContent>
    )
  }

  if (error || !session) {
    return (
      <DashboardSectionContent>
        <p className="text-paragraph px-6 py-16 text-center text-sm">
          Couldn&apos;t load this agent run.
        </p>
      </DashboardSectionContent>
    )
  }

  const git = gitMetadata(session.metadata)
  const changedArtifacts = steps.filter(
    (step) =>
      step.kind === 'tool' && (step.name === 'write' || step.name === 'edit')
  )

  const vitals: {
    icon: typeof TimerIcon
    label: string
    value: string | null
  }[] = [
    {
      icon: TimerIcon,
      label: 'Duration',
      value:
        session.durationMs === null || session.durationMs === undefined
          ? 'Running'
          : formatDuration(session.durationMs),
    },
    {
      icon: LayersIcon,
      label: 'Steps',
      value: session.totals.stepCount.toLocaleString(),
    },
    {
      icon: CoinsIcon,
      label: 'Tokens',
      value: (
        session.totals.inputTokens + session.totals.outputTokens
      ).toLocaleString(),
    },
    {
      icon: WalletIcon,
      label: 'Est. Cost',
      value: formatCost(session.totals.costUsd, session.totals.unpricedSteps),
    },
  ]

  const details: { label: string; value: string | null; mono: boolean }[] = [
    { label: 'Agent', value: session.type, mono: true },
    { label: 'Model', value: session.modelName ?? null, mono: true },
    {
      label: 'Cache',
      value: `${session.totals.cachedInputTokens.toLocaleString()} read / ${session.totals.cachedOutputTokens.toLocaleString()} written`,
      mono: false,
    },
    {
      label: 'Started',
      value: format(new Date(session.startedAt), 'MMM d, yyyy HH:mm'),
      mono: false,
    },
    ...(git.repo ? [{ label: 'Repository', value: git.repo, mono: true }] : []),
    ...(git.branch ? [{ label: 'Branch', value: git.branch, mono: true }] : []),
    ...(git.targetRef
      ? [{ label: 'Compared against', value: git.targetRef, mono: true }]
      : []),
    ...metadataEntries(session.metadata).map(([key, value]) => ({
      label: key,
      value,
      mono: true,
    })),
  ]

  return (
    <>
      <DashboardSectionHeader
        title={session.title ?? `${session.type} run`}
        description={`Triggered by ${session.actorName ?? 'unknown'}.`}
      >
        <div className="flex items-center gap-3">
          <AgentStatusBadge status={session.status} />
          <Button
            preset="outline"
            onClick={() => void navigate('/dashboard/insights/agents')}
          >
            <ArrowLeftIcon />
            All Runs
          </Button>
        </div>
      </DashboardSectionHeader>

      <DashboardSectionContent>
        <div className="space-y-6 pb-6">
          {session.error ? (
            <div className="border-destructive/40 bg-destructive/5 flex gap-3 rounded-[12px] border p-5">
              <AlertTriangleIcon className="text-destructive mt-0.5 size-4 shrink-0" />
              <div className="min-w-0">
                <p className="text-destructive text-sm font-semibold">
                  This run failed
                </p>
                <p className="text-paragraph mt-1 font-mono text-[13px] break-words">
                  {session.error}
                </p>
              </div>
            </div>
          ) : null}

          <div className="border-stock bg-shading/40 divide-stock grid grid-cols-2 divide-x divide-y overflow-hidden rounded-[12px] border md:grid-cols-4 md:divide-y-0">
            {vitals.map((vital) => (
              <div key={vital.label} className="px-6 py-5">
                <div className="text-paragraph flex items-center gap-2">
                  <vital.icon className="size-3.5" />
                  <span className="text-[11px] font-medium tracking-[0.08em] uppercase">
                    {vital.label}
                  </span>
                </div>
                <p className="text-foreground mt-2 font-mono text-xl font-semibold tabular-nums">
                  {vital.value ?? <span className="text-paragraph">—</span>}
                </p>
              </div>
            ))}
          </div>

          <div className="border-stock bg-shading/40 overflow-hidden rounded-[12px] border">
            <div className="border-stock bg-shading/70 flex items-center gap-2.5 border-b px-6 py-3.5">
              <InfoIcon className="text-paragraph size-4" />
              <h2 className="text-foreground text-sm font-semibold">Details</h2>
            </div>
            <div className="grid sm:grid-cols-2">
              {details.map((detail) => (
                <div
                  key={detail.label}
                  className="border-stock/60 flex items-baseline justify-between gap-6 border-b px-6 py-3 last:border-b-0"
                >
                  <span className="text-paragraph shrink-0 text-xs font-medium tracking-wide uppercase">
                    {detail.label}
                  </span>
                  <span
                    className={cn(
                      'text-foreground min-w-0 truncate text-right text-sm',
                      detail.mono && 'font-mono text-[13px]'
                    )}
                    title={detail.value ?? undefined}
                  >
                    {detail.value ?? <span className="text-paragraph">—</span>}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {changedArtifacts.length > 0 ? (
            <div className="border-stock bg-shading/40 overflow-hidden rounded-[12px] border">
              <div className="border-stock bg-shading/70 flex items-center gap-2.5 border-b px-6 py-3.5">
                <FileDiffIcon className="text-paragraph size-4" />
                <h2 className="text-foreground text-sm font-semibold">
                  Changed Artifacts
                </h2>
                <span className="text-paragraph ml-auto font-mono text-xs">
                  {changedArtifacts.length === 1
                    ? '1 file'
                    : `${changedArtifacts.length} files`}
                </span>
              </div>
              <ul className="divide-stock/60 divide-y">
                {changedArtifacts.map((step) => {
                  const path = artifactPath(step.input)

                  return (
                    <li
                      key={step.id}
                      className="flex items-center gap-3 px-6 py-3"
                    >
                      <span className="bg-muted/25 text-paragraph flex size-7 shrink-0 items-center justify-center rounded-md">
                        <FileDiffIcon className="size-3.5" />
                      </span>
                      <span className="min-w-0 flex-1 truncate font-mono text-[13px]">
                        {path === null ? (
                          <span className="text-paragraph">unknown path</span>
                        ) : (
                          <>
                            <span className="text-paragraph">
                              {path.slice(0, path.lastIndexOf('/') + 1)}
                            </span>
                            <span className="text-foreground">
                              {path.slice(path.lastIndexOf('/') + 1)}
                            </span>
                          </>
                        )}
                      </span>
                      <span className="bg-muted/40 text-paragraph shrink-0 rounded-full px-2 py-0.5 font-mono text-[11px]">
                        {step.name}
                      </span>
                    </li>
                  )
                })}
              </ul>
            </div>
          ) : null}

          {session.report ? (
            <div className="border-stock bg-shading/40 overflow-hidden rounded-[12px] border">
              <div className="border-stock bg-shading/70 flex items-center gap-2.5 border-b px-6 py-3.5">
                <FileTextIcon className="text-paragraph size-4" />
                <h2 className="text-foreground text-sm font-semibold">
                  Report
                </h2>
              </div>
              <div className="px-6 py-4 text-sm">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={REPORT_MARKDOWN_COMPONENTS}
                >
                  {session.report}
                </ReactMarkdown>
              </div>
            </div>
          ) : null}

          <div className="border-stock bg-shading/40 overflow-hidden rounded-[12px] border">
            <div className="border-stock bg-shading/70 flex items-center gap-2.5 border-b px-6 py-3.5">
              <ActivityIcon className="text-paragraph size-4" />
              <h2 className="text-foreground text-sm font-semibold">
                Timeline
              </h2>
              <span className="text-paragraph ml-auto font-mono text-xs">
                {steps.length === 1 ? '1 step' : `${steps.length} steps`} ·{' '}
                {formatDuration(session.totals.stepDurationMs)}
              </span>
            </div>
            <AgentSessionSteps steps={steps} />
          </div>
        </div>
      </DashboardSectionContent>
    </>
  )
}

function artifactPath(input: unknown): string | null {
  if (typeof input !== 'object' || input === null) {
    return null
  }

  const filePath = (input as Record<string, unknown>).file_path

  if (typeof filePath !== 'string') {
    return null
  }

  return filePath
}
