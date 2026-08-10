import { graphql } from '@/api'
import { apolloClientGQL } from '@/api/client'
import { putToPresigned } from '@/features/uploads/api/uploads'

export type AuthProvider = {
  id: string
  slug: string
  orgId: string
  kind: string
  type: string
  displayName: string
  iconUrl: string
  enabled: boolean
  allowSignUp: boolean
  allowedDomains: string
  defaultRole: string
  clientId: string
  clientSecret: string
  authUrl: string
  tokenUrl: string
  userinfoUrl: string
  apiUrl: string
  scopes: string
  emailClaim: string
  nameClaim: string
  subClaim: string
  groupsClaim: string
  idpMetadataUrl: string
  idpMetadataXml: string
  idpEntityId: string
  idpSsoUrl: string
  idpCert: string
  spEntityId: string
  spCert: string
  spKey: string
  signRequests: boolean
  nameIdFormat: string
  emailAttribute: string
  nameAttribute: string
  groupsAttribute: string
}

export type AuthRoleMapping = {
  id: string
  providerId: string
  priority: number
  attributeKey: string
  operator: string
  attributeValue: string
  role: string
}

export type OrgDomain = {
  id: string
  orgId: string
  domain: string
}

export type MappingOperator = {
  name: string
  takesValue: boolean
}

export const AUTH_PROVIDERS = graphql(`
  query AuthProviders($orgId: ID!) {
    authProviders(orgId: $orgId) {
      id
      slug
      orgId
      kind
      type
      displayName
      iconUrl
      enabled
      allowSignUp
      allowedDomains
      defaultRole
      clientId
      clientSecret
      authUrl
      tokenUrl
      userinfoUrl
      apiUrl
      scopes
      emailClaim
      nameClaim
      subClaim
      groupsClaim
      idpMetadataUrl
      idpMetadataXml
      idpEntityId
      idpSsoUrl
      idpCert
      spEntityId
      spCert
      spKey
      signRequests
      nameIdFormat
      emailAttribute
      nameAttribute
      groupsAttribute
    }
  }
`)

export const AUTH_PROVIDER = graphql(`
  query AuthProvider($orgId: ID!, $slug: String!) {
    authProvider(orgId: $orgId, slug: $slug) {
      id
      slug
      orgId
      kind
      type
      displayName
      iconUrl
      enabled
      allowSignUp
      allowedDomains
      defaultRole
      clientId
      clientSecret
      authUrl
      tokenUrl
      userinfoUrl
      apiUrl
      scopes
      emailClaim
      nameClaim
      subClaim
      groupsClaim
      idpMetadataUrl
      idpMetadataXml
      idpEntityId
      idpSsoUrl
      idpCert
      spEntityId
      spCert
      spKey
      signRequests
      nameIdFormat
      emailAttribute
      nameAttribute
      groupsAttribute
    }
  }
`)

export const AUTH_PROVIDER_SAML_METADATA = graphql(`
  query AuthProviderSamlMetadata($orgId: ID!, $slug: String!) {
    authProviderSamlMetadata(orgId: $orgId, slug: $slug) {
      entityId
      acsUrl
      metadataUrl
      metadata
    }
  }
`)

export const AUTH_ROLE_MAPPINGS = graphql(`
  query AuthRoleMappings($orgId: ID!, $providerSlug: String!) {
    authRoleMappings(orgId: $orgId, providerSlug: $providerSlug) {
      id
      providerId
      priority
      attributeKey
      operator
      attributeValue
      role
    }
  }
`)

export const ORG_DOMAINS = graphql(`
  query OrgDomains($orgId: ID!) {
    orgDomains(orgId: $orgId) {
      id
      orgId
      domain
    }
  }
`)

export const MAPPING_OPERATORS = graphql(`
  query MappingOperators {
    mappingOperators {
      name
      takesValue
    }
  }
`)

export const CREATE_AUTH_PROVIDER = graphql(`
  mutation CreateAuthProvider($orgId: ID!, $input: AuthProviderInput!) {
    createAuthProvider(orgId: $orgId, input: $input) {
      id
    }
  }
`)

