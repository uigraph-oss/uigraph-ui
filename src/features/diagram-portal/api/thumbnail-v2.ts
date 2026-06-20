import { graphql } from '@/api-v2'

export const PREPARE_DIAGRAM_THUMBNAIL_UPLOAD = graphql(`
  mutation PrepareDiagramThumbnailUpload($orgId: ID!, $diagramId: ID!) {
    prepareDiagramThumbnailUpload(orgId: $orgId, diagramId: $diagramId) {
      uploadUrl
      assetId
    }
  }
`)

export const CONFIRM_DIAGRAM_THUMBNAIL_UPLOAD = graphql(`
  mutation ConfirmDiagramThumbnailUpload(
    $orgId: ID!
    $diagramId: ID!
    $contentHash: String!
  ) {
    confirmDiagramThumbnailUpload(
      orgId: $orgId
      diagramId: $diagramId
      contentHash: $contentHash
    )
  }
`)
