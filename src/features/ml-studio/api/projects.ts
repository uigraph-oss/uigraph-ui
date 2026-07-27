import { graphql } from '@/api'

export const ML_STUDIO_PROJECTS = graphql(`
  query MlStudioProjects($orgId: ID!) {
    mlProjects(orgId: $orgId) {
      id
      name
      type
      description
      sourceType
      sourceUrl
      teamId
      updatedAt
      stats {
        modelCount
        experimentCount
        runCount
      }
    }
  }
`)

export const ML_STUDIO_PROJECT = graphql(`
  query MlStudioProject($orgId: ID!, $id: ID!) {
    mlProject(orgId: $orgId, id: $id) {
      id
      name
      type
      description
      sourceType
      sourceUrl
      teamId
    }
  }
`)

export const CREATE_ML_PROJECT = graphql(`
  mutation CreateMlProject($orgId: ID!, $input: CreateMlProjectInput!) {
    createMlProject(orgId: $orgId, input: $input) {
      id
    }
  }
`)

export const UPDATE_ML_PROJECT = graphql(`
  mutation UpdateMlProject(
    $orgId: ID!
    $id: ID!
    $input: UpdateMlProjectInput!
  ) {
    updateMlProject(orgId: $orgId, id: $id, input: $input) {
      id
    }
  }
`)

export const DELETE_ML_PROJECT = graphql(`
  mutation DeleteMlProject($orgId: ID!, $id: ID!) {
    deleteMlProject(orgId: $orgId, id: $id)
  }
`)
