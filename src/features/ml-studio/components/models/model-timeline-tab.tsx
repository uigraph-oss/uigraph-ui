'use client'

import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { useCurrentOrganization } from '@/store/auth-store'
import { useQuery } from '@apollo/client'
import { format, isValid } from 'date-fns'
import { Circle } from 'lucide-react'
import { ReactNode, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { ML_STUDIO_EXPERIMENT } from '../../api/experiments'
import { ML_STUDIO_RUN } from '../../api/runs'
import { useModelContext } from '../../contexts/model-context'
import { Panel } from '../panel'

export function ModelTimelineTab() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <VersionsTimeline />
    </div>
  )
}

function TimelineItem({
  isLast,
  title,
  badges,
  meta,
}: {
  isLast: boolean
  title: ReactNode
  badges?: ReactNode
  meta: ReactNode
}) {
  return (
    <li className="relative flex gap-3 pb-6 last:pb-0">
      <div className="relative flex flex-col items-center">
        <span
          className={cn(
            'z-10 flex size-7 shrink-0 items-center justify-center rounded-full border',
            'border-[#2A3242] bg-[#1E2533] text-[#828DA3]'
          )}
        >
          <Circle className="size-3" />
        </span>
        {!isLast && (
          <span className="absolute top-8 bottom-[-24px] w-px bg-[#2A3242]" />
        )}
      </div>

      <div className="flex-1">
        <div className="flex min-h-7 flex-wrap items-center gap-2">
          <h4 className="text-sm font-semibold text-[#F4F7FC]">{title}</h4>
          {badges}
        </div>
        <p className="mt-0.5 text-xs text-[#586378]">{meta}</p>
      </div>
    </li>
  )
}

function CurrentPill() {
  return (
    <Badge className="rounded-md border border-[#21AD6D]/30 bg-[#21AD6D]/15 font-medium text-[#3BD68E]">
      current
    </Badge>
  )
}

function LatestPill() {
  return (
    <Badge className="rounded-md border border-[#3B6BFF]/30 bg-[#3B6BFF]/15 font-medium text-[#7FA0FF]">
      latest
    </Badge>
  )
}

function VersionsTimeline() {
  const { versions, model, latestVersionId } = useModelContext()

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
              isLast={i === ordered.length - 1}
              title={v.version}
              badges={
                <>
                  {model?.productionVersionId === v.id && <CurrentPill />}
                  {latestVersionId === v.id && <LatestPill />}
                </>
              }
              meta={
                <>
                  {isValid(new Date(v.createdAt)) && (
                    <>
                      {format(new Date(v.createdAt), 'MMM d, yyyy')}
                      <span className="px-1.5">·</span>
                      {format(new Date(v.createdAt), 'HH:mm')}
                      <span className="px-1.5">·</span>
                    </>
                  )}
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
