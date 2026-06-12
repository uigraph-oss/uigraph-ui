import { graphql } from '@/api'

export const GET_DIAGRAM_FOLDER = graphql(`
  query GetDiagramFolder($folderId: String!) {
    v1GetFolder(folderId: $folderId) {
      folderId
      organizationId
      type
      name
      parentId
      order
      isActive
      createdAt
      updatedAt
    }
  }
`)

export const GET_DIAGRAM_FOLDERS = graphql(`
  query GetDiagramFolders($organizationId: String!, $parentId: String) {
    v1GetFolders(
      organizationId: $organizationId
      parentId: $parentId
      type: "diagram"
    ) {
      folderId
      organizationId
      type
      name
      parentId
      order
      isActive
      createdAt
      updatedAt
    }
  }
`)

export const CREATE_DIAGRAM_FOLDER = graphql(`
  mutation CreateDiagramFolder($input: CreateFolderInput!) {
    v1CreateFolder(input: $input) {
      folderId
      organizationId
      type
      name
      parentId
      order
      isActive
      createdAt
      updatedAt
    }
  }
`)

export const UPDATE_DIAGRAM_FOLDER = graphql(`
  mutation UpdateDiagramFolder($folderId: String!, $input: UpdateFolderInput!) {
    v1UpdateFolder(folderId: $folderId, input: $input) {
      folderId
      organizationId
      type
      name
      parentId
      order
      isActive
      createdAt
      updatedAt
    }
  }
`)

export const DELETE_DIAGRAM_FOLDER = graphql(`
  mutation DeleteDiagramFolder($folderId: String!, $organizationId: String!) {
    v1DeleteFolder(folderId: $folderId, organizationId: $organizationId)
  }
`)
