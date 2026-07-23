'use client'

import { useCurrentOrganization } from '@/store/auth-store'
import { useQuery } from '@apollo/client'
import { ML_STUDIO_RUNS } from '../../api/ml-studio'
import { useModelContext } from '../../contexts/model-context'
import { formatMetric } from '../../format'
import { MetricLineChart, MetricTrendChart } from '../metric-chart'
import { Panel } from '../panel'

export function ModelMetricsTab() {
  const { selectedRun, versions } = useModelContext()
  const orgId = useCurrentOrganization()?.id

  const runsQuery = useQuery(ML_STUDIO_RUNS, {
    fetchPolicy: 'cache-and-network',
    skip: !orgId,
    variables: { orgId: orgId! },
  })

  const runsById = new Map((runsQuery.data?.mlRuns ?? []).map((r) => [r.id, r]))

  const versionRows = [...versions]
    .filter((v) => v.runId && runsById.has(v.runId))
    .sort((a, b) => Number(a.version) - Number(b.version))
    .map((v) => ({ version: v, run: runsById.get(v.runId!)! }))

  const versionMetricKeys = Array.from(
    new Set(versionRows.flatMap(({ run }) => Object.keys(run.metrics ?? {})))
  )

  const versionBarData = versionRows.map(({ version, run }) => {
    const metrics = (run.metrics ?? {}) as Record<string, number>
    const row: Record<string, string | number> = {
      label: `v${version.version}`,
    }
    versionMetricKeys.forEach((k) => {
      row[k] = metrics[k] ?? 0
    })
    return row
  })

  const latestRun = selectedRun

  if (!latestRun) {
    return (
      <div className="grid grid-cols-1 gap-6 p-6">
        <Panel title="Metrics">
          <p className="text-sm text-[#586378]">
            No run is associated with this version.
          </p>
        </Panel>
      </div>
    )
  }

  const series = latestRun.series
  const curves = Object.entries(series).filter(
    ([, points]) => points.length > 1
  )
  const scalars = Object.entries(latestRun.metrics).filter(
    ([key]) => (series[key]?.length ?? 0) <= 1
  )

  return (
    <div className="grid grid-cols-1 gap-6 p-6">
      {scalars.length > 0 && (
        <Panel
          title="Metrics"
          description="Final values logged for this model version."
        >
          <div className="grid grid-cols-2 gap-x-8 gap-y-6 md:grid-cols-4">
            {scalars.map(([key, value]) => (
              <div key={key}>
                <div className="text-2xl font-bold text-[#F4F7FC]">
                  {formatMetric(value)}
                </div>
                <div className="mt-1 text-xs tracking-wide text-[#586378] uppercase">
                  {key.replace(/_/g, ' ')}
                </div>
              </div>
            ))}
          </div>
        </Panel>
      )}

      {versionRows.length > 1 && versionMetricKeys.length > 0 && (
        <Panel
          title="Metrics across versions"
          description="How each metric trends across model versions."
        >
          <MetricTrendChart
            data={versionBarData}
            metricKeys={versionMetricKeys}
            className="aspect-[3/1] w-full"
          />
        </Panel>
      )}

      {curves.length > 0 && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {curves.map(([key, points]) => (
            <Panel
              key={key}
              title={key.replace(/_/g, ' ')}
              description={`${points.length} steps logged`}
            >
              <MetricLineChart
                series={{ [key]: points }}
                className="aspect-[16/9] w-full"
              />
            </Panel>
          ))}
        </div>
      )}

      {scalars.length === 0 && curves.length === 0 && (
        <Panel title="Metrics">
          <p className="text-sm text-[#586378]">
            No metrics recorded for this version.
          </p>
        </Panel>
      )}
    </div>
  )
}
