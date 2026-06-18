import { graphql } from '@/api'

export const GET_DIAGRAMS_BY_ORG_ID = graphql(`
  query DiagramPortalGetDiagramsByOrgId(
    $organizationId: String!
    $folderId: String
  ) {
    v1GetDiagramsByOrgId(organizationId: $organizationId, folderId: $folderId) {
      diagramId
      folderId
      organizationId
      componentFlowDiagram
      componentFlowDiagramName
      previewImageFileId
      createdBy
      updatedBy
      createdByProfileImgUrl
      updatedByProfileImgUrl
      createdAt
      updatedAt
      deletedAt
      deletedBy
    }
  }
`)
