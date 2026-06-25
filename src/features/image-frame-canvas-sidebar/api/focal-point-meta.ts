import { graphql, GT } from '@/api'
import { ComponentLink, parseComponentLink } from '../schemas/component-link'

export type ComponentFieldInput = GT.ComponentModalFieldInput

export type PointMeta = {
  focalPointMetaId: string
  focalPointId?: string | null
  pageId?: string | null
  componentId?: string | null
  componentLink?: ComponentLink | null
  componentModalFields: GT.ComponentModalField[]
  updatedAt?: string | null
}

type FocalPointMetaResult = {
  id: string
  focalPointId?: string | null
  frameId?: string | null
  componentId?: string | null
  componentLink?: unknown
  componentModalFields: GT.ComponentModalField[]
  updatedAt?: string | null
}

export function toPointMeta(m: FocalPointMetaResult): PointMeta {
  return {
    focalPointMetaId: m.id,
    focalPointId: m.focalPointId,
    pageId: m.frameId,
    componentId: m.componentId,
    componentLink: parseComponentLink(m.componentId, m.componentLink),
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
      componentLink
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
  query FocalPointMetaByLink(
    $orgId: ID!
    $linkKey: String!
    $linkValue: String!
  ) {
    focalPointMetaByLink(
      orgId: $orgId
      linkKey: $linkKey
      linkValue: $linkValue
    ) {
      id
      focalPointId
      orgId
      frameId
      componentId
      componentLink
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
