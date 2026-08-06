'use client'

import { BetterDialogProvider } from '@/components/better-dialog'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useNow } from '@/hooks/use-now'
import { usePermissions } from '@/hooks/use-permissions'
import { useCurrentOrganization } from '@/store/auth-store'
import { useQuery } from '@apollo/client'
import { format, formatDistanceToNow } from 'date-fns'
import {
  ActivityIcon,
  ArrowDownIcon,
  ArrowUpIcon,
  ChevronsUpDownIcon,
  ClipboardCheckIcon,
  PencilIcon,
  TrophyIcon,
} from 'lucide-react'
import { type ReactNode, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ML_EXPERIMENT_EVALUATIONS } from '../../api/evaluations'
import { useExperimentContext } from '../../contexts/experiment-context'
import { formatMetric, formatRunDuration, runDurationMS } from '../../format'
import { useMetricColumns } from '../../hooks/use-metric-columns'
import type { Run, RunStatus } from '../../types'
import { MetricColumnsSelect } from '../metric-columns-select'
import { MlUser } from '../ml-user'
import { Panel } from '../panel'
import { ExperimentModal } from './experiment-modal'

function Stat({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="min-w-0 py-1">
      <div className="text-[0.65rem] tracking-wide text-[#586378] uppercase">
        {label}
      </div>
      <div className="mt-1 truncate text-sm font-medium text-[#F4F7FC]">
        {value || <span className="font-normal text-[#586378]">—</span>}
      </div>
    </div>
  )
}

const evaluationTypeLabels: Record<string, string> = {
  'Offline Benchmark': 'Offline',
  'Online A/B Test': 'Online',
  'Human Review': 'Human review',
  'Production Monitoring': 'Monitoring',
}

function defaultDirection(key: string): 'asc' | 'desc' {
  if (key === 'duration') {
    return 'asc'
  }
  if (/loss|error|mae|mse|rmse|perplexity/i.test(key)) {
    return 'asc'
  }
  return 'desc'
}

