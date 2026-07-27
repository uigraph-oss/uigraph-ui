'use client'

import { BetterDialogProvider } from '@/components/better-dialog'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useCurrentOrganization } from '@/store/auth-store'
import { useQuery } from '@apollo/client'
import { format, formatDistanceToNow } from 'date-fns'
import {
  ActivityIcon,
  ClipboardCheckIcon,
  PencilIcon,
  TrophyIcon,
} from 'lucide-react'
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ML_EXPERIMENT_EVALUATIONS } from '../../api/evaluations'
import { useExperimentContext } from '../../contexts/experiment-context'
import { formatMetric, formatRunDuration } from '../../format'
import type { RunStatus } from '../../types'
import { Panel } from '../panel'
import { StatusBadge } from '../status-badge'
import { ExperimentModal } from './experiment-modal'

function Stat({ label, value }: { label: string; value: string }) {
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

const runStatusLabels: Record<RunStatus, string> = {
  completed: 'Completed',
  running: 'Running',
  failed: 'Failed',
  cancelled: 'Cancelled',
}

export function ExperimentOverviewTab() {
  const { experiment, runs } = useExperimentContext()
  const { projectId, experimentId } = useParams<{
    projectId: string
    experimentId: string
  }>()
  const orgId = useCurrentOrganization()?.id
  const [editOpen, setEditOpen] = useState(false)
  const [selectedMetric, setSelectedMetric] = useState('')

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

  const trackedMetrics = [
    ...new Set(runs.flatMap((run) => Object.keys(run.metrics))),
  ]
  const primaryMetric = trackedMetrics.includes(selectedMetric)
    ? selectedMetric
    : (trackedMetrics[0] ?? '')
  const primaryLabel = primaryMetric.replace(/_/g, ' ')
  const lowerIsBetter = /loss|error|mae|mse|rmse|perplexity/i.test(
    primaryMetric
  )

  const scoredRuns = runs
    .filter((r) => primaryMetric in r.metrics)
    .sort((a, b) =>
      lowerIsBetter
        ? a.metrics[primaryMetric] - b.metrics[primaryMetric]
        : b.metrics[primaryMetric] - a.metrics[primaryMetric]
    )
  const leadingRun = scoredRuns[0]
  const topRuns = scoredRuns.slice(0, 5)

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
    .flatMap((r) => [r.endedAt, r.startedAt])
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
          <Button preset="outline" onClick={() => setEditOpen(true)}>
            <PencilIcon />
            Edit
          </Button>
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
        <div className="grid grid-cols-2 items-center gap-x-12 gap-y-4 sm:grid-cols-5">
          <Stat
            label="Started"
            value={format(new Date(experiment.startedAt), 'PP')}
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
            ? `Top runs ranked by ${primaryLabel}.`
            : 'Runs ranked once metrics are recorded.'
        }
        className="md:col-span-2"
        action={
          trackedMetrics.length > 0 ? (
            <Select value={primaryMetric} onValueChange={setSelectedMetric}>
              <SelectTrigger className="border-stock text-foreground/80 h-[2.7938125rem] w-48 rounded-[0.80315625rem] bg-transparent px-4">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {trackedMetrics.map((metric) => (
                  <SelectItem key={metric} value={metric}>
                    {metric.replace(/_/g, ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : undefined
        }
      >
        {topRuns.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">#</TableHead>
                <TableHead>Run</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>{primaryLabel}</TableHead>
                <TableHead>Duration</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topRuns.map((run, index) => (
                <TableRow key={run.id}>
                  <TableCell className="text-[#586378]">{index + 1}</TableCell>
                  <TableCell>
                    <Link
                      to={`/dashboard/ml-studio/projects/${projectId}/experiments/${experiment.id}/runs/${run.id}`}
                      className="hover:text-primary font-medium text-[#F4F7FC]"
                    >
                      {run.name}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <StatusBadge value={run.status} />
                  </TableCell>
                  <TableCell className="text-[#F4F7FC]">
                    {formatMetric(run.metrics[primaryMetric])}
                  </TableCell>
                  <TableCell className="text-sm text-[#828DA3]">
                    {formatRunDuration(run)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="text-sm text-[#586378]">
            No runs with recorded metrics yet.
          </p>
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
