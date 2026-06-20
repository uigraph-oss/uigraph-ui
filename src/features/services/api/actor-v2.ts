import { graphql } from '@/api-v2'

export const ACTOR_V2 = graphql(`
  query ActorV2($orgId: ID!, $id: ID!) {
    actor(orgId: $orgId, id: $id) {
      id
      name
      avatarUrl
    }
  }
`)
