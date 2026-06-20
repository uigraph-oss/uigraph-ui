import { graphql } from '@/api'

export const GET_ME_AND_ORG = graphql(`
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
      role
      logoUrl
    }
  }
`)
