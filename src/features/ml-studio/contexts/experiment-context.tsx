'use client'

import { useCurrentOrganization } from '@/store/auth-store'
import { useQuery } from '@apollo/client'
import { createContext } from 'daily-code/react'
import { useMemo } from 'react'
import { ML_STUDIO_EXPERIMENT } from '../api/experiments'
import { ML_STUDIO_EXPERIMENT_RUNS } from '../api/runs'
import type { Experiment, Run } from '../types'

export const [ExperimentContextProvider, useExperimentContext] = createContext(
  ({ experimentId }: { experimentId: string }) => {
    const orgId = useCurrentOrganization()?.id

    const experimentQuery = useQuery(ML_STUDIO_EXPERIMENT, {
      fetchPolicy: 'cache-and-network',
      skip: !orgId || !experimentId,
      variables: { orgId: orgId!, id: experimentId },
    })
    const runsQuery = useQuery(ML_STUDIO_EXPERIMENT_RUNS, {
      fetchPolicy: 'cache-and-network',
      skip: !orgId || !experimentId,
      variables: { orgId: orgId!, experimentId },
    })

    const experiment: Experiment | undefined = useMemo(() => {
      const e = experimentQuery.data?.mlExperiment
      if (!e) {
        return undefined
      }
      return {
        id: e.id,
        projectId: e.projectId ?? undefined,
        name: e.name,
        description: e.description,
        status: e.status as Experiment['status'],
        tags: e.tags,
        createdAt: e.createdAt ?? '',
        source: e.source as Experiment['source'],
        createdBy: e.createdBy ?? undefined,
        updatedBy: e.updatedBy ?? undefined,
      }
    }, [experimentQuery.data?.mlExperiment])

    const runs: Run[] = useMemo(
      () =>
        (runsQuery.data?.mlRuns ?? []).map((r) => ({
          id: r.id,
          experimentId: r.experimentId,
          name: r.name,
          status: r.status as Run['status'],
          startedAt: r.startedAt,
          endedAt: r.endedAt ?? null,
          notes: r.notes,
          parameters: (r.parameters ?? {}) as Record<string, string | number>,
          metrics: (r.metrics ?? {}) as Record<string, number>,
          datasetId: r.datasetId ?? undefined,
          artifactIds: [],
          source: r.source as Run['source'],
          updatedAt: r.updatedAt ?? undefined,
          syncedAt: r.syncedAt ?? undefined,
        })),
      [runsQuery.data?.mlRuns]
    )

    return {
      experiment: experiment!,
      available: !!experiment,
      experimentId,
      runs,
      loading: experimentQuery.loading,
      error: experimentQuery.error,
    }
  }
)
