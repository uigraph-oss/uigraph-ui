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
import { GitCompareIcon } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useExperimentContext } from '../../contexts/experiment-context'
import { formatMetric } from '../../format'
import { MetricSparkline } from '../metric-sparkline'
import { StatusBadge } from '../status-badge'
import { RunComparisonDialog } from './run-comparison-dialog'

export function ExperimentRunsTab() {
  const { experiment, runs } = useExperimentContext()
  const { projectId } = useParams<{ projectId: string }>()
  const navigate = useNavigate()
  const [selected, setSelected] = useState<string[]>([])
  const [comparing, setComparing] = useState(false)

  const primaryMetric = Object.keys(runs[0]?.metrics ?? {})[0] ?? ''
  const primaryLabel = primaryMetric.replace(/_/g, ' ')
  const selectedRuns = runs.filter((r) => selected.includes(r.id))

  function toggle(id: string) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  return (
    <div className="flex flex-col gap-4 p-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-semibold text-[#F4F7FC]">Runs</h2>
          <p className="text-sm text-[#828DA3]">
            Every run recorded in this experiment.
          </p>
        </div>
        <Button
          preset="outline"
          className="h-10"
          disabled={selected.length < 2}
          onClick={() => setComparing(true)}
        >
          <GitCompareIcon />
          Compare ({selected.length})
        </Button>
      </div>

      <div className="border-stock bg-card overflow-hidden rounded-xl border">
        <Table className="[&_td]:px-4 [&_td]:py-3.5 [&_th]:h-12 [&_th]:px-4">
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
              <TableRow
                key={run.id}
                className="cursor-pointer"
                onClick={() =>
                  navigate(
                    `/dashboard/ml-studio/projects/${projectId}/experiments/${experiment.id}/runs/${run.id}`
                  )
                }
              >
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <Checkbox
                    checked={selected.includes(run.id)}
                    onCheckedChange={() => toggle(run.id)}
                  />
                </TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
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
                  {primaryMetric && run.metrics[primaryMetric] !== undefined
                    ? formatMetric(run.metrics[primaryMetric])
                    : '—'}
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
      </div>

      <RunComparisonDialog
        runs={selectedRuns}
        open={comparing}
        onOpenChange={setComparing}
      />
    </div>
  )
}
