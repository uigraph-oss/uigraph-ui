import { graphql } from '@/api-v2'

export const DIAGRAM_IMAGES_V2 = graphql(`
  query DiagramImagesV2($orgId: ID!, $diagramId: ID!) {
    diagramImages(orgId: $orgId, diagramId: $diagramId) {
      diagramImageId
      diagramId
      fileId
      fileURL
      fileName
      order
      createdAt
    }
  }
`)

export const CREATE_DIAGRAM_IMAGE_V2 = graphql(`
  mutation CreateDiagramImageV2(
    $orgId: ID!
    $diagramId: ID!
    $input: CreateDiagramImageInput!
  ) {
    createDiagramImage(orgId: $orgId, diagramId: $diagramId, input: $input) {
      diagramImageId
      fileId
      fileUploadURL
    }
  }
`)
