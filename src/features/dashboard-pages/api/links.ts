import { graphql } from '@/api'

export type FrameLink = {
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
  query FrameLinks($orgId: ID!, $mapId: ID!, $frameId: ID!) {
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
  mutation CreateFrameLink(
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
  mutation UpdateFrameLink(
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
  mutation DeleteFrameLink($orgId: ID!, $mapId: ID!, $frameId: ID!, $id: ID!) {
    deleteFrameLink(orgId: $orgId, mapId: $mapId, frameId: $frameId, id: $id)
  }
`)
