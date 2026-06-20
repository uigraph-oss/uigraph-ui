import { graphql } from '@/api'

export type DashboardActor = {
  id?: string | null
  name?: string | null
  avatarUrl?: string | null
}

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
  createdByActor?: DashboardActor | null
  updatedByActor?: DashboardActor | null
}

export const FRAMES = graphql(`
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
      createdByActor {
        id
        name
        avatarUrl
      }
      updatedByActor {
        id
        name
        avatarUrl
      }
    }
  }
`)

export const FRAME = graphql(`
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
      createdByActor {
        id
        name
        avatarUrl
      }
      updatedByActor {
        id
        name
        avatarUrl
      }
    }
  }
`)

export const FRAME_BY_ID = graphql(`
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
      createdByActor {
        id
        name
        avatarUrl
      }
      updatedByActor {
        id
        name
        avatarUrl
      }
    }
  }
`)

export const CREATE_FRAME = graphql(`
  mutation CreateFrameV2($orgId: ID!, $mapId: ID!, $input: CreateFrameInput!) {
    createFrame(orgId: $orgId, mapId: $mapId, input: $input) {
      id
    }
  }
`)

export const UPDATE_FRAME = graphql(`
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

export const DELETE_FRAME = graphql(`
  mutation DeleteFrameV2($orgId: ID!, $mapId: ID!, $id: ID!) {
    deleteFrame(orgId: $orgId, mapId: $mapId, id: $id)
  }
`)
