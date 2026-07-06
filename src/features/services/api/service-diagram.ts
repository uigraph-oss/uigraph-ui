import { graphql } from '@/api'

export const SERVICE_DIAGRAMS = graphql(`
  query ServiceDiagrams($orgId: ID!, $serviceId: ID!) {
    serviceDiagrams(orgId: $orgId, serviceId: $serviceId) {
      serviceId
      diagramId
      orgId
      createdBy
      updatedBy
      createdAt
      updatedAt
      diagram {
        id
        orgId
        name
        previewAssetId
        previewImageUrl
        previewContentHash
        createdByCommitHash
        updatedByCommitHash
        createdAt
        updatedAt
        createdByActor {
          id
          name
          avatarUrl
          type
          email
        }
        updatedByActor {
          id
          name
          avatarUrl
          type
          email
        }
      }
    }
  }
`)

export const CREATE_SERVICE_DIAGRAM = graphql(`
  mutation CreateServiceDiagram(
    $orgId: ID!
    $serviceId: ID!
    $input: CreateServiceDiagramInput!
  ) {
    createServiceDiagram(orgId: $orgId, serviceId: $serviceId, input: $input) {
      serviceId
      diagramId
    }
  }
`)

export const DELETE_SERVICE_DIAGRAM = graphql(`
  mutation DeleteServiceDiagram($orgId: ID!, $serviceId: ID!, $diagramId: ID!) {
    deleteServiceDiagram(
      orgId: $orgId
      serviceId: $serviceId
      diagramId: $diagramId
    )
  }
`)

export function serviceDiagramToLegacyWithMeta(item: {
  serviceId: string
  diagramId: string
  createdBy: string
  updatedBy?: string | null
  createdAt: string
  updatedAt: string
  diagram?: {
    id: string
    orgId: string
    name?: string | null
    previewAssetId?: string | null
    previewImageUrl?: string | null
    previewContentHash?: string | null
    createdByCommitHash?: string | null
    updatedByCommitHash?: string | null
    createdAt?: string | null
    updatedAt?: string | null
    createdByActor?: {
      id?: string | null
      name?: string | null
      avatarUrl?: string | null
      type?: string | null
      email?: string | null
    } | null
    updatedByActor?: {
      id?: string | null
      name?: string | null
      avatarUrl?: string | null
      type?: string | null
      email?: string | null
    } | null
  } | null
}) {
  const d = item.diagram
  return {
    serviceDiagram: {
      serviceDiagramId: `${item.serviceId}:${item.diagramId}`,
      serviceId: item.serviceId,
      serviceDiagramDiagramId: item.diagramId,
      createdBy: item.createdBy,
      updatedBy: item.updatedBy,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    },
    diagram: d
      ? {
          diagramId: d.id,
          organizationId: d.orgId,
          componentFlowDiagramName: d.name,
          previewImageFileId: d.previewAssetId,
          previewImageUrl: d.previewImageUrl,
          previewContentHash: d.previewContentHash,
          createdByCommitHash: d.createdByCommitHash,
          updatedByCommitHash: d.updatedByCommitHash,
          createdAt: d.createdAt,
          updatedAt: d.updatedAt,
          createdByActor: d.createdByActor,
          updatedByActor: d.updatedByActor,
        }
      : null,
  }
}
