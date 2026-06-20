import { graphql } from '@/api'

export const ORG = graphql(`
  query OrgV2($id: ID!) {
    org(id: $id) {
      id
      name
      slug
    }
  }
`)

export const UPDATE_ORG = graphql(`
  mutation UpdateOrgV2($id: ID!, $input: UpdateOrgInput!) {
    updateOrg(id: $id, input: $input) {
      id
      name
      slug
    }
  }
`)
