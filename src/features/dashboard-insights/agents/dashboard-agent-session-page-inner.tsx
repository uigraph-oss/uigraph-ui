'use client'

import { SectionLoader } from '@/components/section-loader'
import { Button } from '@/components/ui/button'
import { MARKDOWN_COMPONENTS } from '@/features/ai-chat/components/components'
import {
  DashboardSectionContent,
  DashboardSectionHeader,
} from '@/features/dashboard'
import { useCurrentOrganization } from '@/store/auth-store'
import { useQuery } from '@apollo/client'
import { format } from 'date-fns'
import { ArrowLeftIcon, FileDiff } from 'lucide-react'
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

  const facts = [
    { label: 'Agent', value: session.type },
    { label: 'Model', value: session.modelName ?? '—' },
    {
      label: 'Duration',
      value:
        session.durationMs === null || session.durationMs === undefined
          ? 'Running'
          : formatDuration(session.durationMs),
    },
    { label: 'Steps', value: session.totals.stepCount.toLocaleString() },
    {
      label: 'Tokens',
      value: (
        session.totals.inputTokens + session.totals.outputTokens
      ).toLocaleString(),
    },
    {
      label: 'Est. Cost',
      value: formatCost(session.totals.costUsd, session.totals.unpricedSteps),
    },
    {
      label: 'Cache',
      value: `${session.totals.cachedInputTokens.toLocaleString()} read / ${session.totals.cachedOutputTokens.toLocaleString()} written`,
    },
    {
      label: 'Started',
      value: format(new Date(session.startedAt), 'MMM d, yyyy HH:mm'),
    },
    ...(git.repo ? [{ label: 'Repository', value: git.repo }] : []),
    ...(git.branch ? [{ label: 'Branch', value: git.branch }] : []),
    ...(git.targetRef
      ? [{ label: 'Compared against', value: git.targetRef }]
      : []),
    ...metadataEntries(session.metadata).map(([key, value]) => ({
      label: key,
      value,
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
          <div className="border-stock bg-shading/40 grid grid-cols-2 gap-x-6 gap-y-4 rounded-[12px] border p-6 md:grid-cols-4">
            {facts.map((fact) => (
              <div key={fact.label}>
                <p className="text-paragraph text-xs font-medium tracking-wide uppercase">
                  {fact.label}
                </p>
                <p className="text-foreground mt-1 text-sm break-words">
                  {fact.value}
                </p>
              </div>
            ))}
          </div>

          {session.error ? (
            <div className="border-destructive/40 bg-destructive/5 rounded-[12px] border p-6">
              <p className="text-destructive text-sm font-medium">
                This run failed
              </p>
              <p className="text-paragraph mt-2 text-sm break-words">
                {session.error}
              </p>
            </div>
          ) : null}

          {changedArtifacts.length > 0 ? (
            <div className="border-stock bg-shading/40 rounded-[12px] border">
              <p className="text-paragraph border-stock border-b px-6 py-4 text-sm font-medium">
                Changed Artifacts
              </p>
              <ul className="divide-stock divide-y">
                {changedArtifacts.map((step) => (
                  <li
                    key={step.id}
                    className="text-foreground flex items-center gap-3 px-6 py-3 text-sm"
                  >
                    <FileDiff className="text-paragraph size-4" />
                    <span className="font-medium">
                      {artifactPath(step.input) ?? 'unknown path'}
                    </span>
                    <span className="text-paragraph text-xs">{step.name}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {session.report ? (
            <div className="border-stock bg-shading/40 rounded-[12px] border">
              <p className="text-paragraph border-stock border-b px-6 py-4 text-sm font-medium">
                Report
              </p>
              <div className="px-6 py-4 text-sm">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={MARKDOWN_COMPONENTS}
                >
                  {session.report}
                </ReactMarkdown>
              </div>
            </div>
          ) : null}

          <div className="border-stock bg-shading/40 rounded-[12px] border">
            <p className="text-paragraph border-stock border-b px-6 py-4 text-sm font-medium">
              Timeline
            </p>
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
