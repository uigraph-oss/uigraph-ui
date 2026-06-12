import { graphql } from '@/api'

export const GET_CANVAS_POINTS = graphql(`
  query V1GetCanvasPoints($pageId: String!) {
    v1GetFocalPoint(pageId: $pageId) {
      focalPointId
      organizationId
      pageId
      focalPointName
      locationX
      locationY
      isActive
      createdBy
      updatedBy
      createdAt
      updatedAt
      deletedAt
      deletedBy
    }

    v1GetPagePageLink(pageId: $pageId) {
      linkId
      organizationId
      pageId
      linkedPageId
      label
      locationX
      locationY
      isActive
      createdBy
      updatedBy
      createdAt
      updatedAt
      deletedAt
      deletedBy
    }

    v1GetPageProjectLink(pageId: $pageId) {
      linkId
      organizationId
      pageId
      projectId
      label
      locationX
      locationY
      isActive
      createdBy
      updatedBy
      createdAt
      updatedAt
      deletedAt
      deletedBy
    }

    v1GetPageGroup(pageId: $pageId) {
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
