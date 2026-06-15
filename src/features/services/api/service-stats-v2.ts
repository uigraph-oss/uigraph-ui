import { graphql } from '@/api-v2'

export type ServiceStatsRow = {
  serviceId: string
  endpointCount: number
  diagramCount: number
  dbTableCount: number
  docCount: number
  testCaseCount: number
}

export const SERVICE_STATS_V2 = graphql(`
  query ServiceStatsV2($orgId: ID!, $serviceId: ID) {
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
