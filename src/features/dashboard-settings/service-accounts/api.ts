import { graphql, type GT } from '@/api'
import { env } from '@/env'

export type ServiceAccount = GT.ServiceAccountsQuery['serviceAccounts'][number]
export type ServiceAccountToken =
  GT.ServiceAccountTokensQuery['serviceAccountTokens'][number]

export const SERVICE_ACCOUNTS = graphql(`
  query ServiceAccounts($orgId: ID!) {
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
  query ServiceAccountScopes($orgId: ID!) {
    serviceAccountScopes(orgId: $orgId)
  }
`)

export const SERVICE_ACCOUNT_TOKENS = graphql(`
  query ServiceAccountTokens($orgId: ID!, $saId: ID!) {
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
  mutation CreateServiceAccount(
    $orgId: ID!
    $input: CreateServiceAccountInput!
  ) {
    createServiceAccount(orgId: $orgId, input: $input) {
      id
    }
  }
`)

export const UPDATE_SERVICE_ACCOUNT = graphql(`
  mutation UpdateServiceAccount(
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
  mutation DeleteServiceAccount($orgId: ID!, $id: ID!) {
    deleteServiceAccount(orgId: $orgId, id: $id)
  }
`)

export const CREATE_TOKEN = graphql(`
  mutation CreateServiceAccountToken(
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
  mutation RevokeServiceAccountToken($orgId: ID!, $saId: ID!, $tokenId: ID!) {
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
    `${env.VITE_API_URL}/api/v1/orgs/${orgId}/service-accounts/${saId}/avatar`,
    { method: 'PUT', credentials: 'include', body: form }
  )
  if (!res.ok) {
    throw new Error(`upload avatar failed (${res.status})`)
  }
}
