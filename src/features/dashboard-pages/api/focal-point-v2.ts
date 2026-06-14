import { graphql } from '@/api-v2'

export const FOCAL_POINTS_V2 = graphql(`
  query FocalPointsV2($orgId: ID!, $mapId: ID!, $frameId: ID!) {
    focalPoints(orgId: $orgId, mapId: $mapId, frameId: $frameId) {
      id
      frameId
      orgId
      name
      locationX
      locationY
      visibility
      isActive
      createdBy
      updatedBy
      createdAt
      updatedAt
    }
  }
`)

export const CREATE_FOCAL_POINT_V2 = graphql(`
  mutation CreateFocalPointV2(
    $orgId: ID!
    $mapId: ID!
    $frameId: ID!
    $input: CreateFocalPointInput!
  ) {
    createFocalPoint(
      orgId: $orgId
      mapId: $mapId
      frameId: $frameId
      input: $input
    ) {
      id
    }
  }
`)

export const UPDATE_FOCAL_POINT_V2 = graphql(`
  mutation UpdateFocalPointV2(
    $orgId: ID!
    $mapId: ID!
    $frameId: ID!
    $id: ID!
    $input: UpdateFocalPointInput!
  ) {
    updateFocalPoint(
      orgId: $orgId
      mapId: $mapId
      frameId: $frameId
      id: $id
      input: $input
    ) {
      id
    }
  }
`)

export const DELETE_FOCAL_POINT_V2 = graphql(`
  mutation DeleteFocalPointV2(
    $orgId: ID!
    $mapId: ID!
    $frameId: ID!
    $id: ID!
  ) {
    deleteFocalPoint(orgId: $orgId, mapId: $mapId, frameId: $frameId, id: $id)
  }
`)
