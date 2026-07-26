'use client'

import { BetterTabController, useBetterTabs } from '@/hooks/use-better-tabs'
import { cn } from '@/lib/utils'
import { useCurrentOrganization } from '@/store/auth-store'
import { useQuery } from '@apollo/client'
import { format } from 'date-fns'
import { Check, Circle, Square, X } from 'lucide-react'
import { parseAsString, useQueryState } from 'nuqs'
import { ReactNode, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  ML_STUDIO_DEPLOYMENT_UPDATES,
  ML_STUDIO_EXPERIMENT,
  ML_STUDIO_RUN,
} from '../../api/ml-studio'
import { useModelContext } from '../../contexts/model-context'
import { useProject } from '../../contexts/project-context'
import { MlUser } from '../ml-user'
import { Panel } from '../panel'

const markerStyle: Record<string, { icon: ReactNode; className: string }> = {
  production: {
    icon: <Check className="size-4" strokeWidth={3} />,
    className: 'border-[#21AD6D]/50 bg-[#21AD6D]/15 text-[#3BD68E]',
  },
  staging: {
    icon: <Square className="size-3.5" strokeWidth={2} />,
    className: 'border-[#38415420] bg-[#171D28] text-[#8A93A6]',
  },
  candidate: {
    icon: <Circle className="size-3.5" strokeWidth={2} />,
    className: 'border-[#38415420] bg-[#171D28] text-[#8A93A6]',
  },
  retired: {
    icon: <X className="size-4" strokeWidth={3} />,
    className: 'border-[#E5484D]/30 bg-[#E5484D]/12 text-[#FF6369]',
  },
  deprecated: {
    icon: <X className="size-4" strokeWidth={3} />,
    className: 'border-[#E5484D]/30 bg-[#E5484D]/12 text-[#FF6369]',
  },
  unknown: {
    icon: <Circle className="size-3.5" strokeWidth={2} />,
    className: 'border-[#38415420] bg-[#171D28] text-[#8A93A6]',
  },
}

export function ModelTimelineTab() {
  const [section] = useQueryState('section', parseAsString)
  const [control, activeTab] = useBetterTabs(
    [
      { id: 'versions', label: 'Versions' },
      { id: 'deployments', label: 'Deployments' },
    ],
    section === 'deployments' ? 'deployments' : 'versions'
  )

  return (
    <div className="flex flex-col gap-6 p-6">
      <BetterTabController control={control} />

      {activeTab === 'versions' && <VersionsTimeline />}
      {activeTab === 'deployments' && <DeploymentsTimeline />}
    </div>
  )
}

function TimelineItem({
  status,
  isLast,
  title,
  badges,
  meta,
}: {
  status: string
  isLast: boolean
  title: ReactNode
  badges?: ReactNode
  meta: ReactNode
}) {
  const marker = markerStyle[status] || markerStyle.unknown

  return (
    <li className="relative flex gap-5 pb-9 last:pb-0">
      <div className="relative flex flex-col items-center">
        <span
          className={cn(
            'z-10 flex size-10 shrink-0 items-center justify-center rounded-full border',
            marker.className
          )}
        >
          {marker.icon}
        </span>
        {!isLast && (
          <span className="absolute top-11 bottom-[-40px] w-px bg-[#2A3242]" />
        )}
      </div>

      <div className="flex-1 pt-1">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <h4 className="text-[19px] leading-7 font-bold tracking-[-0.01em] text-[#F4F7FC]">
            {title}
          </h4>
          {badges}
        </div>
        <p className="mt-1 text-[15px] leading-6 text-[#6B7488]">{meta}</p>
      </div>
    </li>
  )
}

function TimelineTitle({ version, stage }: { version: string; stage: string }) {
  return (
    <>
      {version} <span className="mx-1 text-[#8A93A6]">→</span>
      <span className="capitalize">{stage.replace(/-/g, ' ')}</span>
    </>
  )
}

function CurrentPill() {
  return (
    <span className="rounded-full border border-[#21AD6D]/45 bg-[#21AD6D]/10 px-3 py-1 text-[15px] leading-5 font-semibold text-[#3BD68E]">
      current
    </span>
  )
}

