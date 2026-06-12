import { graphql } from '@/api'

export const GET_SERVICE_DIAGRAM_QUERY = graphql(`
  query V1GetServiceDiagram($serviceDiagramId: String, $serviceId: String) {
    v1GetServiceDiagram(
      serviceDiagramId: $serviceDiagramId
      serviceId: $serviceId
    ) {
      serviceDiagramId
      serviceId
      serviceDiagramDiagramId
      createdBy
      updatedBy
      createdAt
      updatedAt
      deletedAt
      deletedBy
    }
  }
`)

export const GET_SERVICE_DIAGRAMS_WITH_META_QUERY = graphql(`
  query V1GetServiceDiagramsWithMeta($serviceId: String!) {
    v1GetServiceDiagramsWithMeta(serviceId: $serviceId) {
      serviceDiagram {
        serviceDiagramId
        serviceId
        serviceDiagramDiagramId
        createdBy
        updatedBy
        createdAt
        updatedAt
        deletedAt
        deletedBy
      }
      diagram {
        diagramId
        organizationId
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

export const CREATE_SERVICE_DIAGRAM_MUTATION = graphql(`
  mutation V1CreateServiceDiagram($input: CreateServiceDiagramInput!) {
    v1CreateServiceDiagram(input: $input) {
      serviceDiagramId
      serviceId
      serviceDiagramDiagramId
      createdBy
      updatedBy
      createdAt
      updatedAt
      deletedAt
      deletedBy
    }
  }
`)

export const UPDATE_SERVICE_DIAGRAM_MUTATION = graphql(`
  mutation V1UpdateServiceDiagram(
    $serviceDiagramId: String!
    $input: UpdateServiceDiagramInput!
  ) {
    v1UpdateServiceDiagram(serviceDiagramId: $serviceDiagramId, input: $input) {
      serviceDiagramId
      serviceId
      serviceDiagramDiagramId
      createdBy
      updatedBy
      createdAt
      updatedAt
      deletedAt
      deletedBy
    }
  }
`)

export const DELETE_SERVICE_DIAGRAM_MUTATION = graphql(`
  mutation V1DeleteServiceDiagram($serviceDiagramId: String!) {
    v1DeleteServiceDiagram(serviceDiagramId: $serviceDiagramId)
  }
`)
