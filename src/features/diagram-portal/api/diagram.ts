import { graphql } from '@/api'

export const DIAGRAM = graphql(`
  query DiagramV2($orgId: ID!, $id: ID!) {
    diagram(orgId: $orgId, id: $id) {
      id
      orgId
      folderId
      teamId
      name
      previewAssetId
      previewImageUrl
      previewContentHash
      createdAt
      updatedAt
    }
  }
`)

export const DIAGRAM_CONTENT = graphql(`
  query DiagramContentV2($orgId: ID!, $id: ID!) {
    diagramContent(orgId: $orgId, id: $id) {
      diagramId
      content
    }
  }
`)

export const UPDATE_DIAGRAM = graphql(`
  mutation UpdateDiagramV2($orgId: ID!, $id: ID!, $input: UpdateDiagramInput!) {
    updateDiagram(orgId: $orgId, id: $id, input: $input) {
      id
      updatedAt
    }
  }
`)
