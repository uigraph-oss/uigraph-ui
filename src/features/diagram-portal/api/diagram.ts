import { graphql } from '@/api'

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
