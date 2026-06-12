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

export const CREATE_FOCAL_POINT = graphql(`
  mutation V1CreateFocalPoint($input: CreateFocalPointInput!) {
    v1CreateFocalPoint(input: $input) {
      focalPointId
    }
  }
`)

export const UPDATE_FOCAL_POINT = graphql(`
  mutation V1UpdateFocalPoint(
    $focalPointId: String!
    $input: UpdateFocalPointInput!
  ) {
    v1UpdateFocalPoint(focalPointId: $focalPointId, input: $input) {
      focalPointId
    }
  }
`)

export const DELETE_FOCAL_POINT = graphql(`
  mutation V1DeleteFocalPoint($focalPointId: String!) {
    v1DeleteFocalPoint(focalPointId: $focalPointId) {
      focalPointId
    }
  }
`)
