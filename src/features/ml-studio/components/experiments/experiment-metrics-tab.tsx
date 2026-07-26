'use client'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { BetterTabController, useBetterTabs } from '@/hooks/use-better-tabs'
import { useCurrentOrganization } from '@/store/auth-store'
import { useQuery } from '@apollo/client'
import { useEffect, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { ML_EXPERIMENT_EVALUATIONS } from '../../api/ml-studio'
import { useExperimentContext } from '../../contexts/experiment-context'
import { MetricTrendChart } from '../metric-chart'
import { MetricSelect } from '../metric-select'
import { Panel } from '../panel'
import { ParameterImpactPanel } from '../parameter-impact-panel'

const limitOptions = ['5', '10', '25', '50', 'all']

export function ExperimentMetricsTab() {
  const { experiment, runs } = useExperimentContext()
  const orgId = useCurrentOrganization()?.id
  const { projectId } = useParams<{ projectId: string }>()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [limit, setLimit] = useState('25')
  const [evaluationLimit, setEvaluationLimit] = useState('25')
  const [hiddenRunMetrics, setHiddenRunMetrics] = useState<string[]>([])
  const [hiddenEvaluationMetrics, setHiddenEvaluationMetrics] = useState<
    string[]
  >([])

  const [viewTabs, view] = useBetterTabs(
    [
      { id: 'runs', label: 'Training Runs' },
      { id: 'evaluations', label: 'Evaluation Runs' },
    ],
    searchParams.get('view') === 'evaluations' ? 'evaluations' : 'runs'
  )

  useEffect(() => {
    if (searchParams.get('view') === view) {
      return
    }
    setSearchParams(
      (current) => {
        current.set('view', view)
        return current
      },
      { replace: true }
    )
  }, [view, searchParams, setSearchParams])

  const evaluationsQuery = useQuery(ML_EXPERIMENT_EVALUATIONS, {
    fetchPolicy: 'cache-and-network',
    skip: !orgId || !experiment?.id,
    variables: { orgId: orgId!, experimentId: experiment?.id ?? '' },
  })

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

  const visibleMetricKeys = metricKeys.filter(
    (k) => !hiddenRunMetrics.includes(k)
  )

  const allEvaluations = [
    ...(evaluationsQuery.data?.mlExperimentEvaluations ?? []),
  ]
    .reverse()
    .map((evaluation) => ({
      id: evaluation.id,
      name: evaluation.name,
      metrics: (evaluation.metrics ?? {}) as Record<string, number>,
      parameters: (evaluation.parameters ?? {}) as Record<
        string,
        string | number
      >,
    }))
  const visibleEvaluations =
    evaluationLimit === 'all'
      ? allEvaluations
      : allEvaluations.slice(-Number(evaluationLimit))

  const evaluationMetricKeys = Array.from(
    new Set(visibleEvaluations.flatMap((e) => Object.keys(e.metrics)))
  )
  const evaluationData = visibleEvaluations.map((e) => {
    const row: Record<string, string | number> = { label: e.name }
    evaluationMetricKeys.forEach((k) => {
      row[k] = e.metrics[k] ?? 0
    })
    return row
  })

  const visibleEvaluationMetricKeys = evaluationMetricKeys.filter(
    (k) => !hiddenEvaluationMetrics.includes(k)
  )

  return (
    <div className="flex flex-col gap-5 p-6">
      <BetterTabController control={viewTabs} />

      {view === 'runs' && (
        <>
          <Panel
            title="Scalar metrics by run"
            description="Final metric values compared across runs in this experiment."
            action={
              <div className="flex items-center gap-3">
                <MetricSelect
                  metricKeys={metricKeys}
                  hiddenKeys={hiddenRunMetrics}
                  onToggle={(key) =>
                    setHiddenRunMetrics((hidden) =>
                      hidden.includes(key)
                        ? hidden.filter((k) => k !== key)
                        : [...hidden, key]
                    )
                  }
                  onShowAll={() => setHiddenRunMetrics([])}
                  onHideAll={() => setHiddenRunMetrics(metricKeys)}
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
            <MetricTrendChart
              data={barData}
              metricKeys={visibleMetricKeys}
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

          <ParameterImpactPanel
            points={visibleRuns}
            subjectLabel="run"
            onPointClick={(id) =>
              void navigate(
                `/dashboard/ml-studio/projects/${projectId}/experiments/${experiment.id}/runs/${id}`
              )
            }
          />
        </>
      )}

      {view === 'evaluations' && (
        <>
          <Panel
            title="Metrics across evaluations"
            description="How each metric trends across evaluations in this experiment."
            action={
              <div className="flex items-center gap-3">
                <MetricSelect
                  metricKeys={evaluationMetricKeys}
                  hiddenKeys={hiddenEvaluationMetrics}
                  onToggle={(key) =>
                    setHiddenEvaluationMetrics((hidden) =>
                      hidden.includes(key)
                        ? hidden.filter((k) => k !== key)
                        : [...hidden, key]
                    )
                  }
                  onShowAll={() => setHiddenEvaluationMetrics([])}
                  onHideAll={() =>
                    setHiddenEvaluationMetrics(evaluationMetricKeys)
                  }
                />
                <Select
                  value={evaluationLimit}
                  onValueChange={setEvaluationLimit}
                >
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
            {visibleEvaluations.length === 0 ? (
              <p className="text-sm text-[#586378]">
                No evaluations have been recorded for this experiment yet.
              </p>
            ) : (
              <MetricTrendChart
                data={evaluationData}
                metricKeys={visibleEvaluationMetricKeys}
                className="aspect-[3/1] w-full"
                onLabelClick={(label) => {
                  const evaluation = visibleEvaluations.find(
                    (e) => e.name === label
                  )
                  if (!evaluation) {
                    return
                  }
                  void navigate(
                    `/dashboard/ml-studio/projects/${projectId}/experiments/${experiment.id}/evaluations/${evaluation.id}`
                  )
                }}
              />
            )}
          </Panel>

          <ParameterImpactPanel
            points={visibleEvaluations}
            subjectLabel="evaluation"
            onPointClick={(id) =>
              void navigate(
                `/dashboard/ml-studio/projects/${projectId}/experiments/${experiment.id}/evaluations/${id}`
              )
            }
          />
        </>
      )}
    </div>
  )
}
