import { graphql } from '@/api-v2'

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
        previewContentHash
        createdAt
        updatedAt
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
    previewContentHash?: string | null
    createdAt?: string | null
    updatedAt?: string | null
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
          previewContentHash: d.previewContentHash,
          createdAt: d.createdAt,
          updatedAt: d.updatedAt,
        }
      : null,
  }
}
