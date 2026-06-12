import { graphql } from '@/api'

export const CREATE_USER = graphql(`
  mutation CreateUser($input: CreateUserInput!) {
    CreateUser(input: $input)
  }
`)

export const REMOVE_USER = graphql(`
  mutation RemoveUser($organizationId: String!, $userId: String!) {
    RemoveUser(organizationId: $organizationId, userId: $userId)
  }
`)

export const UPDATE_USER = graphql(`
  mutation UpdateUser($userId: String!, $input: UpdateUserInput!) {
    UpdateUser(userId: $userId, input: $input) {
      userId
      organizationId
      role
      status
      email
      teamId
      isActive
      joinedAt
      deletedAt
    }
  }
`)

export const GET_USERS_BY_TEAM = graphql(`
  query GetUsersByTeam($organizationId: String!, $teamId: String!) {
    GetUsersByTeam(organizationId: $organizationId, teamId: $teamId) {
      userId
      organizationId
      role
      status
      email
      teamId
      teamName
      isActive
      joinedAt
      deletedAt
    }
  }
`)

export const GET_ORGANIZATION_USERS = graphql(`
  query GetOrganizationUsers($organizationId: String!) {
    GetOrganizationUsers(organizationId: $organizationId) {
      userId
      organizationId
      role
      status
      email
      teamId
      teamName
      isActive
      joinedAt
      deletedAt
    }
  }
`)
