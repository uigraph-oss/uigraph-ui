import { graphql } from '@/api'

export const DIAGRAM_VERSIONS = graphql(`
  query DiagramVersions($orgId: ID!, $diagramId: ID!) {
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

export const DIAGRAM_VERSION_CONTENT = graphql(`
  query DiagramVersionContent($orgId: ID!, $diagramId: ID!, $versionId: ID!) {
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

export const CREATE_DIAGRAM_VERSION = graphql(`
  mutation CreateDiagramVersion($orgId: ID!, $diagramId: ID!, $label: String) {
    createDiagramVersion(orgId: $orgId, diagramId: $diagramId, label: $label) {
      id
      versionNumber
    }
  }
`)

export const RESTORE_DIAGRAM_VERSION = graphql(`
  mutation RestoreDiagramVersion(
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
