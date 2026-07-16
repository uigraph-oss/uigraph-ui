import { gql } from '@/api'

export type ServiceDependency = {
  id: string
  name: string
  type?: string | null
  criticality?: string | null
  description?: string | null
  apiGroupName?: string | null
  apiEndpointNames?: string[] | null
  databaseName?: string | null
  direction: string
  providerName?: string | null
  consumerService?: { id: string; name: string } | null
  providerService?: { id: string; name: string } | null
}

export type DependencyGraphNode = {
  id: string
  name: string
  service?: {
    id: string
    description?: string | null
    gitRepoUrl?: string | null
    updatedAt?: string | null
  } | null
}

export type DependencyGraphEdge = {
  id: string
  source: string
  target: string
  type?: string | null
  criticality?: string | null
  apiGroupName?: string | null
  apiEndpointNames?: string[] | null
  databaseName?: string | null
}

export type DependencyGraph = {
  nodes: DependencyGraphNode[]
  edges: DependencyGraphEdge[]
}

export type ServiceDependenciesData = {
  dependencies: ServiceDependency[]
}

export type ServiceDependencyGraphData = {
  serviceDependencyGraph: DependencyGraph
}

export type OrganizationDependencyGraphData = {
  dependencyGraph: DependencyGraph
}

export const SERVICE_DEPENDENCIES = gql(`
  query ServiceDependencies(
    $orgId: ID!
    $serviceId: ID!
    $direction: String
    $criticality: String
  ) {
    dependencies(
      orgId: $orgId
      serviceId: $serviceId
      direction: $direction
      criticality: $criticality
    ) {
      id
      name
      type
      criticality
      description
      apiGroupName
      apiEndpointNames
      databaseName
      direction
      providerName
      consumerService {
        id
        name
      }
      providerService {
        id
        name
      }
    }
  }
`)

export const SERVICE_DEPENDENCY_GRAPH = gql(`
  query ServiceDependencyGraph($orgId: ID!, $serviceId: ID!) {
    serviceDependencyGraph(orgId: $orgId, serviceId: $serviceId) {
      nodes {
        id
        name
        service {
          id
          description
          gitRepoUrl
          updatedAt
        }
      }
      edges {
        id
        source
        target
        type
        criticality
        apiGroupName
        apiEndpointNames
        databaseName
      }
    }
  }
`)

export const UPDATE_SERVICE_DEPENDENCIES = gql(`
  mutation UpdateServiceDependencies(
    $orgId: ID!
    $serviceId: ID!
    $input: UpdateServiceDependenciesInput!
  ) {
    updateServiceDependencies(orgId: $orgId, serviceId: $serviceId, input: $input) {
      nodes {
        id
        name
        service {
          id
          description
          gitRepoUrl
          updatedAt
        }
      }
      edges {
        id
        source
        target
        type
        criticality
        apiGroupName
        apiEndpointNames
        databaseName
      }
    }
  }
`)

export const ORGANIZATION_DEPENDENCY_GRAPH = gql(`
  query OrganizationDependencyGraph($orgId: ID!) {
    dependencyGraph(orgId: $orgId) {
      nodes {
        id
        name
        service {
          id
          description
          gitRepoUrl
          updatedAt
        }
      }
      edges {
        id
        source
        target
        type
        criticality
        apiGroupName
        apiEndpointNames
        databaseName
      }
    }
  }
`)
