import { graphql } from '@/api'

export type DashboardActor = {
  id?: string | null
  name?: string | null
  avatarUrl?: string | null
}

export type DashboardDiagram = {
  id: string
  name?: string | null
  folderId?: string | null
  teamId?: string | null
  previewAssetId?: string | null
  previewImageUrl?: string | null
  previewContentHash?: string | null
  createdAt?: string | null
  updatedAt?: string | null
  createdByActor?: DashboardActor | null
  updatedByActor?: DashboardActor | null
}

export const DIAGRAMS = graphql(`
  query DiagramsV2($orgId: ID!, $folderId: ID) {
    diagrams(orgId: $orgId, folderId: $folderId) {
      id
      orgId
      folderId
      teamId
      name
      previewAssetId
      previewImageUrl
      previewContentHash
      createdBy
      updatedBy
      createdAt
      updatedAt
      createdByActor {
        id
        type
        name
        email
        avatarUrl
      }
      updatedByActor {
        id
        type
        name
        email
        avatarUrl
      }
    }
  }
`)

export const CREATE_DIAGRAM = graphql(`
  mutation CreateDiagramV2($orgId: ID!, $input: CreateDiagramInput!) {
    createDiagram(orgId: $orgId, input: $input) {
      id
    }
  }
`)

export const UPDATE_DIAGRAM_META = graphql(`
  mutation UpdateDiagramMetaV2(
    $orgId: ID!
    $id: ID!
    $input: UpdateDiagramInput!
  ) {
    updateDiagram(orgId: $orgId, id: $id, input: $input) {
      id
    }
  }
`)

export const DELETE_DIAGRAM = graphql(`
  mutation DeleteDiagramV2($orgId: ID!, $id: ID!) {
    deleteDiagram(orgId: $orgId, id: $id)
  }
`)
