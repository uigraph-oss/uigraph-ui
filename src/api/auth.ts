import { graphql } from '@/api'

export const GET_MY_ACCOUNT = graphql(`
  query GetMyAccount {
    GetMyAccount {
      accountId
      accountInfo {
        firstName
        lastName
        image
        imageUrl
        email
      }
    }
  }
`)

export const VERIFY_ORG_DOMAIN = graphql(`
  query VerifyOrgDomain($domainSlug: String) {
    VerifyOrgDomain(domainSlug: $domainSlug)
  }
`)

export const GET_ORGANIZATIONS_BY_ROLE = graphql(`
  query GetOrganizationsByRole($role: String) {
    GetOrganizations(role: $role) {
      name
      organizationId
      logoImgId
      owner
      domain
      domainSlug
      isActive
      allowDomainJoin
    }
  }
`)

export const GET_ORGANIZATION_BY_SUBDOMAIN = graphql(`
  query GetOrganizationBySubdomain($subdomain: String!) {
    GetOrganizationBySubdomain(subdomain: $subdomain) {
      name
      organizationId
      logoImgId
      owner
      domain
      domainSlug
      isActive
      allowDomainJoin
    }
  }
`)

export const GET_INITIAL_ORGANIZATIONS = graphql(`
  query GetInitialOrganizationsByRoleAndUser($role: String) {
    GetMyAccount {
      accountId
      accountInfo {
        firstName
        lastName
        email
        image
        imageUrl
        dateOfBirth
      }
    }

    GetOrganizations(role: $role) {
      name
      organizationId
      logoImgId
      owner
      domain
      domainSlug
      isActive
      allowDomainJoin
    }
  }
`)