export const UPDATE_AUTH_PROVIDER = graphql(`
  mutation UpdateAuthProvider(
    $orgId: ID!
    $slug: String!
    $input: AuthProviderInput!
  ) {
    updateAuthProvider(orgId: $orgId, slug: $slug, input: $input) {
      id
    }
  }
`)

export const DELETE_AUTH_PROVIDER = graphql(`
  mutation DeleteAuthProvider($orgId: ID!, $slug: String!) {
    deleteAuthProvider(orgId: $orgId, slug: $slug)
  }
`)

export const PREPARE_AUTH_PROVIDER_ICON_UPLOAD = graphql(`
  mutation PrepareAuthProviderIconUpload($orgId: ID!, $slug: String!) {
    prepareAuthProviderIconUpload(orgId: $orgId, slug: $slug) {
      assetId
      uploadUrl
    }
  }
`)

export const SET_AUTH_PROVIDER_ICON = graphql(`
  mutation SetAuthProviderIcon($orgId: ID!, $slug: String!) {
    setAuthProviderIcon(orgId: $orgId, slug: $slug)
  }
`)

export const REMOVE_AUTH_PROVIDER_ICON = graphql(`
  mutation RemoveAuthProviderIcon($orgId: ID!, $slug: String!) {
    removeAuthProviderIcon(orgId: $orgId, slug: $slug)
  }
`)

export const CREATE_AUTH_ROLE_MAPPING = graphql(`
  mutation CreateAuthRoleMapping(
    $orgId: ID!
    $providerSlug: String!
    $input: AuthRoleMappingInput!
  ) {
    createAuthRoleMapping(
      orgId: $orgId
      providerSlug: $providerSlug
      input: $input
    ) {
      id
    }
  }
`)

export const UPDATE_AUTH_ROLE_MAPPING = graphql(`
  mutation UpdateAuthRoleMapping(
    $orgId: ID!
    $providerSlug: String!
    $mappingId: ID!
    $input: AuthRoleMappingInput!
  ) {
    updateAuthRoleMapping(
      orgId: $orgId
      providerSlug: $providerSlug
      mappingId: $mappingId
      input: $input
    ) {
      id
    }
  }
`)

export const DELETE_AUTH_ROLE_MAPPING = graphql(`
  mutation DeleteAuthRoleMapping(
    $orgId: ID!
    $providerSlug: String!
    $mappingId: ID!
  ) {
    deleteAuthRoleMapping(
      orgId: $orgId
      providerSlug: $providerSlug
      mappingId: $mappingId
    )
  }
`)

export const CREATE_ORG_DOMAIN = graphql(`
  mutation CreateOrgDomain($orgId: ID!, $domain: String!) {
    createOrgDomain(orgId: $orgId, domain: $domain) {
      id
    }
  }
`)

export const DELETE_ORG_DOMAIN = graphql(`
  mutation DeleteOrgDomain($orgId: ID!, $domainId: ID!) {
    deleteOrgDomain(orgId: $orgId, domainId: $domainId)
  }
`)

export async function setAuthProviderIcon(
  orgId: string,
  slug: string,
  file: File
) {
  await putToPresigned(async () => {
    const { data } = await apolloClientGQL.mutate({
      mutation: PREPARE_AUTH_PROVIDER_ICON_UPLOAD,
      variables: { orgId, slug },
    })
    return {
      assetId: data?.prepareAuthProviderIconUpload?.assetId,
      uploadUrl: data?.prepareAuthProviderIconUpload?.uploadUrl,
    }
  }, file)

  await apolloClientGQL.mutate({
    mutation: SET_AUTH_PROVIDER_ICON,
    variables: { orgId, slug },
  })
}

export async function removeAuthProviderIcon(orgId: string, slug: string) {
  await apolloClientGQL.mutate({
    mutation: REMOVE_AUTH_PROVIDER_ICON,
    variables: { orgId, slug },
  })
}
