import { graphql } from '@/api'

export const GET_FRAME_GROUP = graphql(`
  query V1GetPageGroup($pageGroupId: String, $pageId: String) {
    v1GetPageGroup(pageGroupId: $pageGroupId, pageId: $pageId) {
      pageGroupId
      organizationId
      pageId
      groupName
      description
      locationX
      locationY
      width
      height
      order
      isActive
      createdBy
      updatedBy
      createdAt
      updatedAt
      deletedAt
      deletedBy
    }
  }
`)

export const GET_FRAMES_WITH_GROUPS = graphql(`
  query V1GetPagesWithGroups($projectId: String!) {
    v1GetPagesWithGroups(projectId: $projectId) {
      pages {
        page {
          pageId
          organizationId
          projectId
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
        }
      }
    }
  }
`)

export const CREATE_FRAME_GROUP = graphql(`
  mutation V1CreatePageGroup($input: CreatePageGroupInput!) {
    v1CreatePageGroup(input: $input) {
      pageGroupId
      organizationId
      pageId
      groupName
      description
      locationX
      locationY
      width
      height
      order
      isActive
      createdBy
      updatedBy
      createdAt
      updatedAt
      deletedAt
      deletedBy
    }
  }
`)

export const DELETE_FRAME_GROUP = graphql(`
  mutation V1DeletePageGroup($pageGroupId: String!) {
    v1DeletePageGroup(pageGroupId: $pageGroupId) {
      pageGroupId
      organizationId
      pageId
      groupName
      description
      locationX
      locationY
      width
      height
      order
      isActive
      createdBy
      updatedBy
      createdAt
      updatedAt
      deletedAt
      deletedBy
    }
  }
`)

export const UPDATE_FRAME_GROUP = graphql(`
  mutation V1UpdatePageGroup(
    $pageGroupId: String!
    $input: UpdatePageGroupInput!
  ) {
    v1UpdatePageGroup(pageGroupId: $pageGroupId, input: $input) {
      pageGroupId
      organizationId
      pageId
      groupName
      description
      locationX
      locationY
      width
      height
      order
      isActive
      createdBy
      updatedBy
      createdAt
      updatedAt
      deletedAt
      deletedBy
    }
  }
`)
