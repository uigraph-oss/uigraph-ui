'use client'

import { BetterTabController, useBetterTabs } from '@/hooks/use-better-tabs'
import { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ExperimentEvaluationMetrics } from './experiment-evaluation-metrics'
import { ExperimentRunMetrics } from './experiment-run-metrics'

export function ExperimentMetricsTab() {
  const [searchParams, setSearchParams] = useSearchParams()

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

  return (
    <div className="flex flex-col gap-5 p-6">
      <BetterTabController control={viewTabs} />

      {view === 'runs' && <ExperimentRunMetrics />}
      {view === 'evaluations' && <ExperimentEvaluationMetrics />}
    </div>
  )
}
