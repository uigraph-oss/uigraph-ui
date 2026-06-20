import { v1Graphql } from '@/api'

export const GET_COMPONENT_META = v1Graphql(`
  query V1GetComponentMeta($componentMetaId: String!) {
    v1GetComponentMeta(componentMetaId: $componentMetaId) {
      componentMetaId
      organizationId
      componentId
      componentFlowDiagram
      componentFlowDiagramName
      createdBy
      updatedBy
      createdAt
      updatedAt
      deletedAt
      deletedBy
      componentModalFields {
        componentFieldId
        label
        type
        required
        isReadonly
        data
        options
        order
      }
    }
  }
`)
