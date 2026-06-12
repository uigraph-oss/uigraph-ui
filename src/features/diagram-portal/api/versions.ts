import { graphql } from '@/api'

export const GET_DIAGRAM_VERSIONS_QUERY = graphql(`
  query V1GetDiagramVersions($diagramId: String!) {
    v1GetDiagramVersions(diagramId: $diagramId) {
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

export const GET_DIAGRAM_VERSION_QUERY = graphql(`
  query V1GetDiagramVersion($diagramId: String!, $versionNumber: Int!) {
    v1GetDiagramVersion(diagramId: $diagramId, versionNumber: $versionNumber) {
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

export const RESTORE_DIAGRAM_VERSION_MUTATION = graphql(`
  mutation V1RestoreDiagramVersion($diagramId: String!, $versionNumber: Int!) {
    v1RestoreDiagramVersion(
      diagramId: $diagramId
      versionNumber: $versionNumber
    ) {
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
`)
