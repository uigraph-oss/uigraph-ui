import { graphql } from '@/api'

export const ML_STUDIO_VERSIONS = graphql(`
  query MlStudioVersions($orgId: ID!) {
    mlModelVersions(orgId: $orgId) {
      id
      modelId
      version
      description
      deploymentStatus
      runId
      createdAt
    }
  }
`)

export const ML_STUDIO_MODEL_VERSIONS = graphql(`
  query MlStudioModelVersions($orgId: ID!, $modelId: ID, $projectId: ID) {
    mlModelVersions(orgId: $orgId, modelId: $modelId, projectId: $projectId) {
      id
      modelId
      version
      description
      deploymentStatus
      runId
      source
      createdAt
    }
  }
`)

export const ML_MODEL_VERSIONS_EXPLORE = graphql(`
  query MlModelVersionsExplore(
    $orgId: ID!
    $teamId: ID
    $projectId: ID
    $modelId: ID
    $search: String
    $limit: Int
    $offset: Int
  ) {
    mlModelVersionsExplore(
      orgId: $orgId
      teamId: $teamId
      projectId: $projectId
      modelId: $modelId
      search: $search
      limit: $limit
      offset: $offset
    ) {
      items {
        id
        version
        description
        deploymentStatus
        model {
          id
          name
        }
        project {
          id
          name
        }
        team {
          id
          name
        }
      }
      total
    }
  }
`)

export const ML_STUDIO_MODEL_VERSION = graphql(`
  query MlStudioModelVersion($orgId: ID!, $id: ID!) {
    mlModelVersion(orgId: $orgId, id: $id) {
      id
      modelId
      version
      description
      deploymentStatus
      runId
      createdAt
    }
  }
`)

export const SET_ML_MODEL_VERSION_RUN = graphql(`
  mutation SetMlModelVersionRun($orgId: ID!, $versionId: ID!, $runId: ID) {
    setMlModelVersionRun(orgId: $orgId, versionId: $versionId, runId: $runId) {
      id
      runId
    }
  }
`)
