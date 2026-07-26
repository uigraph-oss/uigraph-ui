import { graphql } from '@/api'

export const ML_STUDIO_DEPLOYMENTS = graphql(`
  query MlStudioDeployments($orgId: ID!) {
    mlDeployments(orgId: $orgId) {
      id
      modelId
      versionId
      name
      environment
      status
      endpoint
      region
      deployedAt
      rolledBackAt
    }
  }
`)

export const ML_VERSION_DEPLOYMENT_UPDATES = graphql(`
  query MlVersionDeploymentUpdates($orgId: ID!, $versionId: ID!) {
    mlVersionDeploymentUpdates(orgId: $orgId, versionId: $versionId) {
      id
      versionId
      fromStatus
      toStatus
      changedBy
      changedAt
    }
  }
`)

export const ML_STUDIO_DEPLOYMENT_UPDATES = graphql(`
  query MlStudioDeploymentUpdates($orgId: ID!, $projectId: ID) {
    mlVersionDeploymentUpdates(orgId: $orgId, projectId: $projectId) {
      id
      versionId
      fromStatus
      toStatus
      changedBy
      changedAt
    }
  }
`)

export const CREATE_ML_DEPLOYMENT = graphql(`
  mutation CreateMlDeployment($orgId: ID!, $input: CreateMlDeploymentInput!) {
    createMlDeployment(orgId: $orgId, input: $input) {
      id
    }
  }
`)

export const UPDATE_ML_DEPLOYMENT = graphql(`
  mutation UpdateMlDeployment(
    $orgId: ID!
    $id: ID!
    $input: UpdateMlDeploymentInput!
  ) {
    updateMlDeployment(orgId: $orgId, id: $id, input: $input) {
      id
    }
  }
`)

export const DELETE_ML_DEPLOYMENT = graphql(`
  mutation DeleteMlDeployment($orgId: ID!, $id: ID!) {
    deleteMlDeployment(orgId: $orgId, id: $id)
  }
`)

export const CREATE_ML_VERSION_DEPLOYMENT_UPDATE = graphql(`
  mutation CreateMlVersionDeploymentUpdate(
    $orgId: ID!
    $versionId: ID!
    $toStatus: String!
  ) {
    createMlVersionDeploymentUpdate(
      orgId: $orgId
      versionId: $versionId
      toStatus: $toStatus
    ) {
      id
      versionId
      fromStatus
      toStatus
      changedBy
      changedAt
    }
  }
`)
