import { v1Graphql } from '@/api'

export const GET_FOCAL_POINT_META_BY_COMPONENT_META_ID = v1Graphql(`
  query V1GetFocalPointMetaByComponentMetaId($componentMetaId: String!) {
    v1GetFocalPointMeta(componentMetaId: $componentMetaId) {
      focalPointId
      focalPointMetaId
      componentLinkId
      organizationId
      pageId

      createdBy
      updatedBy
      deletedBy

      createdAt
      updatedAt
      deletedAt

      componentId
      componentImages
      componentFlowDiagram
      componentModalFields {
        componentFieldId
        label
        type
        required
        options
        order
        data
      }
    }
  }
`)
