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
