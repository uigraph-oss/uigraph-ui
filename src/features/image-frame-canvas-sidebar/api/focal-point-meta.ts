import { graphql, GT } from '@/api'

export type ComponentFieldInput = GT.ComponentModalFieldInput

export type PointMeta = {
  focalPointMetaId: string
  focalPointId?: string | null
  pageId?: string | null
  componentId?: string | null
  componentLinkId?: string | null
  componentFlowDiagram?: string | null
  componentImages: string[]
  componentModalFields: GT.ComponentModalField[]
  updatedAt?: string | null
}

type FocalPointMetaResult = {
  id: string
  focalPointId?: string | null
  frameId?: string | null
  componentId?: string | null
  componentLinkId?: string | null
  componentFlowDiagram?: string | null
  componentImages: string[]
  componentModalFields: GT.ComponentModalField[]
  updatedAt?: string | null
}

export function toPointMeta(m: FocalPointMetaResult): PointMeta {
  return {
    focalPointMetaId: m.id,
    focalPointId: m.focalPointId,
    pageId: m.frameId,
    componentId: m.componentId,
    componentLinkId: m.componentLinkId,
    componentFlowDiagram: m.componentFlowDiagram,
    componentImages: m.componentImages,
    componentModalFields: m.componentModalFields,
    updatedAt: m.updatedAt,
  }
}

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
      componentLinkId
      componentImages
      componentFlowDiagram
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

export const FOCAL_POINT_META_BY_COMPONENT_LINK = graphql(`
  query FocalPointMetaByComponentLink($orgId: ID!, $componentLinkId: ID!) {
    focalPointMetaByComponentLink(
      orgId: $orgId
      componentLinkId: $componentLinkId
    ) {
      id
      focalPointId
      orgId
      frameId
      componentId
      componentLinkId
      componentImages
      componentFlowDiagram
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
