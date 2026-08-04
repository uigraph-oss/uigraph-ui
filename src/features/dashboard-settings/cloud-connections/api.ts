import { graphql } from '@/api'

export const CLOUD_CONNECTIONS = graphql(`
  query CloudConnections($orgId: ID!) {
    cloudConnections(orgId: $orgId) {
      id
      orgId
      provider
      displayName
      status
      statusMessage
      lastVerifiedAt
      createdBy
      createdAt
      updatedAt
    }
  }
`)

export const CREATE_CLOUD_CONNECTION = graphql(`
  mutation CreateCloudConnection(
    $orgId: ID!
    $input: CreateCloudConnectionInput!
  ) {
    createCloudConnection(orgId: $orgId, input: $input) {
      id
      orgId
      provider
      displayName
      status
      statusMessage
      lastVerifiedAt
      createdBy
      createdAt
      updatedAt
    }
  }
`)

export const DELETE_CLOUD_CONNECTION = graphql(`
  mutation DeleteCloudConnection($orgId: ID!, $connectionId: ID!) {
    deleteCloudConnection(orgId: $orgId, connectionId: $connectionId)
  }
`)

export const TEST_CLOUD_CONNECTION = graphql(`
  mutation TestCloudConnection($orgId: ID!, $connectionId: ID!) {
    testCloudConnection(orgId: $orgId, connectionId: $connectionId) {
      ok
      error
    }
  }
`)

export const SYNC_CLOUD_CONNECTION = graphql(`
  mutation SyncCloudConnection($orgId: ID!, $connectionId: ID!) {
    syncCloudConnection(orgId: $orgId, connectionId: $connectionId)
  }
`)
