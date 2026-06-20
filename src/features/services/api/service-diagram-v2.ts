import { graphql } from '@/api'

export const SERVICE_DIAGRAMS_V2 = graphql(`
  query ServiceDiagramsV2($orgId: ID!, $serviceId: ID!) {
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
        createdAt
        updatedAt
        createdByActor {
          id
          name
          avatarUrl
        }
        updatedByActor {
          id
          name
          avatarUrl
        }
      }
    }
  }
`)

export const CREATE_SERVICE_DIAGRAM_V2 = graphql(`
  mutation CreateServiceDiagramV2(
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

export const DELETE_SERVICE_DIAGRAM_V2 = graphql(`
  mutation DeleteServiceDiagramV2(
    $orgId: ID!
    $serviceId: ID!
    $diagramId: ID!
  ) {
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
    createdAt?: string | null
    updatedAt?: string | null
    createdByActor?: {
      id?: string | null
      name?: string | null
      avatarUrl?: string | null
    } | null
    updatedByActor?: {
      id?: string | null
      name?: string | null
      avatarUrl?: string | null
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
          createdAt: d.createdAt,
          updatedAt: d.updatedAt,
          createdByActor: d.createdByActor,
          updatedByActor: d.updatedByActor,
        }
      : null,
  }
}
