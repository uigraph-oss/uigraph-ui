import { graphql } from '@/api'

export type FrameLinkV2 = {
  id: string
  frameId?: string | null
  orgId?: string | null
  kind?: string | null
  targetFrameId?: string | null
  targetMapId?: string | null
  label?: string | null
  locationX?: number | null
  locationY?: number | null
  isActive?: boolean | null
}

export const FRAME_LINKS = graphql(`
  query FrameLinksV2($orgId: ID!, $mapId: ID!, $frameId: ID!) {
    frameLinks(orgId: $orgId, mapId: $mapId, frameId: $frameId) {
      id
      frameId
      orgId
      kind
      targetFrameId
      targetMapId
      label
      locationX
      locationY
      isActive
      createdAt
      updatedAt
    }
  }
`)

export const CREATE_FRAME_LINK = graphql(`
  mutation CreateFrameLinkV2(
    $orgId: ID!
    $mapId: ID!
    $frameId: ID!
    $input: CreateFrameLinkInput!
  ) {
    createFrameLink(
      orgId: $orgId
      mapId: $mapId
      frameId: $frameId
      input: $input
    ) {
      id
    }
  }
`)

export const UPDATE_FRAME_LINK = graphql(`
  mutation UpdateFrameLinkV2(
    $orgId: ID!
    $mapId: ID!
    $frameId: ID!
    $id: ID!
    $input: UpdateFrameLinkInput!
  ) {
    updateFrameLink(
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

export const DELETE_FRAME_LINK = graphql(`
  mutation DeleteFrameLinkV2(
    $orgId: ID!
    $mapId: ID!
    $frameId: ID!
    $id: ID!
  ) {
    deleteFrameLink(orgId: $orgId, mapId: $mapId, frameId: $frameId, id: $id)
  }
`)
