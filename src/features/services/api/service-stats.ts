/** Matches project-manager / GraphQL `ServiceStats` (latest API version counts, etc.). */
export type ServiceStatsRow = {
  serviceId: string
  endpointCount: number
  diagramCount: number
  dbTableCount: number
  docCount: number
  testCaseCount: number
}
