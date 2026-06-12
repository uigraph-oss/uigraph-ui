import { graphql } from '@/api'

export const GET_PROJECT = graphql(`
  query V1GetProject($organizationId: String!, $projectId: String) {
    v1GetProject(organizationId: $organizationId, projectId: $projectId) {
      projectId
      organizationId
      name
      description
      createdAt
      createdBy
      createdByProfileImgUrl
      updatedByProfileImgUrl
      teamId
      updatedAt
      updatedBy
      deletedAt
      deletedBy
      previewImgUrls
      status
      pageCount
      collaborators {
        name
        profileImgUrl
      }
    }
  }
`)

export const CREATE_PROJECT = graphql(`
  mutation V1CreateProject($input: CreateProjectInput!) {
    v1CreateProject(input: $input) {
      projectId
    }
  }
`)

export const UPDATE_PROJECT = graphql(`
  mutation V1UpdateProject(
    $organizationId: String!
    $projectId: String!
    $input: UpdateProjectInput!
  ) {
    v1UpdateProject(
      organizationId: $organizationId
      projectId: $projectId
      input: $input
    ) {
      projectId
    }
  }
`)

export const DELETE_PROJECT = graphql(`
  mutation V1DeleteProject($projectId: String!) {
    v1DeleteProject(projectId: $projectId)
  }
`)

export const GET_PROJECT_AND_PAGES = graphql(`
  query V1GetProjectAndPages($organizationId: String!, $projectId: String!) {
    v1GetProject(organizationId: $organizationId, projectId: $projectId) {
      projectId
      organizationId
      name
      description
      createdAt
      createdBy
      teamId
      updatedAt
      previewImgUrls
      updatedBy
      deletedAt
      deletedBy
      status
      pageCount
      collaborators {
        name
        profileImgUrl
      }
    }

    v1GetPage(projectId: $projectId) {
      organizationId
      projectId
      pageId

      parentPageId
      pageGroupId

      pageName
      description
      status
      templateType
      screenShotFileID
      screenShotFileUrl
      createdAt
      createdBy
      updatedAt
      updatedBy
      deletedAt
      deletedBy

      collaborators {
        name
        profileImgUrl
      }
    }
  }
`)
