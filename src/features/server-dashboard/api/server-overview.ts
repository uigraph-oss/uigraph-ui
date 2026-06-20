import { graphql } from '@/api'

export type ServerOverview = {
  totalUsers: number
  activeUsers: number
  totalOrgs: number
}

export const SERVER_OVERVIEW = graphql(`
  query ServerOverviewV2 {
    serverOverview {
      totalUsers
      activeUsers
      totalOrgs
    }
  }
`)
