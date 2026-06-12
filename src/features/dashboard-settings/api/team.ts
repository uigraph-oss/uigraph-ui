import { graphql } from '@/api'

export const GET_TEAM = graphql(`
  query GetTeam($organizationId: String!, $teamId: String) {
    GetTeam(organizationId: $organizationId, teamId: $teamId) {
      organizationId
      teamId
      teamName
      description
      memberCount
      createdAt
      createdBy
      updatedAt
      updatedBy
      deletedAt
      deletedBy
    }
  }
`)

export const CREATE_NEW_TEAM = graphql(`
  mutation CreateNewTeam($input: CreateTeamInput!) {
    CreateNewTeam(input: $input) {
      organizationId
      teamId
      teamName
      description
      memberCount
      createdAt
      createdBy
      updatedAt
      updatedBy
      deletedAt
      deletedBy
    }
  }
`)

export const UPDATE_TEAM = graphql(`
  mutation UpdateTeam(
    $organizationId: String!
    $teamId: String!
    $input: UpdateTeamInput!
  ) {
    UpdateTeam(
      organizationId: $organizationId
      teamId: $teamId
      input: $input
    ) {
      organizationId
      teamId
      teamName
      description
      memberCount
      createdAt
      createdBy
      updatedAt
      updatedBy
      deletedAt
      deletedBy
    }
  }
`)

export const DELETE_TEAM = graphql(`
  mutation DeleteTeam($organizationId: String!, $teamId: String!) {
    DeleteTeam(organizationId: $organizationId, teamId: $teamId)
  }
`)
