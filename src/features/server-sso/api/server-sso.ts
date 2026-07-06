import { graphql } from '@/api'
import { apolloClientGQL } from '@/api/client'
import { putToPresigned } from '@/features/uploads/api/uploads'

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

export const PREPARE_OAUTH_ICON_UPLOAD = graphql(`
  mutation PrepareOAuthProviderIconUpload($provider: String!) {
    prepareOAuthProviderIconUpload(provider: $provider) {
      assetId
      uploadUrl
    }
  }
`)

export const SET_OAUTH_PROVIDER_ICON = graphql(`
  mutation SetOAuthProviderIcon($provider: String!) {
    setOAuthProviderIcon(provider: $provider)
  }
`)

export const REMOVE_OAUTH_PROVIDER_ICON = graphql(`
  mutation RemoveOAuthProviderIcon($provider: String!) {
    removeOAuthProviderIcon(provider: $provider)
  }
`)

export async function setOAuthProviderIcon(provider: string, file: File) {
  await putToPresigned(async () => {
    const { data } = await apolloClientGQL.mutate({
      mutation: PREPARE_OAUTH_ICON_UPLOAD,
      variables: { provider },
    })
    return {
      assetId: data?.prepareOAuthProviderIconUpload?.assetId,
      uploadUrl: data?.prepareOAuthProviderIconUpload?.uploadUrl,
    }
  }, file)

  await apolloClientGQL.mutate({
    mutation: SET_OAUTH_PROVIDER_ICON,
    variables: { provider },
  })
}

export async function removeOAuthProviderIcon(provider: string) {
  await apolloClientGQL.mutate({
    mutation: REMOVE_OAUTH_PROVIDER_ICON,
    variables: { provider },
  })
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
