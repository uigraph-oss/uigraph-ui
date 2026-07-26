'use client'

import { BetterTabController, useBetterTabs } from '@/hooks/use-better-tabs'
import { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ModelEvaluationMetrics } from './model-evaluation-metrics'
import { ModelTrainingRunMetrics } from './model-training-run-metrics'
import { ModelVersionMetrics } from './model-version-metrics'

export function ModelMetricsTab() {
  const [searchParams, setSearchParams] = useSearchParams()

  const viewParam = searchParams.get('view')
  const [viewTabs, view] = useBetterTabs(
    [
      { id: 'run', label: 'Training Run' },
      { id: 'evaluations', label: 'Evaluation Runs' },
      { id: 'versions', label: 'Versions' },
    ],
    viewParam === 'evaluations' || viewParam === 'versions' ? viewParam : 'run'
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
    <div className="grid grid-cols-1 gap-6 p-6">
      <BetterTabController control={viewTabs} />

      {view === 'run' && (
        <ModelTrainingRunMetrics onOpenTab={viewTabs.setActiveTab} />
      )}
      {view === 'evaluations' && <ModelEvaluationMetrics />}
      {view === 'versions' && <ModelVersionMetrics />}
    </div>
  )
}
