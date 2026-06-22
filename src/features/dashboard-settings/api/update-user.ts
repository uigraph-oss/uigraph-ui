import { graphql } from '@/api'

export const UPDATE_USER = graphql(`
  mutation UpdateUser($id: ID!, $input: UpdateUserInput!) {
    updateUser(id: $id, input: $input) {
      id
      name
    }
  }
`)
