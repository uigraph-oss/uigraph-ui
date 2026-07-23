'use client'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useExperimentContext } from '../../contexts/experiment-context'
import { MetricTrendChart } from '../metric-chart'
import { Panel } from '../panel'

const limitOptions = ['5', '10', '25', '50', 'all']

export function ExperimentMetricsTab() {
  const { experiment, runs } = useExperimentContext()
  const { projectId } = useParams<{ projectId: string }>()
  const navigate = useNavigate()
  const [limit, setLimit] = useState('25')

  const orderedRuns = [...runs].sort(
    (a, b) => new Date(a.startedAt).getTime() - new Date(b.startedAt).getTime()
  )
  const visibleRuns =
    limit === 'all' ? orderedRuns : orderedRuns.slice(-Number(limit))

  const metricKeys = Array.from(
    new Set(visibleRuns.flatMap((r) => Object.keys(r.metrics ?? {})))
  )
  const barData = visibleRuns.map((r) => {
    const row: Record<string, string | number> = { label: r.name }
    metricKeys.forEach((k) => {
      row[k] = r.metrics[k] ?? 0
    })
    return row
  })

  return (
    <div className="flex flex-col gap-5 p-6">
      <Panel
        title="Scalar metrics by run"
        description="Final metric values compared across runs in this experiment."
        action={
          <Select value={limit} onValueChange={setLimit}>
            <SelectTrigger className="border-stock text-foreground/80 h-[2.7938125rem] w-44 rounded-[0.80315625rem] bg-transparent px-4">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {limitOptions.map((option) => (
                <SelectItem key={option} value={option}>
                  {option === 'all' ? 'All runs' : `Last ${option} runs`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
      >
        <MetricTrendChart
          data={barData}
          metricKeys={metricKeys}
          className="aspect-[3/1] w-full"
          onLabelClick={(label) => {
            const run = visibleRuns.find((r) => r.name === label)
            if (run) {
              void navigate(
                `/dashboard/ml-studio/projects/${projectId}/experiments/${experiment.id}/runs/${run.id}`
              )
            }
          }}
        />
      </Panel>
    </div>
  )
}
