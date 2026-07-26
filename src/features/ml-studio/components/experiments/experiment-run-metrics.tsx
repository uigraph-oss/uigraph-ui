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
import { MetricSelect } from '../metric-select'
import { Panel } from '../panel'
import { ParameterImpactPanel } from '../parameter-impact-panel'

const limitOptions = ['5', '10', '25', '50', 'all']

export function ExperimentRunMetrics() {
  const { experiment, runs } = useExperimentContext()
  const { projectId } = useParams<{ projectId: string }>()
  const navigate = useNavigate()
  const [limit, setLimit] = useState('25')
  const [hiddenMetrics, setHiddenMetrics] = useState<string[]>([])

  const orderedRuns = [...runs].sort(
    (a, b) => new Date(a.startedAt).getTime() - new Date(b.startedAt).getTime()
  )
  const visibleRuns =
    limit === 'all' ? orderedRuns : orderedRuns.slice(-Number(limit))

  const metricKeys = Array.from(
    new Set(visibleRuns.flatMap((r) => Object.keys(r.metrics ?? {})))
  )
  const chartData = visibleRuns.map((r) => {
    const row: Record<string, string | number> = { label: r.name }
    metricKeys.forEach((k) => {
      row[k] = r.metrics[k] ?? 0
    })
    return row
  })

  const visibleMetricKeys = metricKeys.filter((k) => !hiddenMetrics.includes(k))

  function openRun(runId: string) {
    void navigate(
      `/dashboard/ml-studio/projects/${projectId}/experiments/${experiment.id}/runs/${runId}`
    )
  }

  return (
    <>
      <Panel
        title="Scalar metrics by run"
        description="Final metric values compared across runs in this experiment."
        action={
          <div className="flex items-center gap-3">
            <MetricSelect
              metricKeys={metricKeys}
              hiddenKeys={hiddenMetrics}
              onToggle={(key) =>
                setHiddenMetrics((hidden) =>
                  hidden.includes(key)
                    ? hidden.filter((k) => k !== key)
                    : [...hidden, key]
                )
              }
              onShowAll={() => setHiddenMetrics([])}
              onHideAll={() => setHiddenMetrics(metricKeys)}
            />
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
          </div>
        }
      >
        {visibleRuns.length > 0 ? (
          <MetricTrendChart
            data={chartData}
            metricKeys={visibleMetricKeys}
            className="aspect-[3/1] w-full"
            onLabelClick={(label) => {
              const run = visibleRuns.find((r) => r.name === label)
              if (run) {
                openRun(run.id)
              }
            }}
          />
        ) : (
          <p className="text-sm text-[#586378]">
            No runs have been recorded for this experiment yet.
          </p>
        )}
      </Panel>

      <ParameterImpactPanel
        points={visibleRuns}
        subjectLabel="run"
        onPointClick={openRun}
      />
    </>
  )
}
