import { graphql } from '@/api'

export const ML_STUDIO_EXPERIMENT = graphql(`
  query MlStudioExperiment($orgId: ID!, $id: ID!) {
    mlExperiment(orgId: $orgId, id: $id) {
      id
      projectId
      name
      description
      status
      tags
      createdAt
      source
      createdBy
      updatedBy
    }
  }
`)

export const ML_STUDIO_EXPERIMENTS = graphql(`
  query MlStudioExperiments($orgId: ID!, $projectId: ID) {
    mlExperiments(orgId: $orgId, projectId: $projectId) {
      id
      projectId
      name
      description
      status
      tags
      createdAt
      source
      createdBy
      updatedBy
    }
  }
`)

export const CREATE_ML_EXPERIMENT = graphql(`
  mutation CreateMlExperiment($orgId: ID!, $input: CreateMlExperimentInput!) {
    createMlExperiment(orgId: $orgId, input: $input) {
      id
    }
  }
`)

export const UPDATE_ML_EXPERIMENT = graphql(`
  mutation UpdateMlExperiment(
    $orgId: ID!
    $id: ID!
    $input: UpdateMlExperimentInput!
  ) {
    updateMlExperiment(orgId: $orgId, id: $id, input: $input) {
      id
    }
  }
`)

export const DELETE_ML_EXPERIMENT = graphql(`
  mutation DeleteMlExperiment($orgId: ID!, $id: ID!) {
    deleteMlExperiment(orgId: $orgId, id: $id)
  }
`)
