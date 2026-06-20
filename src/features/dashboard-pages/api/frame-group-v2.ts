import { graphql } from '@/api'

export type FrameGroupV2 = {
  id: string
  frameId?: string | null
  orgId?: string | null
  name?: string | null
  description?: string | null
  locationX?: number | null
  locationY?: number | null
  width?: number | null
  height?: number | null
  order?: number | null
  isActive?: boolean | null
}

export const FRAME_GROUPS_V2 = graphql(`
  query FrameGroupsV2($orgId: ID!, $mapId: ID!, $frameId: ID!) {
    frameGroups(orgId: $orgId, mapId: $mapId, frameId: $frameId) {
      id
      frameId
      orgId
      name
      description
      locationX
      locationY
      width
      height
      order
      isActive
      createdAt
      updatedAt
    }
  }
`)

export const CREATE_FRAME_GROUP_V2 = graphql(`
  mutation CreateFrameGroupV2(
    $orgId: ID!
    $mapId: ID!
    $frameId: ID!
    $input: CreateFrameGroupInput!
  ) {
    createFrameGroup(
      orgId: $orgId
      mapId: $mapId
      frameId: $frameId
      input: $input
    ) {
      id
    }
  }
`)

export const UPDATE_FRAME_GROUP_V2 = graphql(`
  mutation UpdateFrameGroupV2(
    $orgId: ID!
    $mapId: ID!
    $frameId: ID!
    $id: ID!
    $input: UpdateFrameGroupInput!
  ) {
    updateFrameGroup(
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

export const DELETE_FRAME_GROUP_V2 = graphql(`
  mutation DeleteFrameGroupV2(
    $orgId: ID!
    $mapId: ID!
    $frameId: ID!
    $id: ID!
  ) {
    deleteFrameGroup(orgId: $orgId, mapId: $mapId, frameId: $frameId, id: $id)
  }
`)