function VersionsTimeline() {
  const { versions, model } = useModelContext()

  const ordered = useMemo(
    () =>
      [...versions].sort(
        (a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)
      ),
    [versions]
  )

  return (
    <Panel title="Versions">
      {ordered.length > 0 ? (
        <ol className="relative flex flex-col">
          {ordered.map((v, i) => (
            <TimelineItem
              key={v.id}
              status={v.deploymentStatus}
              isLast={i === ordered.length - 1}
              title={
                <TimelineTitle version={v.version} stage={v.deploymentStatus} />
              }
              badges={model?.productionVersionId === v.id && <CurrentPill />}
              meta={
                <>
                  {format(new Date(v.createdAt), 'MMM d, yyyy')}
                  <span className="px-1.5">·</span>
                  {format(new Date(v.createdAt), 'HH:mm')}
                  <span className="px-1.5">·</span>
                  <VersionSourceRun runId={v.runId} />
                  {v.description && (
                    <>
                      <span className="px-1.5">·</span>
                      {v.description}
                    </>
                  )}
                </>
              }
            />
          ))}
        </ol>
      ) : (
        <p className="text-sm text-[#586378]">No versions recorded.</p>
      )}
    </Panel>
  )
}

function VersionSourceRun({ runId }: { runId?: string }) {
  const orgId = useCurrentOrganization()?.id

  const runQuery = useQuery(ML_STUDIO_RUN, {
    fetchPolicy: 'cache-and-network',
    skip: !orgId || !runId,
    variables: { orgId: orgId!, id: runId ?? '' },
  })
  const run = runQuery.data?.mlRun

  const experimentQuery = useQuery(ML_STUDIO_EXPERIMENT, {
    fetchPolicy: 'cache-and-network',
    skip: !orgId || !run?.experimentId,
    variables: { orgId: orgId!, id: run?.experimentId ?? '' },
  })
  const runExperiment = experimentQuery.data?.mlExperiment

  if (!run) {
    return <>No source run</>
  }

  return (
    <>
      registered from run{' '}
      <Link
        to={`/dashboard/ml-studio/projects/${runExperiment?.projectId}/experiments/${run.experimentId}/runs/${run.id}`}
        className="hover:text-primary text-[#828DA3]"
      >
        {run.name}
      </Link>
    </>
  )
}

function DeploymentsTimeline() {
  const { versions } = useModelContext()
  const { orgId, projectId } = useProject()
  const { data } = useQuery(ML_STUDIO_DEPLOYMENT_UPDATES, {
    fetchPolicy: 'cache-and-network',
    skip: !orgId || !projectId,
    variables: { orgId: orgId!, projectId },
  })

  const versionById = useMemo(
    () => new Map(versions.map((v) => [v.id, v])),
    [versions]
  )

  const updates = useMemo(
    () =>
      (data?.mlVersionDeploymentUpdates ?? [])
        .filter((u) => versionById.has(u.versionId))
        .sort(
          (a, b) => +new Date(b.changedAt ?? 0) - +new Date(a.changedAt ?? 0)
        ),
    [data, versionById]
  )

  return (
    <Panel title="Deployment lifecycle">
      {updates.length > 0 ? (
        <ol className="relative flex flex-col">
          {updates.map((u, i) => {
            const version = versionById.get(u.versionId)
            return (
              <TimelineItem
                key={u.id}
                status={u.toStatus}
                isLast={i === updates.length - 1}
                title={
                  <TimelineTitle
                    version={version?.version ?? 'Version'}
                    stage={u.toStatus}
                  />
                }
                badges={
                  u.fromStatus && (
                    <span className="rounded-full border border-[#2A3242] bg-[#1E2533] px-2.5 py-0.5 text-xs font-medium text-[#828DA3] capitalize">
                      from {u.fromStatus.replace(/-/g, ' ')}
                    </span>
                  )
                }
                meta={
                  <>
                    {u.changedAt && (
                      <>
                        {format(new Date(u.changedAt), 'MMM d, yyyy')}
                        <span className="px-1.5">·</span>
                        {format(new Date(u.changedAt), 'HH:mm')}
                        <span className="px-1.5">·</span>
                      </>
                    )}
                    <span className="inline-flex items-center gap-1.5 align-middle">
                      by <MlUser identifier={u.changedBy} />
                    </span>
                  </>
                }
              />
            )
          })}
        </ol>
      ) : (
        <p className="text-sm text-[#586378]">
          No deployment changes recorded.
        </p>
      )}
    </Panel>
  )
}
