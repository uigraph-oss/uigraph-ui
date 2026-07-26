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
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ML_VERSION_EVALUATIONS } from '../../api/ml-studio'
import { useModelContext } from '../../contexts/model-context'
import { MetricTrendChart } from '../metric-chart'
import { MetricSelect } from '../metric-select'
import { Panel } from '../panel'

const limitOptions = ['5', '10', '25', '50', 'all']

export function ModelEvaluationMetrics() {
  const { selectedVersion } = useModelContext()
  const orgId = useCurrentOrganization()?.id
  const { projectId, modelId } = useParams<{
    projectId: string
    modelId: string
  }>()
  const navigate = useNavigate()
  const [limit, setLimit] = useState('25')
  const [hiddenMetrics, setHiddenMetrics] = useState<string[]>([])

  const evaluationsQuery = useQuery(ML_VERSION_EVALUATIONS, {
    fetchPolicy: 'cache-and-network',
    skip: !orgId || !selectedVersion?.id,
    variables: { orgId: orgId!, versionId: selectedVersion?.id ?? '' },
  })

  const allEvaluations = [
    ...(evaluationsQuery.data?.mlVersionEvaluations ?? []),
  ]
    .reverse()
    .map((evaluation) => ({
      id: evaluation.id,
      name: evaluation.name,
      metrics: (evaluation.metrics ?? {}) as Record<string, number>,
    }))

  const evaluations =
    limit === 'all' ? allEvaluations : allEvaluations.slice(-Number(limit))

  const metricKeys = Array.from(
    new Set(evaluations.flatMap((e) => Object.keys(e.metrics)))
  )
  const chartData = evaluations.map((e) => {
    const row: Record<string, string | number> = { label: e.name }
    metricKeys.forEach((k) => {
      row[k] = e.metrics[k] ?? 0
    })
    return row
  })

  const visibleMetricKeys = metricKeys.filter((k) => !hiddenMetrics.includes(k))

  return (
    <Panel
      title="Metrics across evaluations"
      description="How each metric trends across evaluations of this version."
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
                    ? 'All evaluations'
                    : `Last ${option} evaluations`}
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
            const evaluation = evaluations.find((e) => e.name === label)
            if (!evaluation) {
              return
            }
            void navigate(
              `/dashboard/ml-studio/projects/${projectId}/models/${modelId}/evaluations/${evaluation.id}`
            )
          }}
        />
      ) : (
        <p className="text-sm text-[#586378]">
          {evaluationsQuery.loading
            ? 'Loading evaluations…'
            : 'No evaluation metrics recorded for this version yet.'}
        </p>
      )}
    </Panel>
  )
}
