import { graphql } from '@/api'

export type SettingsTeam = {
  teamId: string
  teamName: string
  memberCount: number
  description: string
}

export const SETTINGS_TEAMS = graphql(`
  query SettingsTeams($orgId: ID!) {
    teams(orgId: $orgId) {
      id
      name
      email
      memberCount
    }
  }
`)

export const CREATE_TEAM = graphql(`
  mutation CreateTeam($orgId: ID!, $input: CreateTeamInput!) {
    createTeam(orgId: $orgId, input: $input) {
      id
    }
  }
`)

export const UPDATE_TEAM = graphql(`
  mutation UpdateTeam($orgId: ID!, $teamId: ID!, $input: UpdateTeamInput!) {
    updateTeam(orgId: $orgId, teamId: $teamId, input: $input) {
      id
    }
  }
`)

export const DELETE_TEAM = graphql(`
  mutation DeleteTeam($orgId: ID!, $teamId: ID!) {
    deleteTeam(orgId: $orgId, teamId: $teamId)
  }
`)
