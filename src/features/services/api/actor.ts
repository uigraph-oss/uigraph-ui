import { graphql } from '@/api'

export const ACTOR = graphql(`
  query Actor($orgId: ID!, $id: ID!) {
    actor(orgId: $orgId, id: $id) {
      id
      name
      avatarUrl
    }
  }
`)
