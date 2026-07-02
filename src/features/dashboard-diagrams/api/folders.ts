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

export const FOLDERS = graphql(`
  query Folders($orgId: ID!, $type: String) {
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

export const FOLDER = graphql(`
  query Folder($orgId: ID!, $id: ID!) {
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

export const CREATE_FOLDER = graphql(`
  mutation CreateFolder($orgId: ID!, $input: CreateFolderInput!) {
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

export const UPDATE_FOLDER = graphql(`
  mutation UpdateFolder($orgId: ID!, $id: ID!, $input: UpdateFolderInput!) {
    updateFolder(orgId: $orgId, id: $id, input: $input) {
      id
      name
      parentId
      teamId
      order
    }
  }
`)

export const DELETE_FOLDER = graphql(`
  mutation DeleteFolder($orgId: ID!, $id: ID!) {
    deleteFolder(orgId: $orgId, id: $id)
  }
`)
