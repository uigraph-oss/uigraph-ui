import { graphql } from '@/api'

export const GET_DIAGRAM_IMAGES_QUERY = graphql(`
  query V1GetDiagramImages($diagramId: String!) {
    v1GetDiagramImages(diagramId: $diagramId) {
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

export const CREATE_DIAGRAM_IMAGE_MUTATION = graphql(`
  mutation V1CreateDiagramImage(
    $diagramId: String!
    $input: CreateDiagramImageInput!
  ) {
    v1CreateDiagramImage(diagramId: $diagramId, input: $input) {
      diagramImageId
      fileId
    }
  }
`)
