import { graphql } from '@/api'

export const GET_FLOW_DIAGRAM_COMPONENTS = graphql(`
  query V1GetFlowDiagramComponents($organizationId: String!) {
    v1GetFlowDiagramComponents(organizationId: $organizationId) {
      components {
        componentId
        type
        name
        description
        tags
        category
        slug
        previewImageJpg
        createdAt
        updatedAt
        isActive
        order
        flowDiagramComponentFields {
          flowDiagramComponentFieldId
          label
          type
          required
          readonly
          data
          options
          order
        }
      }
      customComponents {
        componentId
        type
        name
        description
        tags
        category
        slug
        previewImageJpg
        organizationId
        createdAt
        updatedAt
        createdBy
        updatedBy
        deletedAt
        deletedBy
        isActive
        order
        flowDiagramComponentFields {
          flowDiagramComponentFieldId
          label
          type
          required
          readonly
          data
          options
          order
        }
      }
    }
  }
`)

export const GET_DIAGRAM_QUERY = graphql(`
  query V1GetDiagram($diagramId: String!) {
    v1GetDiagram(diagramId: $diagramId) {
      diagramId
      organizationId
      folderId
      teamId
      componentFlowDiagram
      componentFlowDiagramName
      previewImageFileId
      createdBy
      updatedBy
      createdAt
      updatedAt
      deletedAt
      deletedBy
    }
  }
`)

export const CREATE_DIAGRAM_MUTATION = graphql(`
  mutation V1CreateDiagram($input: CreateDiagramInput!) {
    v1CreateDiagram(input: $input) {
      diagramId
      organizationId
      componentFlowDiagram
      componentFlowDiagramName
      previewImageFileId
      createdBy
      updatedBy
      createdAt
      updatedAt
      deletedAt
      deletedBy
    }
  }
`)

export const DELETE_DIAGRAM_MUTATION = graphql(`
  mutation V1DeleteDiagram($diagramId: String!) {
    v1DeleteDiagram(diagramId: $diagramId)
  }
`)

export const UPDATE_DIAGRAM_MUTATION = graphql(`
  mutation V1UpdateDiagram($diagramId: String!, $input: UpdateDiagramInput!) {
    v1UpdateDiagram(diagramId: $diagramId, input: $input) {
      diagramId
      organizationId
      componentFlowDiagram
      componentFlowDiagramName
      previewImageFileId
      createdBy
      updatedBy
      createdAt
      updatedAt
      deletedAt
      deletedBy
    }
  }
`)

export const UPLOAD_DIAGRAM_PREVIEW_MUTATION = graphql(`
  mutation V1UpdateDiagramThumbnail(
    $diagramId: String!
    $input: UpdateDiagramThumbnailInput!
  ) {
    v1UpdateDiagramThumbnail(diagramId: $diagramId, input: $input) {
      fileId
      fileUploadURL
    }
  }
`)
