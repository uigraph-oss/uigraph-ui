import { graphql } from '@/api'

export const GET_ME_AND_ORG_V2 = graphql(`
  query MeAndOrg {
    me {
      userId
      email
      name
      avatarUrl
      isServerAdmin
    }
    myOrgs {
      id
      name
      slug
      role
      active
    }
  }
`)
