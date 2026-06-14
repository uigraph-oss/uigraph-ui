import { graphql } from '@/api-v2'

export type FocalPointMetaV2 = {
  id: string
  focalPointId?: string | null
  orgId?: string | null
  frameId?: string | null
  componentId?: string | null
  componentLinkId?: string | null
  componentImages?: string | null
  componentFlowDiagram?: string | null
  componentModalFields?: string | null
}

export const FOCAL_POINT_META_V2 = graphql(`
  query FocalPointMetaV2(
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
      componentLinkId
      componentImages
      componentFlowDiagram
      componentModalFields
      createdAt
      updatedAt
    }
  }
`)

export const CREATE_FOCAL_POINT_META_V2 = graphql(`
  mutation CreateFocalPointMetaV2(
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

export const UPDATE_FOCAL_POINT_META_V2 = graphql(`
  mutation UpdateFocalPointMetaV2(
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

export const DELETE_FOCAL_POINT_META_V2 = graphql(`
  mutation DeleteFocalPointMetaV2(
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
