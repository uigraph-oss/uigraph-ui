import { graphql } from '@/api'

export type SettingsTeam = {
  teamId: string
  teamName: string
  memberCount: number
  description: string
}

export const SETTINGS_TEAMS_V2 = graphql(`
  query SettingsTeamsV2($orgId: ID!) {
    teams(orgId: $orgId) {
      id
      name
      email
      memberCount
    }
  }
`)

export const CREATE_TEAM_V2 = graphql(`
  mutation CreateTeamV2($orgId: ID!, $input: CreateTeamInput!) {
    createTeam(orgId: $orgId, input: $input) {
      id
    }
  }
`)

export const UPDATE_TEAM_V2 = graphql(`
  mutation UpdateTeamV2($orgId: ID!, $teamId: ID!, $input: UpdateTeamInput!) {
    updateTeam(orgId: $orgId, teamId: $teamId, input: $input) {
      id
    }
  }
`)

export const DELETE_TEAM_V2 = graphql(`
  mutation DeleteTeamV2($orgId: ID!, $teamId: ID!) {
    deleteTeam(orgId: $orgId, teamId: $teamId)
  }
`)
