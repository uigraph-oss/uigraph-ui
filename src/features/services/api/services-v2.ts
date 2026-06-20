import { graphql } from '@/api-v2'

export type DashboardService = {
  id: string
  orgId: string
  folderId?: string | null
  teamId?: string | null
  name: string
  slug: string
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
  createdAt: string
  updatedAt: string
}

export const SERVICES_V2 = graphql(`
  query ServicesV2($orgId: ID!, $folderId: ID) {
    services(orgId: $orgId, folderId: $folderId) {
      id
      orgId
      folderId
      teamId
      name
      slug
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
      createdAt
      updatedAt
    }
  }
`)

export const SERVICE_V2 = graphql(`
  query ServiceV2($orgId: ID!, $id: ID!) {
    service(orgId: $orgId, id: $id) {
      id
      orgId
      folderId
      teamId
      name
      slug
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
      createdAt
      updatedAt
    }
  }
`)

export const CREATE_SERVICE_V2 = graphql(`
  mutation CreateServiceV2($orgId: ID!, $input: CreateServiceInput!) {
    createService(orgId: $orgId, input: $input) {
      id
      name
      slug
    }
  }
`)

export const UPDATE_SERVICE_V2 = graphql(`
  mutation UpdateServiceV2($orgId: ID!, $id: ID!, $input: UpdateServiceInput!) {
    updateService(orgId: $orgId, id: $id, input: $input) {
      id
      name
    }
  }
`)

export const DELETE_SERVICE_V2 = graphql(`
  mutation DeleteServiceV2($orgId: ID!, $id: ID!) {
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
