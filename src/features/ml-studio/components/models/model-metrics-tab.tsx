'use client'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { useCurrentOrganization } from '@/store/auth-store'
import { useQuery } from '@apollo/client'
import { format, formatDistanceToNow } from 'date-fns'
import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ML_VERSION_EVALUATIONS } from '../../api/ml-studio'
import { useModelContext } from '../../contexts/model-context'
import { formatMetric } from '../../format'
import { MetricTrendChart } from '../metric-chart'
import { MetricSelect } from '../metric-select'
import { MlUser } from '../ml-user'
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

export function ModelMetricsTab() {
  const {
    selectedVersion,
    selectedRun,
    selectedRunExperiment,
    versions,
    setVersionId,
  } = useModelContext()
  const orgId = useCurrentOrganization()?.id
  const { projectId, modelId } = useParams<{
    projectId: string
    modelId: string
  }>()
  const navigate = useNavigate()
  const [limit, setLimit] = useState('25')
  const [versionLimit, setVersionLimit] = useState('25')
  const [hiddenEvaluationMetrics, setHiddenEvaluationMetrics] = useState<
    string[]
  >([])
  const [hiddenVersionMetrics, setHiddenVersionMetrics] = useState<string[]>([])
  const [summaryTab, setSummaryTab] = useState<'run' | 'evaluations'>('run')

  const evaluationsQuery = useQuery(ML_VERSION_EVALUATIONS, {
    fetchPolicy: 'cache-and-network',
    skip: !orgId || !selectedVersion?.id,
    variables: { orgId: orgId!, versionId: selectedVersion?.id ?? '' },
  })

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
      createdBy: evaluation.createdBy,
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

  const visibleMetricKeys = metricKeys.filter(
    (k) => !hiddenEvaluationMetrics.includes(k)
  )
  const visibleVersionMetricKeys = versionMetricKeys.filter(
    (k) => !hiddenVersionMetrics.includes(k)
  )

  const latest = allEvaluations[allEvaluations.length - 1]

  const runScalars = Object.entries(selectedRun?.metrics ?? {})

  const latestScalars = Object.entries(latest?.metrics ?? {})

  const summarySource =
    summaryTab === 'run' && runScalars.length > 0 ? 'run' : 'evaluations'
  const scalars = summarySource === 'run' ? runScalars : latestScalars

  return (
    <div className="grid grid-cols-1 gap-6 p-6">
      {versions.map((version) => (
        <VersionMetricsLoader
          key={version.id}
          versionId={version.id}
          onLoad={handleVersionMetrics}
        />
      ))}

      {scalars.length > 0 && (
        <Panel>
          <div className="grid grid-cols-3 items-center gap-x-8">
            <div>
              <h3 className="font-semibold text-[#F4F7FC]">Metrics</h3>
              <p className="mt-0.5 text-sm text-[#828DA3]">
                {summarySource === 'run'
                  ? `Final metrics from the training run ${selectedRun?.name ?? ''}.`
                  : `Metrics from the latest evaluation ${latest?.name ?? ''}.`}
              </p>
            </div>

            <div className="border-stock grid grid-cols-2 gap-1 justify-self-center rounded-[0.80315625rem] border p-1">
              <button
                type="button"
                onClick={() => setSummaryTab('run')}
                disabled={runScalars.length === 0}
                className={cn(
                  'rounded-[0.5rem] px-3 py-1.5 text-sm disabled:opacity-40',
                  summarySource === 'run'
                    ? 'bg-accent text-foreground'
                    : 'text-foreground/60 hover:text-foreground'
                )}
              >
                Training Run
              </button>
              <button
                type="button"
                onClick={() => setSummaryTab('evaluations')}
                disabled={latestScalars.length === 0}
                className={cn(
                  'rounded-[0.5rem] px-3 py-1.5 text-sm disabled:opacity-40',
                  summarySource === 'evaluations'
                    ? 'bg-accent text-foreground'
                    : 'text-foreground/60 hover:text-foreground'
                )}
              >
                Latest Evaluation
              </button>
            </div>

            <div className="justify-self-end text-sm">
              {summarySource === 'run' && (
                <div
                  className="flex items-center gap-1.5 text-[#586378]"
                  title={
                    selectedRun?.startedAt
                      ? format(new Date(selectedRun.startedAt), 'PP pp')
                      : undefined
                  }
                >
                  <span>Trained by</span>
                  <MlUser identifier={selectedRunExperiment?.createdBy} />
                  {selectedRun?.startedAt && (
                    <span>
                      ,{' '}
                      {formatDistanceToNow(new Date(selectedRun.startedAt), {
                        addSuffix: true,
                      })}
                    </span>
                  )}
                </div>
              )}
              {summarySource === 'evaluations' && latest && (
                <div
                  className="flex items-center gap-1.5 text-[#586378]"
                  title={
                    latest.evaluatedAt
                      ? format(new Date(latest.evaluatedAt), 'PP pp')
                      : undefined
                  }
                >
                  <span>Evaluated by</span>
                  <MlUser identifier={latest.createdBy} />
                  {latest.evaluatedAt && (
                    <span>
                      ,{' '}
                      {formatDistanceToNow(new Date(latest.evaluatedAt), {
                        addSuffix: true,
                      })}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="mt-3 grid grid-cols-3 gap-x-8 gap-y-7">
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
            <div className="flex items-center gap-3">
              <MetricSelect
                metricKeys={metricKeys}
                hiddenKeys={hiddenEvaluationMetrics}
                onToggle={(key) =>
                  setHiddenEvaluationMetrics((hidden) =>
                    hidden.includes(key)
                      ? hidden.filter((k) => k !== key)
                      : [...hidden, key]
                  )
                }
                onShowAll={() => setHiddenEvaluationMetrics([])}
                onHideAll={() => setHiddenEvaluationMetrics(metricKeys)}
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
        </Panel>
      )}

      {versions.length > 1 && (
        <Panel
          title="Metrics across versions"
          description="How each metric compares across versions of this model, using the latest evaluation of each version."
          action={
            <div className="flex items-center gap-3">
              <MetricSelect
                metricKeys={versionMetricKeys}
                hiddenKeys={hiddenVersionMetrics}
                onToggle={(key) =>
                  setHiddenVersionMetrics((hidden) =>
                    hidden.includes(key)
                      ? hidden.filter((k) => k !== key)
                      : [...hidden, key]
                  )
                }
                onShowAll={() => setHiddenVersionMetrics([])}
                onHideAll={() => setHiddenVersionMetrics(versionMetricKeys)}
              />
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
            </div>
          }
        >
          {versionMetricKeys.length > 0 ? (
            <MetricTrendChart
              data={versionChartData}
              metricKeys={visibleVersionMetricKeys}
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
      )}

      {scalars.length === 0 && (
        <Panel title="Metrics">
          <p className="text-sm text-[#586378]">
            {evaluationsQuery.loading
              ? 'Loading evaluations…'
              : 'No training run or evaluation metrics recorded for this version.'}
          </p>
        </Panel>
      )}
    </div>
  )
}
