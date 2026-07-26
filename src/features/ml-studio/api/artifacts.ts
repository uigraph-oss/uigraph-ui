import { graphql } from '@/api'

export const ML_STUDIO_ARTIFACTS = graphql(`
  query MlStudioArtifacts($orgId: ID!) {
    mlArtifacts(orgId: $orgId) {
      id
      runId
      name
      type
      uri
      downloadUri
      size
      format
      updatedAt
      syncedAt
    }
  }
`)

export const ML_STUDIO_RUN_ARTIFACTS = graphql(`
  query MlStudioRunArtifacts($orgId: ID!, $runId: ID) {
    mlArtifacts(orgId: $orgId, runId: $runId) {
      id
      runId
      name
      type
      uri
      downloadUri
      size
      format
      updatedAt
      syncedAt
    }
  }
`)
