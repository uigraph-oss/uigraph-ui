import { gql } from '@/api'

export type ServiceDependency = {
  id: string
  name: string
  type?: string | null
  criticality?: string | null
  description?: string | null
  api?: unknown
  operations?: unknown
  direction: string
  providerName?: string | null
  onboardingStatus?: string | null
  consumerService?: { id: string; name: string } | null
  providerService?: { id: string; name: string } | null
}

export type DependencyGraphNode = {
  id: string
  name: string
  onboardingStatus?: string | null
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
  operations?: unknown
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
      api
      operations
      direction
      providerName
      onboardingStatus
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
        onboardingStatus
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
        operations
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
        onboardingStatus
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
        operations
      }
    }
  }
`)
