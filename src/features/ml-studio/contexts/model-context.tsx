'use client'

import { useCurrentOrganization } from '@/store/auth-store'
import { useQuery } from '@apollo/client'
import { createContext } from 'daily-code/react'
import { parseAsString, useQueryState } from 'nuqs'
import { useMemo } from 'react'
import {
  ML_STUDIO_EXPERIMENT,
  ML_STUDIO_MODEL,
  ML_STUDIO_MODEL_VERSIONS,
  ML_STUDIO_RUN,
} from '../api/ml-studio'
import type {
  Experiment,
  MetricPoint,
  Model,
  ModelVersion,
  Run,
} from '../types'

export const [ModelContextProvider, useModelContext] = createContext(
  ({ modelId }: { modelId: string }) => {
    const orgId = useCurrentOrganization()?.id

    const modelQuery = useQuery(ML_STUDIO_MODEL, {
      fetchPolicy: 'cache-and-network',
      skip: !orgId || !modelId,
      variables: { orgId: orgId!, id: modelId },
    })
    const versionsQuery = useQuery(ML_STUDIO_MODEL_VERSIONS, {
      fetchPolicy: 'cache-and-network',
      skip: !orgId || !modelId,
      variables: { orgId: orgId!, modelId },
    })

    const model: Model | undefined = useMemo(() => {
      const m = modelQuery.data?.mlModel
      if (!m) {
        return undefined
      }
      return {
        id: m.id,
        projectId: m.projectId ?? undefined,
        name: m.name,
        description: m.description,
        domain: m.domain,
        problemType: m.problemType as Model['problemType'],
        tags: m.tags,
        license: m.license,
        references: m.references,
        intendedUse: m.intendedUse,
        limitations: m.limitations,
        ethicalConsiderations: m.ethicalConsiderations,
        caveats: m.caveats,
        createdAt: m.createdAt ?? '',
        updatedAt: m.updatedAt ?? '',
        productionVersionId: m.productionVersionId ?? undefined,
      }
    }, [modelQuery.data?.mlModel])

    const versions: ModelVersion[] = useMemo(
      () =>
        (versionsQuery.data?.mlModelVersions ?? [])
          .map((v) => ({
            id: v.id,
            modelId: v.modelId,
            version: v.version,
            description: v.description,
            deploymentStatus:
              v.deploymentStatus as ModelVersion['deploymentStatus'],
            runId: v.runId ?? undefined,
            createdAt: v.createdAt ?? '',
          }))
          .sort((a, b) => Number(b.version) - Number(a.version)),
      [versionsQuery.data?.mlModelVersions]
    )

    const latestVersion = useMemo(
      () =>
        versions.reduce<(typeof versions)[number] | undefined>(
          (latest, v) =>
            !latest || Number(v.version) > Number(latest.version) ? v : latest,
          undefined
        ),
      [versions]
    )

    const defaultVersionId = latestVersion?.id || ''

    const [versionParam, setVersionId] = useQueryState('v', parseAsString)
    const selectedVersionId =
      versionParam && versions.some((v) => v.id === versionParam)
        ? versionParam
        : defaultVersionId

    const selectedVersion = versions.find((v) => v.id === selectedVersionId)

    const runQuery = useQuery(ML_STUDIO_RUN, {
      fetchPolicy: 'cache-and-network',
      skip: !orgId || !selectedVersion?.runId,
      variables: { orgId: orgId!, id: selectedVersion?.runId ?? '' },
    })

    const selectedRun: Run | undefined = useMemo(() => {
      const r = runQuery.data?.mlRun
      if (!r) {
        return undefined
      }
      return {
        id: r.id,
        experimentId: r.experimentId,
        name: r.name,
        status: r.status as Run['status'],
        startedAt: r.startedAt ?? '',
        endedAt: r.endedAt ?? undefined,
        duration: r.duration,
        notes: r.notes,
        parameters: (r.parameters ?? {}) as Record<string, string | number>,
        metrics: (r.metrics ?? {}) as Record<string, number>,
        series: (r.series ?? {}) as Record<string, MetricPoint[]>,
        datasetId: r.datasetId ?? undefined,
        artifactIds: [],
      }
    }, [runQuery.data?.mlRun])

    const experimentQuery = useQuery(ML_STUDIO_EXPERIMENT, {
      fetchPolicy: 'cache-and-network',
      skip: !orgId || !selectedRun?.experimentId,
      variables: { orgId: orgId!, id: selectedRun?.experimentId ?? '' },
    })

    const selectedRunExperiment: Experiment | undefined = useMemo(() => {
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
        startedAt: e.startedAt ?? '',
      }
    }, [experimentQuery.data?.mlExperiment])

    return {
      model: model!,
      available: !!model,
      modelId,
      versions,
      latestVersionId: latestVersion?.id,
      selectedVersionId,
      selectedVersion,
      setVersionId,
      selectedRun,
      selectedRunExperiment,
      loading: modelQuery.loading,
      error: modelQuery.error,
    }
  }
)
