import { graphql } from '@/api'

export const ML_STUDIO_DATASET = graphql(`
  query MlStudioDataset($orgId: ID!, $id: ID!) {
    mlDataset(orgId: $orgId, id: $id) {
      id
      experimentId
      name
      digest
      source
      sourceType
      context
      rowCount
      schema {
        name
        type
        description
      }
      tags
      origin
    }
  }
`)

export const ML_STUDIO_DATASETS = graphql(`
  query MlStudioDatasets($orgId: ID!, $experimentId: ID) {
    mlDatasets(orgId: $orgId, experimentId: $experimentId) {
      id
      experimentId
      name
      digest
      source
      sourceType
      context
      rowCount
      schema {
        name
        type
        description
      }
      tags
      origin
    }
  }
`)

export const CREATE_ML_DATASET = graphql(`
  mutation CreateMlDataset(
    $orgId: ID!
    $experimentId: ID!
    $input: CreateMlDatasetInput!
  ) {
    createMlDataset(orgId: $orgId, experimentId: $experimentId, input: $input) {
      id
    }
  }
`)

export const UPDATE_ML_DATASET = graphql(`
  mutation UpdateMlDataset(
    $orgId: ID!
    $id: ID!
    $input: UpdateMlDatasetInput!
  ) {
    updateMlDataset(orgId: $orgId, id: $id, input: $input) {
      id
    }
  }
`)

export const DELETE_ML_DATASET = graphql(`
  mutation DeleteMlDataset($orgId: ID!, $id: ID!) {
    deleteMlDataset(orgId: $orgId, id: $id)
  }
`)
