import { gql } from '@/api'

export type DependencyServiceRef = {
  id: string
  name: string
  description?: string | null
  gitRepoUrl?: string | null
  updatedAt?: string | null
}

export type DependencyDirection = 'upstream' | 'downstream'

export type ServiceDependency = {
  id: string
  name: string
  type?: string | null
  criticality?: string | null
  description?: string | null
  apiGroupName?: string | null
  apiEndpointNames?: string[] | null
  databaseName?: string | null
  direction: DependencyDirection
  dependencyName: string
  service?: DependencyServiceRef | null
  dependency?: DependencyServiceRef | null
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
  direction: DependencyDirection
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
    const service = dependency.service
    if (!service) {
      continue
    }
    if (!nodes.has(service.id)) {
      nodes.set(service.id, {
        id: service.id,
        name: service.name,
        service: {
          id: service.id,
          description: service.description,
          gitRepoUrl: service.gitRepoUrl,
          updatedAt: service.updatedAt,
        },
      })
    }

    const peer = dependency.dependency
    let peerId: string
    if (peer) {
      peerId = peer.id
      if (!nodes.has(peerId)) {
        nodes.set(peerId, {
          id: peerId,
          name: peer.name,
          service: {
            id: peer.id,
            description: peer.description,
            gitRepoUrl: peer.gitRepoUrl,
            updatedAt: peer.updatedAt,
          },
        })
      }
    } else {
      peerId = `ghost:${dependency.dependencyName}`
      if (!nodes.has(peerId)) {
        nodes.set(peerId, {
          id: peerId,
          name: dependency.dependencyName,
          service: null,
        })
      }
    }

    edges.push({
      id: dependency.id,
      source: service.id,
      target: peerId,
      direction: dependency.direction,
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
      dependencyName
      service {
        id
        name
      }
      dependency {
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
      dependencyName
      service {
        id
        name
        description
        gitRepoUrl
        updatedAt
      }
      dependency {
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
      dependencyName
      service {
        id
        name
      }
      dependency {
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
      dependencyName
      service {
        id
        name
        description
        gitRepoUrl
        updatedAt
      }
      dependency {
        id
        name
        description
        gitRepoUrl
        updatedAt
      }
    }
  }
`)
