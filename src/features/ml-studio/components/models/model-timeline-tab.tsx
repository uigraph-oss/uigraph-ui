'use client'

import { BetterTabController, useBetterTabs } from '@/hooks/use-better-tabs'
import { cn } from '@/lib/utils'
import { useCurrentOrganization } from '@/store/auth-store'
import { useQuery } from '@apollo/client'
import { format, formatDistanceToNow } from 'date-fns'
import { parseAsString, useQueryState } from 'nuqs'
import { useMemo } from 'react'
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
import { StatusBadge } from '../status-badge'

const dotColor: Record<string, string> = {
  production: 'bg-[#21AD6D]',
  staging: 'bg-[#3B6BFF]',
  candidate: 'bg-[#7FA0FF]',
  retired: 'bg-[#586378]',
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

function VersionsTimeline() {
  const { versions } = useModelContext()

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
          {ordered.map((v, i) => {
            return (
              <li key={v.id} className="relative flex gap-4 pb-6 last:pb-0">
                <div className="flex flex-col items-center">
                  <span
                    className={cn(
                      'z-10 mt-1 size-3 rounded-full',
                      dotColor[v.deploymentStatus] || 'bg-[#586378]'
                    )}
                  />
                  {i < ordered.length - 1 && (
                    <span className="absolute top-4 h-full w-px bg-[#2A3242]" />
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-[#F4F7FC]">
                      {v.version}
                    </span>
                    <StatusBadge value={v.deploymentStatus} />
                    <span
                      className="ml-auto text-xs text-[#586378]"
                      title={format(new Date(v.createdAt), 'PPpp')}
                    >
                      Created{' '}
                      {formatDistanceToNow(new Date(v.createdAt), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>

                  {v.description && (
                    <p className="mt-1 text-sm text-[#828DA3]">
                      {v.description}
                    </p>
                  )}

                  <p className="mt-1 text-xs text-[#586378]">
                    <VersionSourceRun runId={v.runId} />
                  </p>
                </div>
              </li>
            )
          })}
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
      From run{' '}
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
              <li key={u.id} className="relative flex gap-4 pb-6 last:pb-0">
                <div className="flex flex-col items-center">
                  <span
                    className={cn(
                      'z-10 mt-1 size-3 rounded-full',
                      dotColor[u.toStatus] || 'bg-[#586378]'
                    )}
                  />
                  {i < updates.length - 1 && (
                    <span className="absolute top-4 h-full w-px bg-[#2A3242]" />
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    {version && (
                      <span className="font-medium text-[#F4F7FC]">
                        {version.version}
                      </span>
                    )}
                    <div className="flex items-center gap-2">
                      {u.fromStatus ? (
                        <>
                          <StatusBadge value={u.fromStatus} />
                          <span className="text-[#586378]">→</span>
                        </>
                      ) : null}
                      <StatusBadge value={u.toStatus} />
                    </div>
                    {u.changedAt && (
                      <span
                        className="ml-auto text-xs text-[#586378]"
                        title={format(new Date(u.changedAt), 'PPpp')}
                      >
                        {formatDistanceToNow(new Date(u.changedAt), {
                          addSuffix: true,
                        })}
                      </span>
                    )}
                  </div>

                  <div className="mt-1 flex items-center gap-1.5 text-xs text-[#586378]">
                    by <MlUser identifier={u.changedBy} />
                  </div>
                </div>
              </li>
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
