import { graphql } from '@/api-v2'

export const DIAGRAM_IMAGES_V2 = graphql(`
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
