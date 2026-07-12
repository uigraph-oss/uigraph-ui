import { graphql } from '@/api'

export type ServiceStats = {
  serviceId: string
  endpointCount: number
  diagramCount: number
  dbTableCount: number
  docCount: number
  testCaseCount: number
}

export type DashboardService = {
  id: string
  orgId: string
  folderId?: string | null
  teamId?: string | null
  name: string
  description: string
  status: string
  tier: string
  category: string
  language: string
  gitRepoUrl?: string | null
  jiraProjectUrl?: string | null
  slackChannelUrl?: string | null
  lastCommitSha?: string | null
  labels: string[]
  metadata?: string | null
  createdBy: string
  updatedBy?: string | null
  stats?: ServiceStats | null
  createdAt: string
  updatedAt: string
}

export const SERVICES = graphql(`
  query Services(
    $orgId: ID!
    $folderId: ID
    $teamId: ID
    $search: String
    $sortBy: String
    $sortDir: String
    $limit: Int
    $offset: Int
  ) {
    services(
      orgId: $orgId
      folderId: $folderId
      teamId: $teamId
      search: $search
      sortBy: $sortBy
      sortDir: $sortDir
      limit: $limit
      offset: $offset
    ) {
      totalCount
      items {
        id
        orgId
        folderId
        teamId
        name
        description
        status
        tier
        category
        language
        gitRepoUrl
        jiraProjectUrl
        slackChannelUrl
        lastCommitSha
        labels
        metadata
        createdBy
        updatedBy
        stats {
          serviceId
          endpointCount
          diagramCount
          dbTableCount
          docCount
          testCaseCount
        }
        createdAt
        updatedAt
      }
    }
  }
`)

export const SERVICE = graphql(`
  query Service($orgId: ID!, $id: ID!) {
    service(orgId: $orgId, id: $id) {
      id
      orgId
      folderId
      teamId
      name
      description
      status
      tier
      category
      language
      gitRepoUrl
      jiraProjectUrl
      slackChannelUrl
      lastCommitSha
      labels
      metadata
      createdBy
      updatedBy
      stats {
        serviceId
        endpointCount
        diagramCount
        dbTableCount
        docCount
        testCaseCount
      }
      createdAt
      updatedAt
    }
  }
`)

export const CREATE_SERVICE = graphql(`
  mutation CreateService($orgId: ID!, $input: CreateServiceInput!) {
    createService(orgId: $orgId, input: $input) {
      id
      name
    }
  }
`)

export const UPDATE_SERVICE = graphql(`
  mutation UpdateService($orgId: ID!, $id: ID!, $input: UpdateServiceInput!) {
    updateService(orgId: $orgId, id: $id, input: $input) {
      id
      name
    }
  }
`)

export const DELETE_SERVICE = graphql(`
  mutation DeleteService($orgId: ID!, $id: ID!) {
    deleteService(orgId: $orgId, id: $id)
  }
`)

export function toCreateServiceInput(data: {
  name: string
  category: string
  description: string
  teamId?: string
  labels?: string[]
  gitRepoUrl?: string
  jiraProjectUrl?: string
  slackChannelUrl?: string
}) {
  return {
    name: data.name,
    description: data.description,
    category: data.category,
    teamId: data.teamId,
    labels: data.labels ?? [],
    gitRepoUrl: data.gitRepoUrl,
    jiraProjectUrl: data.jiraProjectUrl,
    slackChannelUrl: data.slackChannelUrl,
    status: 'active',
    tier: 'tier3',
    language: '',
  }
}

export function toUpdateServiceInput(data: {
  name: string
  category: string
  description: string
  teamId?: string
  labels?: string[]
  gitRepoUrl?: string
  jiraProjectUrl?: string
  slackChannelUrl?: string
}) {
  return {
    name: data.name,
    description: data.description,
    category: data.category,
    teamId: data.teamId,
    labels: data.labels ?? [],
    gitRepoUrl: data.gitRepoUrl,
    jiraProjectUrl: data.jiraProjectUrl,
    slackChannelUrl: data.slackChannelUrl,
  }
}
