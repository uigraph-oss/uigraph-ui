import { graphql } from '@/api'
import { env } from '@/env'

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
  const res = await fetch(
    `${env.VITE_API_URL}/api/v1/sso/oauth/${provider}/icon`,
    {
      method: 'PUT',
      credentials: 'include',
      body: form,
    }
  )
  if (!res.ok) {
    throw new Error(`upload icon failed (${res.status})`)
  }
}

export async function removeOAuthProviderIcon(provider: string) {
  const res = await fetch(
    `${env.VITE_API_URL}/api/v1/sso/oauth/${provider}/icon`,
    {
      method: 'DELETE',
      credentials: 'include',
    }
  )
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

export const LDAP_CONFIG = graphql(`
  query LdapConfig {
    ldap {
      id
      host
      port
      useSsl
      startTls
      skipTlsVerify
      bindDn
      searchBaseDn
      searchFilter
      usernameAttribute
      emailAttribute
      nameAttribute
      memberOfAttribute
      allowSignUp
    }
  }
`)

export const SAML_CONFIG = graphql(`
  query SamlConfig {
    saml {
      id
      spEntityId
      spCert
      idpEntityId
      idpMetadataUrl
      idpMetadataXml
      nameIdFormat
      loginAttribute
      emailAttribute
      nameAttribute
      groupsAttribute
      signRequests
      allowSignUp
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

export const UPSERT_LDAP = graphql(`
  mutation UpsertLdap($input: UpsertLDAPInput!) {
    upsertLDAP(input: $input)
  }
`)

export const DELETE_LDAP = graphql(`
  mutation DeleteLdap {
    deleteLDAP
  }
`)

export const UPSERT_SAML = graphql(`
  mutation UpsertSaml($input: UpsertSAMLInput!) {
    upsertSAML(input: $input)
  }
`)
