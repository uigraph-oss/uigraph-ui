import { graphql } from '@/api-v2'

export const UPDATE_USER_V2 = graphql(`
  mutation UpdateUserV2($id: ID!, $input: UpdateUserInput!) {
    updateUser(id: $id, input: $input) {
      id
      name
    }
  }
`)
