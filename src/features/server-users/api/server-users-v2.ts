import { graphql } from '@/api'

export type ServerUser = {
  id: string
  email: string
  name: string
  login: string
  disabled: boolean
  role: string
  lastSeenAt?: string | null
  createdAt: string
  updatedAt: string
}

export const SERVER_USER_ROLES = ['user', 'server_admin'] as const

export const SERVER_USERS_V2 = graphql(`
  query ServerUsersV2 {
    users {
      id
      email
      name
      login
      disabled
      role
      lastSeenAt
      createdAt
      updatedAt
    }
  }
`)

export const CREATE_SERVER_USER_V2 = graphql(`
  mutation CreateServerUserV2($input: CreateUserInput!) {
    createUser(input: $input) {
      id
      email
      name
      login
      disabled
      role
      lastSeenAt
      createdAt
      updatedAt
    }
  }
`)

export const UPDATE_SERVER_USER_V2 = graphql(`
  mutation UpdateServerUserV2($id: ID!, $input: UpdateUserInput!) {
    updateUser(id: $id, input: $input) {
      id
      email
      name
      login
      disabled
      role
      lastSeenAt
      createdAt
      updatedAt
    }
  }
`)

export const DISABLE_SERVER_USER_V2 = graphql(`
  mutation DisableServerUserV2($id: ID!) {
    disableUser(id: $id)
  }
`)
