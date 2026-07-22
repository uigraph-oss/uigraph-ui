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
import { useNavigate } from 'react-router-dom'
import { useExperimentContext } from '../../contexts/experiment-context'
import { MetricSparkline } from '../metric-sparkline'
import { Panel } from '../panel'
import { StatusBadge } from '../status-badge'

export function ExperimentRunsTab() {
  const { experiment, runs } = useExperimentContext()
  const navigate = useNavigate()
  const [selected, setSelected] = useState<string[]>([])

  const primaryMetric = Object.keys(runs[0]?.metrics ?? {})[0] ?? ''
  const primaryLabel = primaryMetric.replace(/_/g, ' ')

  function toggle(id: string) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  return (
    <div className="flex flex-col gap-5 p-6">
      <Panel
        title="Runs"
        action={
          <Button
            preset="outline"
            className="h-9 px-3"
            disabled={selected.length < 2}
            onClick={() =>
              navigate(
                `/dashboard/ml-studio/experiments/${experiment.id}/compare?runs=${selected.join(',')}`
              )
            }
          >
            <GitCompareIcon />
            Compare ({selected.length})
          </Button>
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
                        `/dashboard/ml-studio/experiments/${experiment.id}/runs/${run.id}`
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
    </div>
  )
}
