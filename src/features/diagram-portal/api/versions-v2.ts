import { graphql } from '@/api-v2'

export const DIAGRAM_VERSIONS_V2 = graphql(`
  query DiagramVersionsV2($orgId: ID!, $diagramId: ID!) {
    diagramVersions(orgId: $orgId, diagramId: $diagramId) {
      id
      diagramId
      versionNumber
      label
      isAutoVersion
      createdBy
      createdAt
      createdByActor {
        id
        name
        avatarUrl
      }
    }
  }
`)

export const DIAGRAM_VERSION_CONTENT_V2 = graphql(`
  query DiagramVersionContentV2($orgId: ID!, $diagramId: ID!, $versionId: ID!) {
    diagramVersionContent(
      orgId: $orgId
      diagramId: $diagramId
      versionId: $versionId
    ) {
      diagramId
      content
    }
  }
`)

export const CREATE_DIAGRAM_VERSION_V2 = graphql(`
  mutation CreateDiagramVersionV2(
    $orgId: ID!
    $diagramId: ID!
    $label: String
  ) {
    createDiagramVersion(orgId: $orgId, diagramId: $diagramId, label: $label) {
      id
      versionNumber
    }
  }
`)

export const RESTORE_DIAGRAM_VERSION_V2 = graphql(`
  mutation RestoreDiagramVersionV2(
    $orgId: ID!
    $diagramId: ID!
    $versionId: ID!
  ) {
    restoreDiagramVersion(
      orgId: $orgId
      diagramId: $diagramId
      versionId: $versionId
    ) {
      id
    }
  }
`)
