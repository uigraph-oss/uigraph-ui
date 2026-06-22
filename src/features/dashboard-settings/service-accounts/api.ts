import { graphql, type GT } from '@/api'

export type ServiceAccount =
  GT.ServiceAccountsV2Query['serviceAccounts'][number]
export type ServiceAccountToken =
  GT.ServiceAccountTokensV2Query['serviceAccountTokens'][number]

export const SERVICE_ACCOUNTS = graphql(`
  query ServiceAccountsV2($orgId: ID!) {
    serviceAccounts(orgId: $orgId) {
      id
      orgId
      name
      description
      scopes
      disabled
      isInternal
      createdAt
      updatedAt
    }
  }
`)

export const SERVICE_ACCOUNT_SCOPES = graphql(`
  query ServiceAccountScopesV2($orgId: ID!) {
    serviceAccountScopes(orgId: $orgId)
  }
`)

export const SERVICE_ACCOUNT_TOKENS = graphql(`
  query ServiceAccountTokensV2($orgId: ID!, $saId: ID!) {
    serviceAccountTokens(orgId: $orgId, saId: $saId) {
      id
      serviceAccountId
      name
      prefix
      expiresAt
      lastUsedAt
      revoked
      createdAt
    }
  }
`)

export const CREATE_SERVICE_ACCOUNT = graphql(`
  mutation CreateServiceAccountV2(
    $orgId: ID!
    $input: CreateServiceAccountInput!
  ) {
    createServiceAccount(orgId: $orgId, input: $input) {
      id
    }
  }
`)

export const UPDATE_SERVICE_ACCOUNT = graphql(`
  mutation UpdateServiceAccountV2(
    $orgId: ID!
    $id: ID!
    $input: UpdateServiceAccountInput!
  ) {
    updateServiceAccount(orgId: $orgId, id: $id, input: $input) {
      id
    }
  }
`)

export const DELETE_SERVICE_ACCOUNT = graphql(`
  mutation DeleteServiceAccountV2($orgId: ID!, $id: ID!) {
    deleteServiceAccount(orgId: $orgId, id: $id)
  }
`)

export const CREATE_TOKEN = graphql(`
  mutation CreateServiceAccountTokenV2(
    $orgId: ID!
    $saId: ID!
    $input: CreateTokenInput!
  ) {
    createServiceAccountToken(orgId: $orgId, saId: $saId, input: $input) {
      id
      name
      token
    }
  }
`)

export const REVOKE_TOKEN = graphql(`
  mutation RevokeServiceAccountTokenV2($orgId: ID!, $saId: ID!, $tokenId: ID!) {
    revokeServiceAccountToken(orgId: $orgId, saId: $saId, tokenId: $tokenId)
  }
`)

export async function setServiceAccountAvatar(
  orgId: string,
  saId: string,
  file: File
) {
  const form = new FormData()
  form.append('file', file)
  const res = await fetch(
    `/api/v1/orgs/${orgId}/service-accounts/${saId}/avatar`,
    { method: 'PUT', credentials: 'include', body: form }
  )
  if (!res.ok) {
    throw new Error(`upload avatar failed (${res.status})`)
  }
}
