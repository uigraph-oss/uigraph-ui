import { graphql } from '@/api'

export const CREATE_TOKEN = graphql(`
  mutation CreateToken($organizationId: String!, $input: CreateTokenInput!) {
    CreateToken(organizationId: $organizationId, input: $input) {
      tokenId
      plaintext
      name
      expiresAt
    }
  }
`)

export const LIST_TOKENS = graphql(`
  query ListTokens($organizationId: String!) {
    ListTokens(organizationId: $organizationId) {
      tokenId
      name
      createdAt
      expiresAt
      revoked
      fingerprint
      lastUsedAt
    }
  }
`)

export const REVOKE_TOKEN = graphql(`
  mutation RevokeToken(
    $organizationId: String!
    $tokenId: String!
    $reason: String
  ) {
    RevokeToken(
      organizationId: $organizationId
      tokenId: $tokenId
      reason: $reason
    )
  }
`)

export const ROTATE_TOKEN = graphql(`
  mutation RotateToken($organizationId: String!, $tokenId: String!) {
    RotateToken(organizationId: $organizationId, tokenId: $tokenId) {
      tokenId
      plaintext
      name
      expiresAt
    }
  }
`)
