'use client'

import { useExperimentContext } from '../../contexts/experiment-context'
import { MetricBarChart } from '../metric-chart'
import { Panel } from '../panel'

export function ExperimentMetricsTab() {
  const { runs } = useExperimentContext()

  const primaryMetric = Object.keys(runs[0]?.metrics ?? {})[0] ?? ''
  const primaryLabel = primaryMetric.replace(/_/g, ' ')
  const barData = runs.map((r) => ({
    label: r.name,
    [primaryMetric]: r.metrics[primaryMetric] ?? 0,
  }))

  return (
    <div className="flex flex-col gap-5 p-6">
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
