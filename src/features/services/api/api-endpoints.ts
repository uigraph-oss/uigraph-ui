import { graphql } from '@/api'
import { uploadFile } from '@/features/uploads/api/uploads'

export type DashboardAPIGroup = {
  id: string
  serviceId: string
  orgId: string
  name: string
  version: string
  label?: string | null
  protocol: string
  specKey?: string | null
  specHash?: string | null
  createdBy: string
  updatedBy?: string | null
  createdAt: string
  updatedAt: string
}

export type DashboardAPIEndpoint = {
  id: string
  apiGroupId: string
  serviceId: string
  orgId: string
  operationId: string
  method: string
  path: string
  summary: string
  description: string
  tags: string[]
  parameters: string
  requestBody: string
  responses: string
  order: number
  createdBy: string
  updatedBy?: string | null
  createdAt: string
  updatedAt: string
}

export const API_GROUPS = graphql(`
  query APIGroups($orgId: ID!, $serviceId: ID!) {
    apiGroups(orgId: $orgId, serviceId: $serviceId) {
      id
      serviceId
      orgId
      name
      version
      label
      protocol
      specKey
      specHash
      createdBy
      updatedBy
      createdAt
      updatedAt
    }
  }
`)

export const API_GROUP = graphql(`
  query APIGroup($orgId: ID!, $serviceId: ID!, $id: ID!) {
    apiGroup(orgId: $orgId, serviceId: $serviceId, id: $id) {
      id
      serviceId
      orgId
      name
      version
      label
      protocol
      specKey
      specHash
      createdBy
      updatedBy
      createdAt
      updatedAt
    }
  }
`)

export const API_ENDPOINTS = graphql(`
  query APIEndpoints($orgId: ID!, $serviceId: ID!, $apiGroupId: ID!) {
    apiEndpoints(
      orgId: $orgId
      serviceId: $serviceId
      apiGroupId: $apiGroupId
    ) {
      id
      apiGroupId
      serviceId
      orgId
      operationId
      method
      path
      summary
      description
      tags
      parameters
      requestBody
      responses
      order
      createdBy
      updatedBy
      createdAt
      updatedAt
    }
  }
`)

export const CREATE_API_GROUP = graphql(`
  mutation CreateAPIGroup(
    $orgId: ID!
    $serviceId: ID!
    $input: CreateAPIGroupInput!
  ) {
    createAPIGroup(orgId: $orgId, serviceId: $serviceId, input: $input) {
      id
      name
      protocol
    }
  }
`)

export const UPDATE_API_GROUP = graphql(`
  mutation UpdateAPIGroup(
    $orgId: ID!
    $serviceId: ID!
    $id: ID!
    $input: UpdateAPIGroupInput!
  ) {
    updateAPIGroup(
      orgId: $orgId
      serviceId: $serviceId
      id: $id
      input: $input
    ) {
      id
      name
    }
  }
`)

export const DELETE_API_GROUP = graphql(`
  mutation DeleteAPIGroup($orgId: ID!, $serviceId: ID!, $id: ID!) {
    deleteAPIGroup(orgId: $orgId, serviceId: $serviceId, id: $id)
  }
`)

export const SYNC_API_GROUP = graphql(`
  mutation SyncAPIGroup(
    $orgId: ID!
    $serviceId: ID!
    $input: SyncAPIGroupInput!
  ) {
    syncAPIGroup(orgId: $orgId, serviceId: $serviceId, input: $input) {
      apiGroupId
      versionCreated
    }
  }
`)

export const CREATE_API_ENDPOINT = graphql(`
  mutation CreateAPIEndpoint(
    $orgId: ID!
    $serviceId: ID!
    $apiGroupId: ID!
    $input: CreateAPIEndpointInput!
  ) {
    createAPIEndpoint(
      orgId: $orgId
      serviceId: $serviceId
      apiGroupId: $apiGroupId
      input: $input
    ) {
      id
    }
  }
`)

export const UPDATE_API_ENDPOINT = graphql(`
  mutation UpdateAPIEndpoint(
    $orgId: ID!
    $serviceId: ID!
    $apiGroupId: ID!
    $id: ID!
    $input: UpdateAPIEndpointInput!
  ) {
    updateAPIEndpoint(
      orgId: $orgId
      serviceId: $serviceId
      apiGroupId: $apiGroupId
      id: $id
      input: $input
    ) {
      id
    }
  }
`)

export const DELETE_API_ENDPOINT = graphql(`
  mutation DeleteAPIEndpoint(
    $orgId: ID!
    $serviceId: ID!
    $apiGroupId: ID!
    $id: ID!
  ) {
    deleteAPIEndpoint(
      orgId: $orgId
      serviceId: $serviceId
      apiGroupId: $apiGroupId
      id: $id
    )
  }
`)

export function protocolTo(source: 'openapi' | 'graphql' | 'grpc'): string {
  switch (source) {
    case 'graphql':
      return 'GraphQL'
    case 'grpc':
      return 'gRPC'
    default:
      return 'REST'
  }
}

export function protocolFrom(protocol?: string | null): string {
  return (protocol ?? 'REST').toLowerCase()
}

export async function uploadSpecFile(
  orgId: string,
  file: File
): Promise<string> {
  return uploadFile(orgId, file)
}
