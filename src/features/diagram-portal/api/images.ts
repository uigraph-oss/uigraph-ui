import { graphql } from '@/api'

export const DIAGRAM_IMAGES = graphql(`
  query DiagramImagesV2($orgId: ID!, $diagramId: ID!) {
    diagramImages(orgId: $orgId, diagramId: $diagramId) {
      diagramImageId
      diagramId
      assetId
      imageUrl
      fileName
      order
      createdAt
    }
  }
`)

export const CREATE_DIAGRAM_IMAGE = graphql(`
  mutation CreateDiagramImageV2(
    $orgId: ID!
    $diagramId: ID!
    $input: CreateDiagramImageInput!
  ) {
    createDiagramImage(orgId: $orgId, diagramId: $diagramId, input: $input) {
      diagramImageId
      assetId
      imageUrl
      fileName
      order
    }
  }
`)
