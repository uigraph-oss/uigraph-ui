import type { GT } from '@/api'
import type { CostTrendPoint, InfraResource } from '../types'

type GqlResource = GT.ServiceCostResourcesQuery['serviceCostResources'][number]
type GqlTrendPoint = GT.ServiceCostTrendQuery['serviceCostTrend'][number]

export function mapGraphqlResource(r: GqlResource): InfraResource {
  return {
    id: r.id,
    name: r.name,
    type: r.resourceType as InfraResource['type'],
    provider: r.provider.toLowerCase() as InfraResource['provider'],
    environment: r.environment,
    region: r.region,
    monthlyCostUsd: r.monthlyCostUsd,
    tags: r.tags,
    matchedLabels: r.matchedTags,
    lastSyncedAt: r.lastSyncedAt,
    status: r.status.toLowerCase() as InfraResource['status'],
  }
}

export function mapGraphqlTrendPoint(p: GqlTrendPoint): CostTrendPoint {
  return {
    date: p.date,
    totalCostUsd: p.totalUsd,
    awsCostUsd: p.awsUsd,
    azureCostUsd: p.azureUsd,
    gcpCostUsd: p.gcpUsd,
  }
}
