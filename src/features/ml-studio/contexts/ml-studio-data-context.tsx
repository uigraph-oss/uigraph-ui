'use client'

import { useCurrentOrganization } from '@/store/auth-store'
import { useMutation, useQuery } from '@apollo/client'
import { createContext } from 'daily-code/react'
import { useMemo } from 'react'
import {
  CREATE_ML_DEPLOYMENT,
  CREATE_ML_FINDING,
  DELETE_ML_DEPLOYMENT,
  DELETE_ML_FINDING,
  ML_STUDIO_ARTIFACTS,
  ML_STUDIO_DATASETS,
  ML_STUDIO_DEPLOYMENTS,
  ML_STUDIO_EXPERIMENTS,
  ML_STUDIO_FINDINGS,
  ML_STUDIO_MODELS,
  ML_STUDIO_RUNS,
  ML_STUDIO_VERSIONS,
  UPDATE_ML_DEPLOYMENT,
  UPDATE_ML_FINDING,
  UPDATE_ML_MODEL,
} from '../api/ml-studio'
import type {
  Artifact,
  Dataset,
  Deployment,
  Experiment,
  Finding,
  MetricPoint,
  Model,
  ModelVersion,
  Run,
} from '../types'

export const [MlStudioDataProvider, useMlStudioData] = createContext(() => {
  const orgId = useCurrentOrganization()?.id

  const modelsQuery = useQuery(ML_STUDIO_MODELS, {
    fetchPolicy: 'cache-and-network',
    skip: !orgId,
    variables: { orgId: orgId! },
  })
  const versionsQuery = useQuery(ML_STUDIO_VERSIONS, {
    fetchPolicy: 'cache-and-network',
    skip: !orgId,
    variables: { orgId: orgId! },
  })
  const experimentsQuery = useQuery(ML_STUDIO_EXPERIMENTS, {
    fetchPolicy: 'cache-and-network',
    skip: !orgId,
    variables: { orgId: orgId! },
  })
  const runsQuery = useQuery(ML_STUDIO_RUNS, {
    fetchPolicy: 'cache-and-network',
    skip: !orgId,
    variables: { orgId: orgId! },
  })
  const artifactsQuery = useQuery(ML_STUDIO_ARTIFACTS, {
    fetchPolicy: 'cache-and-network',
    skip: !orgId,
    variables: { orgId: orgId! },
  })
  const datasetsQuery = useQuery(ML_STUDIO_DATASETS, {
    fetchPolicy: 'cache-and-network',
    skip: !orgId,
    variables: { orgId: orgId! },
  })
  const deploymentsQuery = useQuery(ML_STUDIO_DEPLOYMENTS, {
    fetchPolicy: 'cache-and-network',
    skip: !orgId,
    variables: { orgId: orgId! },
  })
  const findingsQuery = useQuery(ML_STUDIO_FINDINGS, {
    fetchPolicy: 'cache-and-network',
    skip: !orgId,
    variables: { orgId: orgId! },
  })

  const models: Model[] = useMemo(
    () =>
      (modelsQuery.data?.mlModels ?? []).map((m) => ({
        id: m.id,
        name: m.name,
        description: m.description,
        domain: m.domain,
        problemType: m.problemType as Model['problemType'],
        tags: m.tags,
        owners: m.owners,
        license: m.license,
        references: m.references,
        intendedUse: m.intendedUse,
        limitations: m.limitations,
        ethicalConsiderations: m.ethicalConsiderations,
        caveats: m.caveats,
        createdAt: m.createdAt ?? '',
        updatedAt: m.updatedAt ?? '',
        productionVersionId: m.productionVersionId ?? undefined,
      })),
    [modelsQuery.data?.mlModels]
  )

  const versions: ModelVersion[] = useMemo(
    () =>
      (versionsQuery.data?.mlModelVersions ?? []).map((v) => ({
        id: v.id,
        modelId: v.modelId,
        version: v.version,
        description: v.description,
        status: v.status as ModelVersion['status'],
        stage: v.stage as ModelVersion['stage'],
        runId: v.runId ?? undefined,
        createdAt: v.createdAt ?? '',
      })),
    [versionsQuery.data?.mlModelVersions]
  )

  const experiments: Experiment[] = useMemo(
    () =>
      (experimentsQuery.data?.mlExperiments ?? []).map((e) => ({
        id: e.id,
        name: e.name,
        description: e.description,
        status: e.status as Experiment['status'],
        startedAt: e.startedAt ?? '',
      })),
    [experimentsQuery.data?.mlExperiments]
  )

  const artifacts: Artifact[] = useMemo(
    () =>
      (artifactsQuery.data?.mlArtifacts ?? []).map((a) => ({
        id: a.id,
        runId: a.runId,
        name: a.name,
        type: a.type as Artifact['type'],
        uri: a.uri,
        size: a.size,
        format: a.format,
      })),
    [artifactsQuery.data?.mlArtifacts]
  )

  const artifactIdsByRun = useMemo(() => {
    const map: Record<string, string[]> = {}
    for (const a of artifacts) {
      ;(map[a.runId] ??= []).push(a.id)
    }
    return map
  }, [artifacts])

  const runs: Run[] = useMemo(
    () =>
      (runsQuery.data?.mlRuns ?? []).map((r) => ({
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
        artifactIds: artifactIdsByRun[r.id] ?? [],
      })),
    [runsQuery.data?.mlRuns, artifactIdsByRun]
  )

  const datasets: Dataset[] = useMemo(
    () =>
      (datasetsQuery.data?.mlDatasets ?? []).map((d) => ({
        id: d.id,
        experimentId: d.experimentId,
        name: d.name,
        digest: d.digest,
        source: d.source,
        sourceType: d.sourceType,
        context: d.context as Dataset['context'],
        rowCount: d.rowCount,
        schema: d.schema.map((f) => ({
          name: f.name,
          type: f.type,
          description: f.description,
        })),
      })),
    [datasetsQuery.data?.mlDatasets]
  )

  const deployments: Deployment[] = useMemo(
    () =>
      (deploymentsQuery.data?.mlDeployments ?? []).map((d) => ({
        id: d.id,
        modelId: d.modelId,
        versionId: d.versionId,
        name: d.name,
        environment: d.environment,
        status: d.status as Deployment['status'],
        endpoint: d.endpoint,
        region: d.region,
        deployedAt: d.deployedAt ?? '',
        rolledBackAt: d.rolledBackAt ?? undefined,
      })),
    [deploymentsQuery.data?.mlDeployments]
  )

  const findings: Finding[] = useMemo(
    () =>
      (findingsQuery.data?.mlFindings ?? []).map((f) => ({
        id: f.id,
        modelId: f.modelId,
        versionId: f.versionId ?? undefined,
        title: f.title,
        summary: f.summary,
        description: f.description,
        runIds: f.runIds,
      })),
    [findingsQuery.data?.mlFindings]
  )

  const deploymentRefetch = {
    refetchQueries: [
      { query: ML_STUDIO_DEPLOYMENTS, variables: { orgId: orgId! } },
    ],
    awaitRefetchQueries: true,
  }
  const findingRefetch = {
    refetchQueries: [
      { query: ML_STUDIO_FINDINGS, variables: { orgId: orgId! } },
    ],
    awaitRefetchQueries: true,
  }
  const modelRefetch = {
    refetchQueries: [{ query: ML_STUDIO_MODELS, variables: { orgId: orgId! } }],
    awaitRefetchQueries: true,
  }

  const [updateModel] = useMutation(UPDATE_ML_MODEL, modelRefetch)
  const [createDeployment] = useMutation(
    CREATE_ML_DEPLOYMENT,
    deploymentRefetch
  )
  const [updateDeployment] = useMutation(
    UPDATE_ML_DEPLOYMENT,
    deploymentRefetch
  )
  const [deleteDeployment] = useMutation(
    DELETE_ML_DEPLOYMENT,
    deploymentRefetch
  )
  const [createFinding] = useMutation(CREATE_ML_FINDING, findingRefetch)
  const [updateFinding] = useMutation(UPDATE_ML_FINDING, findingRefetch)
  const [deleteFinding] = useMutation(DELETE_ML_FINDING, findingRefetch)

  const isLoading =
    (modelsQuery.loading && !modelsQuery.data) ||
    (versionsQuery.loading && !versionsQuery.data) ||
    (experimentsQuery.loading && !experimentsQuery.data) ||
    (runsQuery.loading && !runsQuery.data) ||
    (artifactsQuery.loading && !artifactsQuery.data) ||
    (datasetsQuery.loading && !datasetsQuery.data) ||
    (deploymentsQuery.loading && !deploymentsQuery.data) ||
    (findingsQuery.loading && !findingsQuery.data)

  return {
    orgId,
    models,
    versions,
    experiments,
    runs,
    artifacts,
    datasets,
    deployments,
    findings,
    isLoading,
    updateModel,
    createDeployment,
    updateDeployment,
    deleteDeployment,
    createFinding,
    updateFinding,
    deleteFinding,
  }
})
