import { graphql } from '@/api'

export type ServerUser = {
  id: string
  email: string
  name: string
  login: string
  disabled: boolean
  role: string
  avatarUrl?: string | null
  lastSeenAt?: string | null
  createdAt: string
  updatedAt: string
}

export const SERVER_USER_ROLES = ['user', 'server_admin'] as const

export const SERVER_USERS = graphql(`
  query ServerUsers {
    users {
      id
      email
      name
      login
      disabled
      role
      avatarUrl
      lastSeenAt
      createdAt
      updatedAt
    }
  }
`)

export const CREATE_SERVER_USER = graphql(`
  mutation CreateServerUser($input: CreateUserInput!) {
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

export const UPDATE_SERVER_USER = graphql(`
  mutation UpdateServerUser($id: ID!, $input: UpdateUserInput!) {
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

export const DISABLE_SERVER_USER = graphql(`
  mutation DisableServerUser($id: ID!) {
    disableUser(id: $id)
  }
`)
