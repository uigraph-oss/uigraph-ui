import { graphql } from '@/api'

export const GET_PAGE = graphql(`
  query V1GetPage($pageId: String, $projectId: String) {
    v1GetPage(pageId: $pageId, projectId: $projectId) {
      organizationId
      projectId
      pageId
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

export const CREATE_PAGE = graphql(`
  mutation V1CreatePage($input: CreatePageInput!) {
    v1CreatePage(input: $input) {
      pageId
      description
    }
  }
`)

export const UPDATE_PAGE = graphql(`
  mutation V1UpdatePage($pageId: String!, $input: UpdatePageInput!) {
    v1UpdatePage(pageId: $pageId, input: $input) {
      pageId
      description
    }
  }
`)

export const DELETE_PAGE = graphql(`
  mutation V1DeletePage($pageId: String!) {
    v1DeletePage(pageId: $pageId)
  }
`)
