import { graphql } from '@/api'

export const ACTOR = graphql(`
  query ActorV2($orgId: ID!, $id: ID!) {
    actor(orgId: $orgId, id: $id) {
      id
      name
      avatarUrl
    }
  }
`)
