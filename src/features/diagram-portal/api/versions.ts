import { graphql } from '@/api'

export const CREATE_DIAGRAM_VERSION_MUTATION = graphql(`
  mutation V1CreateDiagramVersion($diagramId: String!) {
    v1CreateDiagramVersion(diagramId: $diagramId) {
      versionId
      diagramId
      versionNumber
      label
      createdBy
      createdAt
      isAutoVersion
      diagram {
        diagramId
        organizationId
        folderId
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
  }
`)
