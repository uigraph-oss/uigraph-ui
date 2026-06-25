import { graphql } from '@/api'

export const FOCAL_POINT_META = graphql(`
  query FocalPointMeta(
    $orgId: ID!
    $mapId: ID!
    $frameId: ID!
    $focalPointId: ID!
  ) {
    focalPointMeta(
      orgId: $orgId
      mapId: $mapId
      frameId: $frameId
      focalPointId: $focalPointId
    ) {
      id
      focalPointId
      orgId
      frameId
      componentId
      componentLinkDiagramId
      componentLinkApiEndpointId
      componentLinkTestPackId
      componentLinkServiceDocId
      createdBy
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
      createdAt
      updatedAt
    }
  }
`)

export const FOCAL_POINT_META_BY_LINK = graphql(`
  query FocalPointMetaByLink($orgId: ID!, $linkId: ID!) {
    focalPointMetaByLink(orgId: $orgId, linkId: $linkId) {
      id
      focalPointId
      orgId
      frameId
      componentId
      componentLinkDiagramId
      componentLinkApiEndpointId
      componentLinkTestPackId
      componentLinkServiceDocId
      createdBy
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
      createdAt
      updatedAt
    }
  }
`)

export const CREATE_FOCAL_POINT_META = graphql(`
  mutation CreateFocalPointMeta(
    $orgId: ID!
    $mapId: ID!
    $frameId: ID!
    $focalPointId: ID!
    $input: CreateFocalPointMetaInput!
  ) {
    createFocalPointMeta(
      orgId: $orgId
      mapId: $mapId
      frameId: $frameId
      focalPointId: $focalPointId
      input: $input
    ) {
      id
    }
  }
`)

export const UPDATE_FOCAL_POINT_META = graphql(`
  mutation UpdateFocalPointMeta(
    $orgId: ID!
    $mapId: ID!
    $frameId: ID!
    $focalPointId: ID!
    $id: ID!
    $input: UpdateFocalPointMetaInput!
  ) {
    updateFocalPointMeta(
      orgId: $orgId
      mapId: $mapId
      frameId: $frameId
      focalPointId: $focalPointId
      id: $id
      input: $input
    ) {
      id
    }
  }
`)

export const DELETE_FOCAL_POINT_META = graphql(`
  mutation DeleteFocalPointMeta(
    $orgId: ID!
    $mapId: ID!
    $frameId: ID!
    $focalPointId: ID!
    $id: ID!
  ) {
    deleteFocalPointMeta(
      orgId: $orgId
      mapId: $mapId
      frameId: $frameId
      focalPointId: $focalPointId
      id: $id
    )
  }
`)
