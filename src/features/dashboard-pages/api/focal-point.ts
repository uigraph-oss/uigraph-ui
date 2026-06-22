import { graphql } from '@/api'

export type FocalPoint = {
  id: string
  frameId?: string | null
  orgId?: string | null
  name?: string | null
  locationX?: number | null
  locationY?: number | null
  visibility?: string | null
  isActive?: boolean | null
}

export const FOCAL_POINTS = graphql(`
  query FocalPoints($orgId: ID!, $mapId: ID!, $frameId: ID!) {
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

export const CREATE_FOCAL_POINT = graphql(`
  mutation CreateFocalPoint(
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

export const UPDATE_FOCAL_POINT = graphql(`
  mutation UpdateFocalPoint(
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

export const DELETE_FOCAL_POINT = graphql(`
  mutation DeleteFocalPoint($orgId: ID!, $mapId: ID!, $frameId: ID!, $id: ID!) {
    deleteFocalPoint(orgId: $orgId, mapId: $mapId, frameId: $frameId, id: $id)
  }
`)
