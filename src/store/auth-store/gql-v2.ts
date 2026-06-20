import { graphql } from '@/api-v2'

export const GET_ME_AND_ORG_V2 = graphql(`
  query MeAndOrg {
    me {
      orgId
      email
      name
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
