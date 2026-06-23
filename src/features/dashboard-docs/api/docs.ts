import { graphql } from '@/api'

export type DashboardActor = {
  id?: string | null
  name?: string | null
  avatarUrl?: string | null
}

export type DashboardDoc = {
  id: string
  orgId?: string | null
  folderId?: string | null
  teamId?: string | null
  fileAssetId?: string | null
  fileUrl?: string | null
  fileName?: string | null
  fileType?: string | null
  description?: string | null
  contentHash?: string | null
  createdAt?: string | null
  updatedAt?: string | null
  createdByActor?: DashboardActor | null
  updatedByActor?: DashboardActor | null
}

export const DOCS = graphql(`
  query Docs($orgId: ID!, $folderId: ID) {
    docs(orgId: $orgId, folderId: $folderId) {
      id
      orgId
      folderId
      teamId
      fileAssetId
      fileUrl
      fileName
      fileType
      description
      contentHash
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

export const CREATE_DOC = graphql(`
  mutation CreateDoc($orgId: ID!, $input: CreateDocInput!) {
    createDoc(orgId: $orgId, input: $input) {
      id
      fileName
    }
  }
`)

export const UPDATE_DOC = graphql(`
  mutation UpdateDoc($orgId: ID!, $id: ID!, $input: UpdateDocInput!) {
    updateDoc(orgId: $orgId, id: $id, input: $input) {
      id
      fileName
    }
  }
`)

export const DELETE_DOC = graphql(`
  mutation DeleteDoc($orgId: ID!, $id: ID!) {
    deleteDoc(orgId: $orgId, id: $id)
  }
`)
