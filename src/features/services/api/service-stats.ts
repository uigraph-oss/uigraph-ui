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

export const GET_SERVICE_STATS_QUERY = graphql(`
  query V1GetServiceStats($organizationId: String!, $serviceId: String) {
    v1GetServiceStats(organizationId: $organizationId, serviceId: $serviceId) {
      serviceId
      endpointCount
      diagramCount
      dbTableCount
      docCount
      testCaseCount
    }
  }
`)
