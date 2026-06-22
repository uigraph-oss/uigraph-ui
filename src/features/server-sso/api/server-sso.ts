import { graphql } from '@/api'

export type OAuthProvider = {
  id: string
  providerName: string
  type: string
  displayName: string
  iconUrl: string
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
      iconUrl
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

export async function setOAuthProviderIcon(provider: string, file: File) {
  const form = new FormData()
  form.append('file', file)
  const res = await fetch(`/api/v1/sso/oauth/${provider}/icon`, {
    method: 'PUT',
    credentials: 'include',
    body: form,
  })
  if (!res.ok) {
    throw new Error(`upload icon failed (${res.status})`)
  }
}

export async function removeOAuthProviderIcon(provider: string) {
  const res = await fetch(`/api/v1/sso/oauth/${provider}/icon`, {
    method: 'DELETE',
    credentials: 'include',
  })
  if (!res.ok) {
    throw new Error(`remove icon failed (${res.status})`)
  }
}

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

export const SCIM_STATUS = graphql(`
  query ScimStatus {
    scim {
      id
    }
  }
`)
