import { graphql } from '@/api'

export const CANVAS = graphql(`
  query Canvas($orgId: ID!, $mapId: ID!) {
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
  mutation UpsertCanvas($orgId: ID!, $mapId: ID!, $input: UpsertCanvasInput!) {
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
