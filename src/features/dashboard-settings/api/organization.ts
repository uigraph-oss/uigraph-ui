import { graphql } from '@/api'

export const GET_ORGANIZATION = graphql(`
  query GetOrganization($organizationId: String!) {
    GetOrganizationByID(organizationId: $organizationId) {
      name
      organizationId
      logoImgId
      logoImgUrl
      owner
      domain
      domainSlug
      isActive
      allowDomainJoin
      address {
        addressLine1
        addressLine2
        country
        postalCode
        city
        state
        taxId
      }
    }
  }
`)

export const UPDATE_ORGANIZATION = graphql(`
  mutation UpdateOrganization(
    $organizationId: String!
    $input: UpdateOrganizationInput!
  ) {
    UpdateOrganization(organizationId: $organizationId, input: $input) {
      name
      organizationId
      logoImgId
      logoImgUrl
      owner
      domain
      domainSlug
      isActive
      allowDomainJoin
      address {
        addressLine1
        addressLine2
        country
        postalCode
        city
        state
        taxId
      }
    }
  }
`)
