import { graphql } from '@/api'

export const GET_SERVICES_QUERY = graphql(`
  query V1GetServices($organizationId: String!, $serviceId: String) {
    v1GetServices(organizationId: $organizationId, serviceId: $serviceId) {
      serviceId
      organizationId
      folderId
      slug
      name
      description
      labels
      gitRepoName
      gitRepoUrl
      jiraProjectName
      jiraProjectUrl
      collaborators
      slackChannelName
      slackChannelUrl
      category
      teamId
      createdAt
      updatedAt
      deletedAt
      createdBy
      updatedBy
      deletedBy
      lastCommitSha
    }
  }
`)

export const CREATE_SERVICE_MUTATION = graphql(`
  mutation V1CreateService($input: CreateServiceInput!) {
    v1CreateService(input: $input) {
      serviceId
      organizationId
      folderId
      slug
      name
      description
      labels
      gitRepoName
      gitRepoUrl
      jiraProjectName
      jiraProjectUrl
      collaborators
      slackChannelName
      slackChannelUrl
      category
      teamId
      createdAt
      updatedAt
      deletedAt
      createdBy
      updatedBy
      deletedBy
      lastCommitSha
    }
  }
`)

export const DELETE_SERVICE_MUTATION = graphql(`
  mutation V1DeleteService($serviceId: String!, $organizationId: String!) {
    v1DeleteService(serviceId: $serviceId, organizationId: $organizationId)
  }
`)

export const UPDATE_SERVICE_MUTATION = graphql(`
  mutation V1UpdateService($serviceId: String!, $input: UpdateServiceInput!) {
    v1UpdateService(serviceId: $serviceId, input: $input) {
      serviceId
      organizationId
      folderId
      slug
      name
      description
      labels
      gitRepoName
      gitRepoUrl
      jiraProjectName
      jiraProjectUrl
      collaborators
      slackChannelName
      slackChannelUrl
      category
      teamId
      createdAt
      updatedAt
      deletedAt
      createdBy
      updatedBy
      deletedBy
      lastCommitSha
    }
  }
`)
