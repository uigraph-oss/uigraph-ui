import { graphql } from '@/api'

export const UPDATE_USER = graphql(`
  mutation UpdateUserV2($id: ID!, $input: UpdateUserInput!) {
    updateUser(id: $id, input: $input) {
      id
      name
    }
  }
`)
