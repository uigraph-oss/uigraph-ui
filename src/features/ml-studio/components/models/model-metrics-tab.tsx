'use client'

import { useMlStudioData } from '../../contexts/ml-studio-data-context'
import { useModelContext } from '../../contexts/model-context'
import { formatMetric } from '../../format'
import { Panel } from '../panel'

export function ModelMetricsTab() {
  const { selectedVersion } = useModelContext()
  const { runs } = useMlStudioData()

  const latestRun = runs.find((r) => r.id === selectedVersion?.runId)
  const metrics = Object.entries(latestRun?.metrics ?? {})

  return (
    <div className="grid grid-cols-1 gap-6 p-6">
      <Panel title="Metrics">
        {metrics.length > 0 ? (
          <div className="grid grid-cols-2 gap-x-8 gap-y-5 md:grid-cols-4">
            {metrics.map(([key, value]) => (
              <div key={key}>
                <div className="text-2xl font-bold text-[#F4F7FC]">
                  {formatMetric(value)}
                </div>
                <div className="mt-1 text-sm text-[#828DA3]">
                  {key.replace(/_/g, ' ')}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-[#586378]">
            No metrics recorded for this version.
          </p>
        )}
      </Panel>
    </div>
  )
}
