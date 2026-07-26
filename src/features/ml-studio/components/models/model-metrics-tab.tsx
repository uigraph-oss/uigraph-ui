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
import { format, formatDistanceToNow } from 'date-fns'
import { CalendarDays, UserRound } from 'lucide-react'
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  ML_STUDIO_EXPERIMENT_RUNS,
  ML_VERSION_EVALUATIONS,
} from '../../api/ml-studio'
import { useModelContext } from '../../contexts/model-context'
import { formatMetric } from '../../format'
import { MetricTrendChart } from '../metric-chart'
import { Panel } from '../panel'

const limitOptions = ['5', '10', '25', '50', 'all']

export function ModelMetricsTab() {
  const { selectedVersion, versions, setVersionId } = useModelContext()
  const orgId = useCurrentOrganization()?.id
  const { projectId, modelId } = useParams<{
    projectId: string
    modelId: string
  }>()
  const navigate = useNavigate()
  const [limit, setLimit] = useState('25')
  const [versionLimit, setVersionLimit] = useState('25')

  const evaluationsQuery = useQuery(ML_VERSION_EVALUATIONS, {
    fetchPolicy: 'cache-and-network',
    skip: !orgId || !selectedVersion?.id,
    variables: { orgId: orgId!, versionId: selectedVersion?.id ?? '' },
  })

  const runsQuery = useQuery(ML_STUDIO_EXPERIMENT_RUNS, {
    fetchPolicy: 'cache-and-network',
    skip: !orgId || !projectId,
    variables: { orgId: orgId!, projectId: projectId ?? '' },
  })

  const runMetricsById = new Map(
    (runsQuery.data?.mlRuns ?? []).map((run) => [
      run.id,
      (run.metrics ?? {}) as Record<string, number>,
    ])
  )

  const allVersionPoints = [...versions]
    .sort((a, b) => Number(a.version) - Number(b.version))
    .map((version) => ({
      id: version.id,
      label: `v${version.version}`,
      metrics: version.runId
        ? (runMetricsById.get(version.runId) ?? {})
        : ({} as Record<string, number>),
    }))
  const versionPoints =
    versionLimit === 'all'
      ? allVersionPoints
      : allVersionPoints.slice(-Number(versionLimit))

  const versionMetricKeys = Array.from(
    new Set(versionPoints.flatMap((v) => Object.keys(v.metrics)))
  )
  const versionChartData = versionPoints.map((v) => {
    const row: Record<string, string | number> = { label: v.label }
    versionMetricKeys.forEach((k) => {
      row[k] = v.metrics[k] ?? 0
    })
    return row
  })

  const allEvaluations = [
    ...(evaluationsQuery.data?.mlVersionEvaluations ?? []),
  ]
    .reverse()
    .map((evaluation) => ({
      id: evaluation.id,
      name: evaluation.name,
      evaluatedAt: evaluation.evaluatedAt,
      evaluator: evaluation.evaluator,
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

  const latest = allEvaluations[allEvaluations.length - 1]
  const scalars = latest ? Object.entries(latest.metrics) : []

  return (
    <div className="grid grid-cols-1 gap-6 p-6">
      {latest && scalars.length > 0 && (
        <Panel
          title="Metrics"
          description={`Values from the latest evaluation, ${latest.name}.`}
          action={
            <div className="flex flex-col items-end gap-1.5 text-sm">
              {latest.evaluatedAt && (
                <div
                  className="text-foreground/80 flex items-center gap-2"
                  title={`Evaluated ${formatDistanceToNow(new Date(latest.evaluatedAt), { addSuffix: true })}`}
                >
                  <CalendarDays className="h-4 w-4 text-[#586378]" />
                  <span className="text-[#586378]">Evaluated At</span>
                  <span>{format(new Date(latest.evaluatedAt), 'PP pp')}</span>
                </div>
              )}
              {latest.evaluator && (
                <div className="text-foreground/80 flex items-center gap-2">
                  <UserRound className="h-4 w-4 text-[#586378]" />
                  <span className="text-[#586378]">Evaluated By</span>
                  <span>{latest.evaluator}</span>
                </div>
              )}
            </div>
          }
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

      {allEvaluations.length > 1 && metricKeys.length > 0 && (
        <Panel
          title="Metrics across evaluations"
          description="How each metric trends across evaluations of this version."
          action={
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
          }
        >
          <MetricTrendChart
            data={chartData}
            metricKeys={metricKeys}
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
        </Panel>
      )}

      {allVersionPoints.length > 1 && versionMetricKeys.length > 0 && (
        <Panel
          title="Metrics across versions"
          description="How each metric compares across versions of this model, from the run that produced each version."
          action={
            <Select value={versionLimit} onValueChange={setVersionLimit}>
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
          }
        >
          <MetricTrendChart
            data={versionChartData}
            metricKeys={versionMetricKeys}
            className="aspect-[3/1] w-full"
            onLabelClick={(label) => {
              const version = versionPoints.find((v) => v.label === label)
              if (!version) {
                return
              }
              void setVersionId(version.id)
            }}
          />
        </Panel>
      )}

      {scalars.length === 0 && (
        <Panel title="Metrics">
          <p className="text-sm text-[#586378]">
            {evaluationsQuery.loading
              ? 'Loading evaluations…'
              : "No metrics recorded for this version's evaluations."}
          </p>
        </Panel>
      )}
    </div>
  )
}
