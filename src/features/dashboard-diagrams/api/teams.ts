import { graphql } from '@/api'

export type DashboardTeam = {
  id: string
  name: string
}

export const TEAMS = graphql(`
  query Teams($orgId: ID!) {
    teams(orgId: $orgId) {
      id
      name
    }
  }
`)
