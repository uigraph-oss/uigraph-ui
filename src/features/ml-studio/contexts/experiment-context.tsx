'use client'

import { createContext } from 'daily-code/react'
import { useMemo } from 'react'
import { useMlStudioData } from './ml-studio-data-context'

export const [ExperimentContextProvider, useExperimentContext] = createContext(
  ({ experimentId }: { experimentId: string }) => {
    const { experiments, runs: allRuns } = useMlStudioData()
    const experiment = experiments.find((e) => e.id === experimentId)

    const runs = useMemo(
      () => allRuns.filter((r) => r.experimentId === experimentId),
      [allRuns, experimentId]
    )

    return {
      experiment: experiment!,
      experimentId,
      runs,
    }
  }
)
