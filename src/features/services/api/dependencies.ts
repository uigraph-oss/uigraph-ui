import { gql } from '@/api'

export type DependencyServiceRef = {
  id: string
  name: string
  description?: string | null
  gitRepoUrl?: string | null
  updatedAt?: string | null
}

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
  consumerService?: DependencyServiceRef | null
  providerService?: DependencyServiceRef | null
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

export function dependenciesToGraph(
  dependencies: ServiceDependency[]
): DependencyGraph {
  const nodes = new Map<string, DependencyGraphNode>()
  const edges: DependencyGraphEdge[] = []

  for (const dependency of dependencies) {
    const consumer = dependency.consumerService
    if (!consumer) {
      continue
    }
    if (!nodes.has(consumer.id)) {
      nodes.set(consumer.id, {
        id: consumer.id,
        name: consumer.name,
        service: {
          id: consumer.id,
          description: consumer.description,
          gitRepoUrl: consumer.gitRepoUrl,
          updatedAt: consumer.updatedAt,
        },
      })
    }

    const provider = dependency.providerService
    let providerId: string
    if (provider) {
      providerId = provider.id
      if (!nodes.has(providerId)) {
        nodes.set(providerId, {
          id: providerId,
          name: provider.name,
          service: {
            id: provider.id,
            description: provider.description,
            gitRepoUrl: provider.gitRepoUrl,
            updatedAt: provider.updatedAt,
          },
        })
      }
    } else {
      const providerName = dependency.providerName ?? dependency.name
      providerId = `ghost:${providerName}`
      if (!nodes.has(providerId)) {
        nodes.set(providerId, {
          id: providerId,
          name: providerName,
          service: null,
        })
      }
    }

    edges.push({
      id: dependency.id,
      source: consumer.id,
      target: providerId,
      type: dependency.type,
      criticality: dependency.criticality,
      apiGroupName: dependency.apiGroupName,
      apiEndpointNames: dependency.apiEndpointNames,
      databaseName: dependency.databaseName,
    })
  }

  return { nodes: [...nodes.values()], edges }
}

export type ServiceDependenciesData = {
  dependencies: ServiceDependency[]
}

export type ServiceDependencyGraphData = {
  serviceDependencyGraph: ServiceDependency[]
}

export type OrganizationDependencyGraphData = {
  dependencyGraph: ServiceDependency[]
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
      id
      name
      type
      criticality
      apiGroupName
      apiEndpointNames
      databaseName
      direction
      providerName
      consumerService {
        id
        name
        description
        gitRepoUrl
        updatedAt
      }
      providerService {
        id
        name
        description
        gitRepoUrl
        updatedAt
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
      id
      name
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

export const ORGANIZATION_DEPENDENCY_GRAPH = gql(`
  query OrganizationDependencyGraph($orgId: ID!) {
    dependencyGraph(orgId: $orgId) {
      id
      name
      type
      criticality
      apiGroupName
      apiEndpointNames
      databaseName
      direction
      providerName
      consumerService {
        id
        name
        description
        gitRepoUrl
        updatedAt
      }
      providerService {
        id
        name
        description
        gitRepoUrl
        updatedAt
      }
    }
  }
`)
