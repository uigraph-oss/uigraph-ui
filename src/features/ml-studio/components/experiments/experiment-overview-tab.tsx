'use client'

import { useExperimentContext } from '../../contexts/experiment-context'
import { InfoRow, Panel } from '../panel'

export function ExperimentOverviewTab() {
  const { experiment, runs } = useExperimentContext()

  return (
    <div className="flex flex-col gap-5 p-6">
      {experiment.description && (
        <p className="max-w-2xl text-sm text-[#828DA3]">
          {experiment.description}
        </p>
      )}

      <Panel>
        <div className="grid grid-cols-2 gap-5 md:grid-cols-4">
          <InfoRow label="Started">
            {new Date(experiment.startedAt).toLocaleDateString()}
          </InfoRow>
          <InfoRow label="Runs">{runs.length}</InfoRow>
        </div>
      </Panel>
    </div>
  )
}
