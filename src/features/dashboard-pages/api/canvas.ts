import { graphql } from '@/api'

export const CANVAS = graphql(`
  query CanvasV2($orgId: ID!, $mapId: ID!) {
    canvas(orgId: $orgId, mapId: $mapId) {
      mapId
      orgId
      zoom
      navigationX
      navigationY
      framePositions
      updatedAt
    }
  }
`)

export const UPSERT_CANVAS = graphql(`
  mutation UpsertCanvasV2(
    $orgId: ID!
    $mapId: ID!
    $input: UpsertCanvasInput!
  ) {
    upsertCanvas(orgId: $orgId, mapId: $mapId, input: $input) {
      mapId
      orgId
      zoom
      navigationX
      navigationY
      framePositions
      updatedAt
    }
  }
`)
