import { graphql } from '@/api'

export const ML_STUDIO_FINDINGS = graphql(`
  query MlStudioFindings($orgId: ID!, $projectId: ID) {
    mlFindings(orgId: $orgId, projectId: $projectId) {
      id
      modelId
      versionId
      title
      summary
      description
      runIds
      evaluationIds
      createdAt
      createdByActor {
        id
        name
      }
    }
  }
`)

export const CREATE_ML_FINDING = graphql(`
  mutation CreateMlFinding($orgId: ID!, $input: CreateMlFindingInput!) {
    createMlFinding(orgId: $orgId, input: $input) {
      id
    }
  }
`)

export const UPDATE_ML_FINDING = graphql(`
  mutation UpdateMlFinding(
    $orgId: ID!
    $id: ID!
    $input: UpdateMlFindingInput!
  ) {
    updateMlFinding(orgId: $orgId, id: $id, input: $input) {
      id
    }
  }
`)

export const DELETE_ML_FINDING = graphql(`
  mutation DeleteMlFinding($orgId: ID!, $id: ID!) {
    deleteMlFinding(orgId: $orgId, id: $id)
  }
`)
