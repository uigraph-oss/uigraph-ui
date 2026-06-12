import { graphql } from '@/api'

export const GET_PUBLIC_ACCOUNT_INFO = graphql(`
  query GetPubAccountByID($accountId: String!) {
    GetPubAccountByID(accountId: $accountId) {
      accountId
      accountInfo {
        firstName
        lastName
        email
        phoneNumber
        seller
        phoneVerified
        image
        imageUrl
        type
        active
        gender
        dateOfBirth
        isDeleted
      }
    }
  }
`)
