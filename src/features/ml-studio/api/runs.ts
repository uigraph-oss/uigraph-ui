import { graphql } from '@/api'

export const ML_STUDIO_RUN = graphql(`
  query MlStudioRun($orgId: ID!, $id: ID!) {
    mlRun(orgId: $orgId, id: $id) {
      id
      experimentId
      name
      status
      startedAt
      endedAt
      notes
      parameters
      metrics
      datasetId
      source
      updatedAt
      syncedAt
    }
  }
`)

export const ML_STUDIO_RUNS = graphql(`
  query MlStudioRuns($orgId: ID!) {
    mlRuns(orgId: $orgId) {
      id
      experimentId
      name
      status
      startedAt
      endedAt
      notes
      parameters
      metrics
      datasetId
      source
      updatedAt
      syncedAt
    }
  }
`)

export const ML_STUDIO_EXPERIMENT_RUNS = graphql(`
  query MlStudioExperimentRuns($orgId: ID!, $experimentId: ID, $projectId: ID) {
    mlRuns(orgId: $orgId, experimentId: $experimentId, projectId: $projectId) {
      id
      experimentId
      name
      status
      startedAt
      endedAt
      notes
      parameters
      metrics
      datasetId
      source
      updatedAt
      syncedAt
    }
  }
`)

export const ML_STUDIO_EXPERIMENT_RUNS_PAGE = graphql(`
  query MlStudioExperimentRunsPage(
    $orgId: ID!
    $experimentId: ID
    $projectId: ID
    $search: String
    $limit: Int
    $offset: Int
  ) {
    mlRunsPage(
      orgId: $orgId
      experimentId: $experimentId
      projectId: $projectId
      search: $search
      limit: $limit
      offset: $offset
    ) {
      total
      runs {
        id
        experimentId
        name
        status
        startedAt
        endedAt
        notes
        parameters
        metrics
        datasetId
        source
        updatedAt
        syncedAt
      }
    }
  }
`)

export const CREATE_ML_RUN = graphql(`
  mutation CreateMlRun(
    $orgId: ID!
    $experimentId: ID!
    $input: CreateMlRunInput!
  ) {
    createMlRun(orgId: $orgId, experimentId: $experimentId, input: $input) {
      id
    }
  }
`)

export const UPDATE_ML_RUN = graphql(`
  mutation UpdateMlRun($orgId: ID!, $id: ID!, $input: UpdateMlRunInput!) {
    updateMlRun(orgId: $orgId, id: $id, input: $input) {
      id
    }
  }
`)

export const DELETE_ML_RUN = graphql(`
  mutation DeleteMlRun($orgId: ID!, $id: ID!) {
    deleteMlRun(orgId: $orgId, id: $id)
  }
`)
