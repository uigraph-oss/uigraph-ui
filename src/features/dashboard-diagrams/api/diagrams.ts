import { graphql } from '@/api'

export type DashboardActor = {
  id?: string | null
  name?: string | null
  avatarUrl?: string | null
  type?: string | null
  email?: string | null
}

export type DashboardDiagram = {
  id: string
  name?: string | null
  folderId?: string | null
  teamId?: string | null
  previewAssetId?: string | null
  previewImageUrl?: string | null
  previewContentHash?: string | null
  previewStatus?: string | null
  createdAt?: string | null
  updatedAt?: string | null
  createdByCommitHash?: string | null
  updatedByCommitHash?: string | null
  createdByActor?: DashboardActor | null
  updatedByActor?: DashboardActor | null
}

export const DIAGRAMS = graphql(`
  query Diagrams(
    $orgId: ID!
    $folderId: ID
    $teamId: ID
    $serviceId: ID
    $search: String
    $sortBy: String
    $sortDir: String
    $limit: Int
    $offset: Int
  ) {
    diagrams(
      orgId: $orgId
      folderId: $folderId
      teamId: $teamId
      serviceId: $serviceId
      search: $search
      sortBy: $sortBy
      sortDir: $sortDir
      limit: $limit
      offset: $offset
    ) {
      totalCount
      items {
        id
        orgId
        folderId
        teamId
        name
        previewAssetId
        previewImageUrl
        previewContentHash
        previewStatus
        createdBy
        updatedBy
        createdByCommitHash
        updatedByCommitHash
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
  }
`)

export const CREATE_DIAGRAM = graphql(`
  mutation CreateDiagram($orgId: ID!, $input: CreateDiagramInput!) {
    createDiagram(orgId: $orgId, input: $input) {
      id
    }
  }
`)

export const UPDATE_DIAGRAM_META = graphql(`
  mutation UpdateDiagramMeta(
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
  mutation DeleteDiagram($orgId: ID!, $id: ID!) {
    deleteDiagram(orgId: $orgId, id: $id)
  }
`)
