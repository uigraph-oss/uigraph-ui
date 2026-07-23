'use client'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { format } from 'date-fns'
import { Link, useParams } from 'react-router-dom'
import { useExperimentContext } from '../../contexts/experiment-context'
import { formatMetric } from '../../format'
import type { RunStatus } from '../../types'
import { Panel } from '../panel'
import { StatusBadge } from '../status-badge'

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 flex-1 px-4 py-3">
      <div className="text-[0.65rem] tracking-wide text-[#586378] uppercase">
        {label}
      </div>
      <div className="mt-1 truncate text-sm font-medium text-[#F4F7FC]">
        {value || <span className="font-normal text-[#586378]">—</span>}
      </div>
    </div>
  )
}

const runStatusLabels: Record<RunStatus, string> = {
  completed: 'Completed',
  running: 'Running',
  failed: 'Failed',
  cancelled: 'Cancelled',
}

export function ExperimentOverviewTab() {
  const { experiment, runs } = useExperimentContext()
  const { projectId } = useParams<{ projectId: string }>()

  const statusCounts = runs.reduce<Record<string, number>>((acc, run) => {
    acc[run.status] = (acc[run.status] ?? 0) + 1
    return acc
  }, {})

  const trackedMetrics = Object.keys(runs[0]?.metrics ?? {})
  const primaryMetric = trackedMetrics[0] ?? ''
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
  const values = scoredRuns.map((r) => r.metrics[primaryMetric])
  const bestValue = values[0]
  const meanValue =
    values.length > 0
      ? values.reduce((sum, v) => sum + v, 0) / values.length
      : undefined
  const leadingRun = scoredRuns[0]
  const topRuns = scoredRuns.slice(0, 5)

  return (
    <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-2">
      <Panel
        description={experiment.description || 'No description.'}
        className="md:col-span-2"
      >
        <div className="flex flex-wrap divide-x divide-[var(--color-stock)]">
          <Stat
            label="Status"
            value={
              experiment.status.charAt(0).toUpperCase() +
              experiment.status.slice(1)
            }
          />
          <Stat
            label="Started"
            value={format(new Date(experiment.startedAt), 'PP')}
          />
          <Stat label="Total runs" value={String(runs.length)} />
          <Stat label="Tracked metrics" value={String(trackedMetrics.length)} />
        </div>
      </Panel>

      <Panel
        title="Run health"
        description="Status breakdown across every run in this experiment."
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
        title="Leading metric"
        description={
          primaryMetric
            ? `${primaryLabel} — ${lowerIsBetter ? 'lower' : 'higher'} is better.`
            : undefined
        }
      >
        {primaryMetric && values.length > 0 ? (
          <div className="grid grid-cols-3 gap-x-8 gap-y-5">
            <div>
              <div className="text-2xl font-bold text-[#F4F7FC]">
                {formatMetric(bestValue)}
              </div>
              <div className="mt-1 text-sm text-[#828DA3]">Best</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-[#F4F7FC]">
                {meanValue !== undefined ? formatMetric(meanValue) : '—'}
              </div>
              <div className="mt-1 text-sm text-[#828DA3]">Mean</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-[#F4F7FC]">
                {values.length}
              </div>
              <div className="mt-1 text-sm text-[#828DA3]">Scored runs</div>
            </div>
          </div>
        ) : (
          <p className="text-sm text-[#586378]">
            No metrics recorded for this experiment.
          </p>
        )}
      </Panel>

      <Panel
        title="Leaderboard"
        description={
          leadingRun
            ? `Top runs ranked by ${primaryLabel}.`
            : 'Runs ranked once metrics are recorded.'
        }
        className="md:col-span-2"
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
                    {run.duration}
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
    </div>
  )
}
