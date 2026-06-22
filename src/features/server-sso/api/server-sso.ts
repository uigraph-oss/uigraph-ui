import { graphql } from '@/api'

export type OAuthProvider = {
  id: string
  providerName: string
  type: string
  displayName: string
  clientId: string
  clientSecret: string
  authUrl: string
  tokenUrl: string
  userinfoUrl: string
  apiUrl: string
  scopes: string
  allowedDomains: string
  allowSignUp: boolean
  emailClaim: string
  nameClaim: string
  subClaim: string
}

export type UpsertOAuthInput = {
  type: string
  displayName: string
  clientId: string
  clientSecret: string
  authUrl: string
  tokenUrl: string
  userinfoUrl: string
  scopes: string
  allowedDomains: string
  allowSignUp: boolean
  emailClaim: string
  nameClaim: string
  subClaim: string
}

export type ProviderStatus = 'configured' | 'not-configured'

export const OAUTH_PROVIDERS = graphql(`
  query OAuthProviders {
    oauthProviders {
      id
      providerName
      type
      displayName
      clientId
      clientSecret
      authUrl
      tokenUrl
      userinfoUrl
      apiUrl
      scopes
      allowedDomains
      allowSignUp
      emailClaim
      nameClaim
      subClaim
    }
  }
`)

export const UPSERT_OAUTH_PROVIDER = graphql(`
  mutation UpsertOAuthProvider($provider: String!, $input: UpsertOAuthInput!) {
    upsertOAuthProvider(provider: $provider, input: $input)
  }
`)

export const DELETE_OAUTH_PROVIDER = graphql(`
  mutation DeleteOAuthProvider($provider: String!) {
    deleteOAuthProvider(provider: $provider)
  }
`)

export const LDAP_STATUS = graphql(`
  query LdapStatus {
    ldap {
      id
    }
  }
`)

export const SAML_STATUS = graphql(`
  query SamlStatus {
    saml {
      id
    }
  }
`)

export async function getScimStatus(): Promise<ProviderStatus> {
  const res = await fetch('/api/v1/sso/scim', { credentials: 'include' })
  if (res.ok) {
    return 'configured'
  }
  if (res.status === 404) {
    return 'not-configured'
  }
  throw new Error(`Request failed (${res.status})`)
}
