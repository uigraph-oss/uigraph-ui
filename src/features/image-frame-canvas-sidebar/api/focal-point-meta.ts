import { graphql } from '@/api'

export const GET_FOCAL_POINT_META = graphql(`
  query V1GetFocalPointMeta($focalPointId: String!) {
    v1GetFocalPointMeta(focalPointId: $focalPointId) {
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

export const GET_FOCAL_POINT_META_BY_COMPONENT_META_ID = graphql(`
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

export const CREATE_FOCAL_POINT_META = graphql(`
  mutation V1CreateFocalPointMeta($input: CreateFocalPointMetaInput!) {
    v1CreateFocalPointMeta(input: $input) {
      focalPointMetaId
      organizationId
      pageId
      focalPointId
      componentId
      componentImages
      componentFlowDiagram
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
        options
        order
      }
    }
  }
`)

export const UPDATE_FOCAL_POINT_META = graphql(`
  mutation V1UpdateFocalPointMeta(
    $focalPointMetaId: String!
    $input: UpdateFocalPointMetaInput!
  ) {
    v1UpdateFocalPointMeta(focalPointMetaId: $focalPointMetaId, input: $input) {
      focalPointMetaId
      organizationId
      pageId
      focalPointId
      componentId
      componentImages
      componentFlowDiagram
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
        options
        order
      }
    }
  }
`)

export const DELETE_FOCAL_POINT_META = graphql(`
  mutation V1DeleteFocalPointMeta($focalPointMetaId: String!) {
    v1DeleteFocalPointMeta(focalPointMetaId: $focalPointMetaId) {
      focalPointMetaId
      organizationId
      pageId
      focalPointId
      componentId
      componentImages
      componentFlowDiagram
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
        options
        order
      }
    }
  }
`)
