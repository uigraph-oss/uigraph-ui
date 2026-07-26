'use client'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useCurrentOrganization } from '@/store/auth-store'
import { useQuery } from '@apollo/client'
import { useCallback, useEffect, useState } from 'react'
import { ML_VERSION_EVALUATIONS } from '../../api/ml-studio'
import { useModelContext } from '../../contexts/model-context'
import { MetricTrendChart } from '../metric-chart'
import { MetricSelect } from '../metric-select'
import { Panel } from '../panel'

const limitOptions = ['5', '10', '25', '50', 'all']

function VersionMetricsLoader({
  versionId,
  onLoad,
}: {
  versionId: string
  onLoad: (versionId: string, metrics: Record<string, number>) => void
}) {
  const orgId = useCurrentOrganization()?.id
  const { data } = useQuery(ML_VERSION_EVALUATIONS, {
    fetchPolicy: 'cache-and-network',
    skip: !orgId || !versionId,
    variables: { orgId: orgId!, versionId },
  })
  const latest = data?.mlVersionEvaluations?.[0]

  useEffect(() => {
    if (!latest) {
      return
    }
    onLoad(versionId, (latest.metrics ?? {}) as Record<string, number>)
  }, [latest, onLoad, versionId])

  return null
}

export function ModelVersionMetrics() {
  const { versions, setVersionId } = useModelContext()
  const [limit, setLimit] = useState('25')
  const [hiddenMetrics, setHiddenMetrics] = useState<string[]>([])
  const [versionMetrics, setVersionMetrics] = useState<
    Record<string, Record<string, number>>
  >({})

  const handleVersionMetrics = useCallback(
    (versionId: string, metrics: Record<string, number>) =>
      setVersionMetrics((current) => ({ ...current, [versionId]: metrics })),
    []
  )

  const allVersionPoints = [...versions]
    .sort((a, b) => Number(a.version) - Number(b.version))
    .map((version) => ({
      id: version.id,
      label: `v${version.version}`,
      metrics: versionMetrics[version.id] ?? {},
    }))
    .filter((point) => Object.keys(point.metrics).length > 0)
  const versionPoints =
    limit === 'all' ? allVersionPoints : allVersionPoints.slice(-Number(limit))

  const metricKeys = Array.from(
    new Set(versionPoints.flatMap((v) => Object.keys(v.metrics)))
  )
  const chartData = versionPoints.map((v) => {
    const row: Record<string, string | number> = { label: v.label }
    metricKeys.forEach((k) => {
      row[k] = v.metrics[k] ?? 0
    })
    return row
  })

  const visibleMetricKeys = metricKeys.filter((k) => !hiddenMetrics.includes(k))

  return (
    <>
      {versions.map((version) => (
        <VersionMetricsLoader
          key={version.id}
          versionId={version.id}
          onLoad={handleVersionMetrics}
        />
      ))}

      <Panel
        title="Metrics across versions"
        description="How each metric compares across versions of this model, using the latest evaluation of each version."
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
              <SelectTrigger className="border-stock text-foreground/80 h-[2.7938125rem] w-48 rounded-[0.80315625rem] bg-transparent px-4">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {limitOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option === 'all'
                      ? 'All versions'
                      : `Last ${option} versions`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        }
      >
        {metricKeys.length > 0 ? (
          <MetricTrendChart
            data={chartData}
            metricKeys={visibleMetricKeys}
            className="aspect-[3/1] w-full"
            onLabelClick={(label) => {
              const version = versionPoints.find((v) => v.label === label)
              if (!version) {
                return
              }
              void setVersionId(version.id)
            }}
          />
        ) : (
          <p className="text-sm text-[#586378]">
            No evaluation metrics recorded for the versions of this model yet.
          </p>
        )}
      </Panel>
    </>
  )
}
