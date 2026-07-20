'use client'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { GitCompareIcon, PlusIcon } from 'lucide-react'
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { mockExperiments, mockRuns } from '../../constants/mock-data'
import { useModelContext } from '../../contexts/model-context'
import { MetricBarChart } from '../metric-chart'
import { MetricSparkline } from '../metric-sparkline'
import { InfoRow, Panel } from '../panel'
import { StatusBadge } from '../status-badge'

export function ExperimentDetailPage() {
  const { model, selectedVersionId } = useModelContext()
  const { experimentId } = useParams<{ experimentId: string }>()
  const navigate = useNavigate()
  const versionQuery = selectedVersionId ? `?v=${selectedVersionId}` : ''

  const experiment = mockExperiments.find((e) => e.id === experimentId)
  const runs = mockRuns.filter((r) => r.experimentId === experimentId)
  const [selected, setSelected] = useState<string[]>([])

  if (!experiment) {
    return <div className="p-6 text-[#828DA3]">Experiment not found.</div>
  }

  const primaryMetric = Object.keys(runs[0]?.metrics ?? {})[0] ?? ''
  const primaryLabel = primaryMetric.replace(/_/g, ' ')
  const barData = runs.map((r) => ({
    label: r.name,
    [primaryMetric]: r.metrics[primaryMetric] ?? 0,
  }))

  function toggle(id: string) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  return (
    <div className="flex flex-col gap-5 p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-[#F4F7FC]">
            {experiment.name}
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-[#828DA3]">
            {experiment.description}
          </p>
        </div>
        <StatusBadge value={experiment.status} />
      </div>

      <Panel>
        <div className="grid grid-cols-2 gap-5 md:grid-cols-4">
          <InfoRow label="Owner">{experiment.owner}</InfoRow>
          <InfoRow label="Started">
            {new Date(experiment.startedAt).toLocaleDateString()}
          </InfoRow>
          <InfoRow label="Ended">
            {experiment.endedAt
              ? new Date(experiment.endedAt).toLocaleDateString()
              : '—'}
          </InfoRow>
          <InfoRow label="Runs">{runs.length}</InfoRow>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <InfoRow label="Goal">{experiment.goal}</InfoRow>
          <InfoRow label="Hypothesis">{experiment.hypothesis}</InfoRow>
        </div>
      </Panel>

      <Panel
        title="Runs"
        action={
          <div className="flex gap-2">
            <Button
              preset="outline"
              className="h-9 px-3"
              disabled={selected.length < 2}
              onClick={() =>
                navigate(
                  `/dashboard/ml-studio/${model.id}/experiments/${experiment.id}/compare${versionQuery}${versionQuery ? '&' : '?'}runs=${selected.join(',')}`
                )
              }
            >
              <GitCompareIcon />
              Compare ({selected.length})
            </Button>
            <Button
              preset="primary"
              className="h-9 px-3"
              onClick={() =>
                navigate(
                  `/dashboard/ml-studio/${model.id}/experiments/${experiment.id}/runs/new${versionQuery}`
                )
              }
            >
              <PlusIcon />
              Log run
            </Button>
          </div>
        }
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10" />
              <TableHead>Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>{primaryLabel}</TableHead>
              <TableHead>Loss trend</TableHead>
              <TableHead>Duration</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {runs.map((run) => (
              <TableRow key={run.id}>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <Checkbox
                    checked={selected.includes(run.id)}
                    onCheckedChange={() => toggle(run.id)}
                  />
                </TableCell>
                <TableCell>
                  <button
                    type="button"
                    className="hover:text-primary font-medium text-[#F4F7FC]"
                    onClick={() =>
                      navigate(
                        `/dashboard/ml-studio/${model.id}/experiments/${experiment.id}/runs/${run.id}${versionQuery}`
                      )
                    }
                  >
                    {run.name}
                  </button>
                  <div className="text-xs text-[#586378]">{run.id}</div>
                </TableCell>
                <TableCell>
                  <StatusBadge value={run.status} />
                </TableCell>
                <TableCell className="text-[#F4F7FC]">
                  {primaryMetric ? (run.metrics[primaryMetric] ?? '—') : '—'}
                </TableCell>
                <TableCell>
                  <MetricSparkline
                    points={run.series.loss || []}
                    color="#F5A623"
                  />
                </TableCell>
                <TableCell className="text-sm text-[#828DA3]">
                  {run.duration}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Panel>

      <Panel
        title="Scalar metrics by run"
        description={`${primaryLabel} across runs in this experiment.`}
      >
        <MetricBarChart
          data={barData}
          metricKeys={[primaryMetric]}
          className="aspect-[3/1] w-full"
        />
      </Panel>
    </div>
  )
}
