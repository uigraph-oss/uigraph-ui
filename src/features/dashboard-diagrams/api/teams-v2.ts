import { graphql } from '@/api-v2'

export type DashboardTeam = {
  id: string
  orgId: string
  name: string
  email?: string | null
}

export const TEAMS_V2 = graphql(`
  query TeamsV2($orgId: ID!) {
    teams(orgId: $orgId) {
      id
      name
    }
  }
`)
