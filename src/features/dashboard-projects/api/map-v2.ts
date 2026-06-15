import { graphql } from '@/api-v2'

export type DashboardMap = {
  id: string
  orgId?: string | null
  folderId?: string | null
  teamId?: string | null
  name?: string | null
  description?: string | null
  status?: string | null
  createdBy?: string | null
  updatedBy?: string | null
  createdAt?: string | null
  updatedAt?: string | null
}

export const MAPS_V2 = graphql(`
  query MapsV2($orgId: ID!, $folderId: ID) {
    maps(orgId: $orgId, folderId: $folderId) {
      id
      orgId
      folderId
      teamId
      name
      description
      status
      createdBy
      updatedBy
      createdAt
      updatedAt
    }
  }
`)

export const MAP_V2 = graphql(`
  query MapV2($orgId: ID!, $id: ID!) {
    map(orgId: $orgId, id: $id) {
      id
      orgId
      folderId
      teamId
      name
      description
      status
      createdBy
      updatedBy
      createdAt
      updatedAt
    }
  }
`)

export const CREATE_MAP_V2 = graphql(`
  mutation CreateMapV2($orgId: ID!, $input: CreateMapInput!) {
    createMap(orgId: $orgId, input: $input) {
      id
    }
  }
`)

export const UPDATE_MAP_V2 = graphql(`
  mutation UpdateMapV2($orgId: ID!, $id: ID!, $input: UpdateMapInput!) {
    updateMap(orgId: $orgId, id: $id, input: $input) {
      id
    }
  }
`)

export const DELETE_MAP_V2 = graphql(`
  mutation DeleteMapV2($orgId: ID!, $id: ID!) {
    deleteMap(orgId: $orgId, id: $id)
  }
`)
