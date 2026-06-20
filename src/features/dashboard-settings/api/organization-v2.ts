import { graphql } from '@/api-v2'

export const ORG_V2 = graphql(`
  query OrgV2($id: ID!) {
    org(id: $id) {
      id
      name
      slug
    }
  }
`)

export const UPDATE_ORG_V2 = graphql(`
  mutation UpdateOrgV2($id: ID!, $input: UpdateOrgInput!) {
    updateOrg(id: $id, input: $input) {
      id
      name
      slug
    }
  }
`)
