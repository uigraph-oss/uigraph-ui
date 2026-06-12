import { graphql } from '@/api'

export const CREATE_PAGE_CANVAS = graphql(`
  mutation V1CreatePageCanvas($input: CreatePageCanvasInput!) {
    v1CreatePageCanvas(input: $input) {
      projectId
      organizationId
      zoom
      pageCanvasItems {
        pageId
        position {
          x
          y
        }
      }
    }
  }
`)

export const GET_PAGE_CANVAS = graphql(`
  query V1GetPageCanvas($projectId: String!, $organizationId: String!) {
    v1GetPageCanvas(projectId: $projectId, organizationId: $organizationId) {
      projectId
      organizationId
      zoom
      pageCanvasItems {
        pageId
        position {
          x
          y
        }
      }
    }
  }
`)
