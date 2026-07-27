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
      source
      mimeType
      sizeBytes
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
      source
      mimeType
      sizeBytes
      updatedAt
      syncedAt
    }
  }
`)

export const CREATE_ML_ARTIFACT = graphql(`
  mutation CreateMlArtifact(
    $orgId: ID!
    $runId: ID!
    $input: CreateMlArtifactInput!
  ) {
    createMlArtifact(orgId: $orgId, runId: $runId, input: $input) {
      id
    }
  }
`)

export const UPDATE_ML_ARTIFACT = graphql(`
  mutation UpdateMlArtifact(
    $orgId: ID!
    $id: ID!
    $input: UpdateMlArtifactInput!
  ) {
    updateMlArtifact(orgId: $orgId, id: $id, input: $input) {
      id
    }
  }
`)

export const DELETE_ML_ARTIFACT = graphql(`
  mutation DeleteMlArtifact($orgId: ID!, $id: ID!) {
    deleteMlArtifact(orgId: $orgId, id: $id)
  }
`)
