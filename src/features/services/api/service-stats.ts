import { graphql } from '@/api'

/** Matches project-manager / GraphQL `ServiceStats` (latest API version counts, etc.). */
export type ServiceStatsRow = {
  serviceId: string
  endpointCount: number
  diagramCount: number
  dbTableCount: number
  docCount: number
  testCaseCount: number
}

export const SERVICE_STATS = graphql(`
  query ServiceStats($orgId: ID!, $serviceId: ID) {
    serviceStats(orgId: $orgId, serviceId: $serviceId) {
      serviceId
      endpointCount
      diagramCount
      dbTableCount
      docCount
      testCaseCount
    }
  }
`)
