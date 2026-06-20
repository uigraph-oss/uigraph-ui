import { graphql } from '@/api'

export type DashboardTeam = {
  id: string
  name: string
}

export const TEAMS_V2 = graphql(`
  query TeamsV2($orgId: ID!) {
    teams(orgId: $orgId) {
      id
      name
    }
  }
`)
