import { graphql } from '@/api-v2'

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

export const API_GROUPS_V2 = graphql(`
  query APIGroupsV2($orgId: ID!, $serviceId: ID!) {
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

export const API_GROUP_V2 = graphql(`
  query APIGroupV2($orgId: ID!, $serviceId: ID!, $id: ID!) {
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

export const API_ENDPOINTS_V2 = graphql(`
  query APIEndpointsV2($orgId: ID!, $serviceId: ID!, $apiGroupId: ID!) {
    apiEndpoints(orgId: $orgId, serviceId: $serviceId, apiGroupId: $apiGroupId) {
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

export const CREATE_API_GROUP_V2 = graphql(`
  mutation CreateAPIGroupV2(
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

export const UPDATE_API_GROUP_V2 = graphql(`
  mutation UpdateAPIGroupV2(
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

export const DELETE_API_GROUP_V2 = graphql(`
  mutation DeleteAPIGroupV2($orgId: ID!, $serviceId: ID!, $id: ID!) {
    deleteAPIGroup(orgId: $orgId, serviceId: $serviceId, id: $id)
  }
`)

export const SYNC_API_GROUP_V2 = graphql(`
  mutation SyncAPIGroupV2(
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

export const CREATE_API_ENDPOINT_V2 = graphql(`
  mutation CreateAPIEndpointV2(
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

export const UPDATE_API_ENDPOINT_V2 = graphql(`
  mutation UpdateAPIEndpointV2(
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

export const DELETE_API_ENDPOINT_V2 = graphql(`
  mutation DeleteAPIEndpointV2(
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

export function protocolToV2(source: 'openapi' | 'graphql' | 'grpc'): string {
  switch (source) {
    case 'graphql':
      return 'GraphQL'
    case 'grpc':
      return 'gRPC'
    default:
      return 'REST'
  }
}

export function protocolFromV2(protocol?: string | null): string {
  return (protocol ?? 'REST').toLowerCase()
}

export async function readSpecFile(file: File): Promise<string> {
  return file.text()
}
