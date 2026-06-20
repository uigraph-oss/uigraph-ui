import { graphql } from '@/api'

export type DashboardFolder = {
  id: string
  orgId: string
  parentId?: string | null
  teamId?: string | null
  type: string
  name: string
  order: number
  createdAt?: string | null
  updatedAt?: string | null
}

export const FOLDERS_V2 = graphql(`
  query FoldersV2($orgId: ID!, $type: String) {
    folders(orgId: $orgId, type: $type) {
      id
      orgId
      parentId
      teamId
      type
      name
      order
      createdAt
      updatedAt
    }
  }
`)

export const FOLDER_V2 = graphql(`
  query FolderV2($orgId: ID!, $id: ID!) {
    folder(orgId: $orgId, id: $id) {
      id
      orgId
      parentId
      teamId
      type
      name
      order
      createdAt
      updatedAt
    }
  }
`)

export const CREATE_FOLDER_V2 = graphql(`
  mutation CreateFolderV2($orgId: ID!, $input: CreateFolderInput!) {
    createFolder(orgId: $orgId, input: $input) {
      id
      orgId
      parentId
      teamId
      type
      name
      order
    }
  }
`)

export const UPDATE_FOLDER_V2 = graphql(`
  mutation UpdateFolderV2($orgId: ID!, $id: ID!, $input: UpdateFolderInput!) {
    updateFolder(orgId: $orgId, id: $id, input: $input) {
      id
      name
      parentId
      teamId
      order
    }
  }
`)

export const DELETE_FOLDER_V2 = graphql(`
  mutation DeleteFolderV2($orgId: ID!, $id: ID!) {
    deleteFolder(orgId: $orgId, id: $id)
  }
`)
