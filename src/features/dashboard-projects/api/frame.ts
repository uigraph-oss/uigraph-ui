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
  focalPointCount?: number | null
  createdBy?: string | null
  updatedBy?: string | null
  createdAt?: string | null
  updatedAt?: string | null
  createdByActor?: DashboardActor | null
  updatedByActor?: DashboardActor | null
}

export const FRAMES = graphql(`
  query Frames(
    $orgId: ID!
    $mapId: ID!
    $search: String
    $sortBy: String
    $sortDir: String
    $limit: Int
    $offset: Int
  ) {
    frames(
      orgId: $orgId
      mapId: $mapId
      search: $search
      sortBy: $sortBy
      sortDir: $sortDir
      limit: $limit
      offset: $offset
    ) {
      totalCount
      items {
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
        focalPointCount
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
  }
`)

export const FRAME = graphql(`
  query Frame($orgId: ID!, $mapId: ID!, $id: ID!) {
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
      focalPointCount
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
  query FrameById($orgId: ID!, $id: ID!) {
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
      focalPointCount
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
  mutation CreateFrame($orgId: ID!, $mapId: ID!, $input: CreateFrameInput!) {
    createFrame(orgId: $orgId, mapId: $mapId, input: $input) {
      id
    }
  }
`)

export const UPDATE_FRAME = graphql(`
  mutation UpdateFrame(
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
  mutation DeleteFrame($orgId: ID!, $mapId: ID!, $id: ID!) {
    deleteFrame(orgId: $orgId, mapId: $mapId, id: $id)
  }
`)
