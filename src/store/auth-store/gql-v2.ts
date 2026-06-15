import { graphql } from '@/api-v2'

export const GET_ME_AND_ORG_V2 = graphql(`
  query MeAndOrg {
    me {
      userId
      email
      name
      login
      role
      authProvider
    }
    myOrgs {
      id
      name
      slug
      membership {
        role
        joinedAt
      }
    }
  }
`)
