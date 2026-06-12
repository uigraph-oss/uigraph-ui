import { graphql } from '@/api'

export const GET_FOLDER_AND_DIAGRAMS = graphql(`
  query GetFolderAndDiagrams($organizationId: String!, $folderId: String) {
    v1GetDiagramsByOrgId(organizationId: $organizationId, folderId: $folderId) {
      diagramId
      folderId
      organizationId
      componentFlowDiagram
      componentFlowDiagramName
      previewImageFileId
      teamId
      createdBy
      updatedBy
      createdByProfileImgUrl
      updatedByProfileImgUrl
      createdAt
      updatedAt
      deletedAt
      deletedBy
    }

    v1GetFolders(
      type: "diagram"
      organizationId: $organizationId
      parentId: $folderId
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

export const GET_DIAGRAMS_BY_ORG_ID = graphql(`
  query DiagramPortalGetDiagramsByOrgId(
    $organizationId: String!
    $folderId: String
  ) {
    v1GetDiagramsByOrgId(organizationId: $organizationId, folderId: $folderId) {
      diagramId
      folderId
      organizationId
      componentFlowDiagram
      componentFlowDiagramName
      previewImageFileId
      createdBy
      updatedBy
      createdByProfileImgUrl
      updatedByProfileImgUrl
      createdAt
      updatedAt
      deletedAt
      deletedBy
    }
  }
`)

export const CREATE_DIAGRAM_MUTATION = graphql(`
  mutation DiagramPortalCreateDiagram($input: CreateDiagramInput!) {
    v1CreateDiagram(input: $input) {
      diagramId
      folderId
      organizationId
      componentFlowDiagram
      componentFlowDiagramName
      previewImageFileId
      createdBy
      updatedBy
      createdByProfileImgUrl
      updatedByProfileImgUrl
      createdAt
      updatedAt
      deletedAt
      deletedBy
    }
  }
`)

export const DELETE_DIAGRAM_MUTATION = graphql(`
  mutation DiagramPortalDeleteDiagram($diagramId: String!) {
    v1DeleteDiagram(diagramId: $diagramId)
  }
`)

export const UPDATE_DIAGRAM_MUTATION = graphql(`
  mutation DiagramPortalUpdateDiagram(
    $diagramId: String!
    $input: UpdateDiagramInput!
  ) {
    v1UpdateDiagram(diagramId: $diagramId, input: $input) {
      diagramId
      folderId
      organizationId
      componentFlowDiagram
      componentFlowDiagramName
      previewImageFileId
      createdBy
      updatedBy
      createdByProfileImgUrl
      updatedByProfileImgUrl
      createdAt
      updatedAt
      deletedAt
      deletedBy
    }
  }
`)
