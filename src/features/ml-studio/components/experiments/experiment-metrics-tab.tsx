'use client'

import { useExperimentContext } from '../../contexts/experiment-context'
import { MetricTrendChart } from '../metric-chart'
import { Panel } from '../panel'

export function ExperimentMetricsTab() {
  const { runs } = useExperimentContext()

  const metricKeys = Array.from(
    new Set(runs.flatMap((r) => Object.keys(r.metrics ?? {})))
  )
  const barData = runs.map((r) => {
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
      >
        <MetricTrendChart
          data={barData}
          metricKeys={metricKeys}
          className="aspect-[3/1] w-full"
        />
      </Panel>
    </div>
  )
}
