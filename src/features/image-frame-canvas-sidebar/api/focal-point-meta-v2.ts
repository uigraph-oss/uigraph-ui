import { GT } from '@/api'
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
  updatedAt?: string | null
}

export type PointMeta = {
  focalPointMetaId: string
  focalPointId?: string | null
  pageId?: string | null
  componentId?: string | null
  componentLinkId?: string | null
  componentFlowDiagram?: string | null
  componentImages: string[]
  componentModalFields: GT.ComponentField[]
  updatedAt?: string | null
}

function parseJsonArray<T>(raw?: string | null): T[] {
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as T[]) : []
  } catch {
    return []
  }
}

export function toPointMeta(m: FocalPointMetaV2): PointMeta {
  return {
    focalPointMetaId: m.id,
    focalPointId: m.focalPointId,
    pageId: m.frameId,
    componentId: m.componentId,
    componentLinkId: m.componentLinkId,
    componentFlowDiagram: m.componentFlowDiagram,
    componentImages: parseJsonArray<string>(m.componentImages),
    componentModalFields: parseJsonArray<GT.ComponentField>(
      m.componentModalFields
    ),
    updatedAt: m.updatedAt,
  }
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
