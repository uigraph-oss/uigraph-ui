import { graphql } from '@/api-v2'

export type DashboardFrame = {
  id: string
  mapId?: string | null
  orgId?: string | null
  parentFrameId?: string | null
  name?: string | null
  description?: string | null
  templateType?: string | null
  screenshotAssetId?: string | null
  screenshotImageUrl?: string | null
  screenshotContentHash?: string | null
  status?: string | null
  order?: number | null
  source?: string | null
  createdBy?: string | null
  updatedBy?: string | null
  createdAt?: string | null
  updatedAt?: string | null
}

export const FRAMES_V2 = graphql(`
  query FramesV2($orgId: ID!, $mapId: ID!) {
    frames(orgId: $orgId, mapId: $mapId) {
      id
      mapId
      orgId
      parentFrameId
      name
      description
      templateType
      screenshotAssetId
      screenshotImageUrl
      screenshotContentHash
      status
      order
      source
      createdBy
      updatedBy
      createdAt
      updatedAt
    }
  }
`)

export const FRAME_V2 = graphql(`
  query FrameV2($orgId: ID!, $mapId: ID!, $id: ID!) {
    frame(orgId: $orgId, mapId: $mapId, id: $id) {
      id
      mapId
      orgId
      parentFrameId
      name
      description
      templateType
      screenshotAssetId
      screenshotImageUrl
      screenshotContentHash
      status
      order
      source
      createdBy
      updatedBy
      createdAt
      updatedAt
    }
  }
`)

export const FRAME_BY_ID_V2 = graphql(`
  query FrameByIdV2($orgId: ID!, $id: ID!) {
    frameById(orgId: $orgId, id: $id) {
      id
      mapId
      orgId
      parentFrameId
      name
      description
      templateType
      screenshotAssetId
      screenshotImageUrl
      screenshotContentHash
      status
      order
      source
      createdBy
      updatedBy
      createdAt
      updatedAt
    }
  }
`)

export const CREATE_FRAME_V2 = graphql(`
  mutation CreateFrameV2($orgId: ID!, $mapId: ID!, $input: CreateFrameInput!) {
    createFrame(orgId: $orgId, mapId: $mapId, input: $input) {
      id
    }
  }
`)

export const UPDATE_FRAME_V2 = graphql(`
  mutation UpdateFrameV2(
    $orgId: ID!
    $mapId: ID!
    $id: ID!
    $input: UpdateFrameInput!
  ) {
    updateFrame(orgId: $orgId, mapId: $mapId, id: $id, input: $input) {
      id
    }
  }
`)

export const DELETE_FRAME_V2 = graphql(`
  mutation DeleteFrameV2($orgId: ID!, $mapId: ID!, $id: ID!) {
    deleteFrame(orgId: $orgId, mapId: $mapId, id: $id)
  }
`)
