import { graphql } from '@/api'

export const UPDATE_ACCOUNT = graphql(`
  mutation UpdateAccount($input: UpdateAccountInput!) {
    UpdateAccount(input: $input) {
      accountId
      accountInfo {
        firstName
        lastName
        email
        image
        imageUrl
        phoneNumber
        phoneVerified
        type
        active
        gender
        dateOfBirth
        isDeleted
      }
    }
  }
`)
