import { graphql, type GT } from '@/api'
import { apolloClientGQL } from '@/api/client'
import { putToPresigned } from '@/features/uploads/api/uploads'

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

export const PREPARE_SA_AVATAR_UPLOAD = graphql(`
  mutation PrepareServiceAccountAvatarUpload($orgId: ID!, $saId: ID!) {
    prepareServiceAccountAvatarUpload(orgId: $orgId, saId: $saId) {
      assetId
      uploadUrl
    }
  }
`)

export const SET_SERVICE_ACCOUNT_AVATAR = graphql(`
  mutation SetServiceAccountAvatar($orgId: ID!, $saId: ID!) {
    setServiceAccountAvatar(orgId: $orgId, saId: $saId)
  }
`)

export async function setServiceAccountAvatar(
  orgId: string,
  saId: string,
  file: File
) {
  await putToPresigned(async () => {
    const { data } = await apolloClientGQL.mutate({
      mutation: PREPARE_SA_AVATAR_UPLOAD,
      variables: { orgId, saId },
    })
    return {
      assetId: data?.prepareServiceAccountAvatarUpload?.assetId,
      uploadUrl: data?.prepareServiceAccountAvatarUpload?.uploadUrl,
    }
  }, file)

  await apolloClientGQL.mutate({
    mutation: SET_SERVICE_ACCOUNT_AVATAR,
    variables: { orgId, saId },
  })
}
