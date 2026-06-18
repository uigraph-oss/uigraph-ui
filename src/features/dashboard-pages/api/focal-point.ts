import { graphql } from '@/api'

export const GET_FOCAL_POINT = graphql(`
  query V1GetFocalPoint($pageId: String!) {
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
  }
`)
