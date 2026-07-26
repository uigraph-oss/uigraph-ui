import { graphql } from '@/api'

export const ML_STUDIO_MODEL = graphql(`
  query MlStudioModel($orgId: ID!, $id: ID!) {
    mlModel(orgId: $orgId, id: $id) {
      id
      projectId
      name
      description
      domain
      problemType
      tags
      license
      references
      intendedUse
      limitations
      considerations
      recommendations
      productionVersionId
      origin
      createdAt
      updatedAt
    }
  }
`)

export const ML_STUDIO_MODELS = graphql(`
  query MlStudioModels($orgId: ID!, $projectId: ID) {
    mlModels(orgId: $orgId, projectId: $projectId) {
      id
      projectId
      name
      description
      domain
      problemType
      tags
      license
      references
      intendedUse
      limitations
      considerations
      recommendations
      productionVersionId
      origin
      createdAt
      updatedAt
    }
  }
`)

export const CREATE_ML_MODEL = graphql(`
  mutation CreateMlModel($orgId: ID!, $input: CreateMlModelInput!) {
    createMlModel(orgId: $orgId, input: $input) {
      id
    }
  }
`)

export const UPDATE_ML_MODEL = graphql(`
  mutation UpdateMlModel(
    $orgId: ID!
    $id: ID!
    $domain: String
    $problemType: String
    $license: String
    $references: [String!]
    $intendedUse: String
    $limitations: String
    $considerations: String
    $recommendations: String
  ) {
    updateMlModel(
      orgId: $orgId
      id: $id
      domain: $domain
      problemType: $problemType
      license: $license
      references: $references
      intendedUse: $intendedUse
      limitations: $limitations
      considerations: $considerations
      recommendations: $recommendations
    ) {
      id
      domain
      problemType
      license
      references
      intendedUse
      limitations
      considerations
      recommendations
    }
  }
`)

export const UPDATE_ML_MODEL_INFO = graphql(`
  mutation UpdateMlModelInfo(
    $orgId: ID!
    $id: ID!
    $input: UpdateMlModelInfoInput!
  ) {
    updateMlModelInfo(orgId: $orgId, id: $id, input: $input) {
      id
    }
  }
`)

export const DELETE_ML_MODEL = graphql(`
  mutation DeleteMlModel($orgId: ID!, $id: ID!) {
    deleteMlModel(orgId: $orgId, id: $id)
  }
`)