function SortableHead({
  label,
  active,
  direction,
  onClick,
}: {
  label: string
  active: boolean
  direction: 'asc' | 'desc'
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-1 transition-colors hover:text-[#F4F7FC]"
    >
      <span className="truncate capitalize">{label}</span>
      {active && direction === 'asc' && (
        <ArrowUpIcon className="size-3.5 shrink-0" />
      )}
      {active && direction === 'desc' && (
        <ArrowDownIcon className="size-3.5 shrink-0" />
      )}
      {!active && (
        <ChevronsUpDownIcon className="size-3.5 shrink-0 text-[#3A4256]" />
      )}
    </button>
  )
}

const runStatusLabels: Record<RunStatus, string> = {
  completed: 'Completed',
  running: 'Running',
  failed: 'Failed',
  cancelled: 'Cancelled',
}

export function ExperimentOverviewTab() {
  const { canWrite } = usePermissions()
  const { experiment, runs } = useExperimentContext()
  const { projectId, experimentId } = useParams<{
    projectId: string
    experimentId: string
  }>()
  const orgId = useCurrentOrganization()?.id
  const now = useNow()
  const [editOpen, setEditOpen] = useState(false)
  const [sort, setSort] = useState<{
    key: string
    direction: 'asc' | 'desc'
  } | null>(null)

  const evaluationsQuery = useQuery(ML_EXPERIMENT_EVALUATIONS, {
    fetchPolicy: 'cache-and-network',
    skip: !orgId || !experimentId,
    variables: { orgId: orgId!, experimentId: experimentId ?? '' },
  })
  const evaluations = evaluationsQuery.data?.mlExperimentEvaluations ?? []

  const statusCounts = runs.reduce<Record<string, number>>((acc, run) => {
    acc[run.status] = (acc[run.status] ?? 0) + 1
    return acc
  }, {})

  const metricCoverage = runs.reduce<Record<string, number>>((acc, run) => {
    for (const metric of Object.keys(run.metrics)) {
      acc[metric] = (acc[metric] ?? 0) + 1
    }
    return acc
  }, {})

  const trackedMetrics = Object.keys(metricCoverage).sort((a, b) => {
    if (metricCoverage[b] !== metricCoverage[a]) {
      return metricCoverage[b] - metricCoverage[a]
    }
    return a.localeCompare(b)
  })
  const metricColumns = useMetricColumns('ml_leaderboard', trackedMetrics)
  const leaderboardMetrics = trackedMetrics.filter((metric) =>
    metricColumns.columns.includes(metric)
  )

  const sortKey =
    sort && (sort.key === 'duration' || leaderboardMetrics.includes(sort.key))
      ? sort.key
      : (leaderboardMetrics[0] ?? 'duration')
  const sortLabel =
    sortKey === 'duration' ? 'duration' : sortKey.replace(/_/g, ' ')
  const sortDirection =
    sort?.key === sortKey ? sort.direction : defaultDirection(sortKey)

  function sortValue(run: Run) {
    if (sortKey === 'duration') {
      return runDurationMS(run.startedAt, run.endedAt, run.status, now)
    }
    if (sortKey in run.metrics) {
      return run.metrics[sortKey]
    }
    return null
  }

  const scoredRuns = runs
    .filter((r) => r.status === 'completed')
    .sort((a, b) => {
      const aValue = sortValue(a)
      const bValue = sortValue(b)
      if (aValue === null && bValue === null) {
        return 0
      }
      if (aValue === null) {
        return 1
      }
      if (bValue === null) {
        return -1
      }
      if (sortDirection === 'asc') {
        return aValue - bValue
      }
      return bValue - aValue
    })
  const leadingRun = scoredRuns[0]
  const topRuns = scoredRuns.slice(0, 5)

  function toggleSort(key: string) {
    if (key !== sortKey) {
      setSort({ key, direction: defaultDirection(key) })
      return
    }
    if (sortDirection === 'asc') {
      setSort({ key, direction: 'desc' })
      return
    }
    setSort({ key, direction: 'asc' })
  }

  const latestRun = [...runs]
    .sort((a, b) => b.startedAt.localeCompare(a.startedAt))
    .at(0)

  const evaluationTypeCounts = evaluations.reduce<Record<string, number>>(
    (acc, evaluation) => {
      acc[evaluation.type] = (acc[evaluation.type] ?? 0) + 1
      return acc
    },
    {}
  )

  const latestEvaluation = evaluations
    .map((evaluation) => ({
      id: evaluation.id,
      name: evaluation.name,
      startedAt: evaluation.startedAt,
    }))
    .sort((a, b) => b.startedAt.localeCompare(a.startedAt))
    .at(0)

  const lastActivityAt = runs
    .flatMap((r) => (r.endedAt ? [r.endedAt, r.startedAt] : [r.startedAt]))
    .sort()
    .at(-1)

  return (
    <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-2">
      <Panel className="md:col-span-2">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="text-[0.65rem] tracking-wide text-[#586378] uppercase">
              About
            </div>
            <p className="mt-1 text-sm leading-relaxed text-[#828DA3]">
              {experiment.description || '—'}
            </p>
          </div>
          {experiment.source === 'manual' && (
            <Button
              preset="outline"
              disabled={!canWrite}
              onClick={() => setEditOpen(true)}
            >
              <PencilIcon />
              Edit
            </Button>
          )}
        </div>
        <div className="min-w-0">
          <div className="text-[0.65rem] tracking-wide text-[#586378] uppercase">
            Tags
          </div>
          {experiment.tags.length > 0 ? (
            <div className="mt-2 flex flex-wrap gap-2">
              {experiment.tags.map((tag) => (
                <span
                  key={tag}
                  className="border-stock rounded-md border px-2 py-1 text-xs text-[#828DA3]"
                >
                  {tag}
                </span>
              ))}
            </div>
          ) : (
            <p className="mt-1 text-sm text-[#586378]">No tags yet.</p>
          )}
        </div>
        <div className="grid grid-cols-2 items-center gap-x-12 gap-y-4 sm:grid-cols-6">
          <Stat
            label="Created"
            value={
              experiment.createdAt
                ? format(new Date(experiment.createdAt), 'PP')
                : '—'
            }
          />
          <Stat label="Total runs" value={String(runs.length)} />
          <Stat label="Evaluations" value={String(evaluations.length)} />
          <Stat label="Tracked metrics" value={String(trackedMetrics.length)} />
          <Stat
            label="Last activity"
            value={
              lastActivityAt
                ? formatDistanceToNow(new Date(lastActivityAt), {
                    addSuffix: true,
                  })
                : '—'
            }
          />
          <Stat
            label="Updated by"
            value={<MlUser identifier={experiment.updatedBy} />}
          />
        </div>
      </Panel>

      <Panel
        title="Run health"
        icon={<ActivityIcon size={16} />}
        description="Status breakdown across all runs."
        action={
          latestRun ? (
            <div className="flex shrink-0 items-center gap-1.5 text-xs font-normal text-[#586378]">
              <span>Latest run:</span>
              <Link
                to={`/dashboard/ml-studio/projects/${projectId}/experiments/${experiment.id}/runs/${latestRun.id}`}
                className="hover:text-primary truncate text-[#828DA3]"
              >
                {latestRun.name}
              </Link>
              <span>
                ·{' '}
                {formatDistanceToNow(new Date(latestRun.startedAt), {
                  addSuffix: true,
                })}
              </span>
            </div>
          ) : undefined
        }
      >
        {runs.length > 0 ? (
          <div className="grid grid-cols-4 gap-4">
            {(Object.keys(runStatusLabels) as RunStatus[]).map((status) => (
              <div key={status}>
                <div className="text-2xl font-bold text-[#F4F7FC]">
                  {statusCounts[status] ?? 0}
                </div>
                <div className="mt-1 text-xs text-[#828DA3]">
                  {runStatusLabels[status]}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-[#586378]">No runs recorded yet.</p>
        )}
      </Panel>

      <Panel
        title="Evaluations"
        icon={<ClipboardCheckIcon size={16} />}
        description={`${evaluations.length} ${evaluations.length === 1 ? 'evaluation' : 'evaluations'} in this experiment.`}
        action={
          latestEvaluation ? (
            <div className="flex shrink-0 items-center gap-1.5 text-xs font-normal text-[#586378]">
              <span>Latest:</span>
              <Link
                to={`/dashboard/ml-studio/projects/${projectId}/experiments/${experiment.id}/evaluations/${latestEvaluation.id}`}
                className="hover:text-primary truncate text-[#828DA3]"
              >
                {latestEvaluation.name}
              </Link>
              <span>
                ·{' '}
                {formatDistanceToNow(new Date(latestEvaluation.startedAt), {
                  addSuffix: true,
                })}
              </span>
            </div>
          ) : undefined
        }
      >
        {evaluations.length > 0 ? (
          <div className="grid grid-cols-4 gap-4">
            {Object.keys(evaluationTypeLabels).map((type) => (
              <div key={type}>
                <div className="text-2xl font-bold text-[#F4F7FC]">
                  {evaluationTypeCounts[type] ?? 0}
                </div>
                <div className="mt-1 text-xs text-[#828DA3]">
                  {evaluationTypeLabels[type]}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-[#586378]">
            No evaluations recorded for this experiment.
          </p>
        )}
      </Panel>

      <Panel
        title="Leaderboard"
        icon={<TrophyIcon size={16} />}
        description={
          leadingRun
            ? `Top completed runs ranked by ${sortLabel}.`
            : 'Completed runs ranked once metrics are recorded.'
        }
        className="md:col-span-2"
      >
        {topRuns.length > 0 ? (
          <Table className="table-fixed">
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">#</TableHead>
                <TableHead className="w-[30%]">Run</TableHead>
                {leaderboardMetrics.map((metric) => (
                  <TableHead key={metric}>
                    <SortableHead
                      label={metric.replace(/_/g, ' ')}
                      active={metric === sortKey}
                      direction={sortDirection}
                      onClick={() => toggleSort(metric)}
                    />
                  </TableHead>
                ))}
                <TableHead className="w-32">
                  <SortableHead
                    label="Duration"
                    active={sortKey === 'duration'}
                    direction={sortDirection}
                    onClick={() => toggleSort('duration')}
                  />
                </TableHead>
                <TableHead className="w-12 !px-2 text-center">
                  <MetricColumnsSelect
                    options={metricColumns.options}
                    columns={metricColumns.columns}
                    onToggle={metricColumns.toggle}
                    onSelectAll={metricColumns.selectAll}
                    onClear={metricColumns.clear}
                    onReset={metricColumns.reset}
                  />
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topRuns.map((run, index) => (
                <TableRow key={run.id}>
                  <TableCell className="text-[#586378]">{index + 1}</TableCell>
                  <TableCell className="truncate">
                    <Link
                      to={`/dashboard/ml-studio/projects/${projectId}/experiments/${experiment.id}/runs/${run.id}`}
                      className="hover:text-primary font-medium text-[#F4F7FC]"
                    >
                      {run.name}
                    </Link>
                  </TableCell>
                  {leaderboardMetrics.map((metric) => (
                    <TableCell
                      key={metric}
                      className={
                        metric === sortKey
                          ? 'truncate text-[#F4F7FC]'
                          : 'truncate text-[#828DA3]'
                      }
                    >
                      {metric in run.metrics ? (
                        formatMetric(run.metrics[metric])
                      ) : (
                        <span className="text-[#586378]">—</span>
                      )}
                    </TableCell>
                  ))}
                  <TableCell
                    className={
                      sortKey === 'duration'
                        ? 'text-sm text-[#F4F7FC]'
                        : 'text-sm text-[#828DA3]'
                    }
                  >
                    {formatRunDuration(run, now)}
                  </TableCell>
                  <TableCell />
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="text-sm text-[#586378]">No completed runs yet.</p>
        )}
      </Panel>

      {projectId && (
        <BetterDialogProvider open={editOpen} onOpenChange={setEditOpen}>
          <ExperimentModal
            onClose={() => setEditOpen(false)}
            experiment={experiment}
            projectId={projectId}
          />
        </BetterDialogProvider>
      )}
    </div>
  )
}
