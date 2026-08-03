import { PROVIDERS } from '../constants/providers'
import { RESOURCE_TYPES } from '../constants/resource-types'
import type {
  BreakdownDimension,
  CostBreakdownRow,
  CostTrendPoint,
  InfraResource,
  ResourceFilters,
  ServiceCostSummary,
} from '../types'

const ENVIRONMENT_LABELS: Record<string, string> = {
  production: 'Production',
  staging: 'Staging',
  development: 'Development',
}

function environmentLabel(environment: string): string {
  return (
    ENVIRONMENT_LABELS[environment] ??
    (environment
      ? environment.charAt(0).toUpperCase() + environment.slice(1)
      : 'Unspecified')
  )
}

/**
 * `key` is the raw resource field value (used to drive the breakdown-row ->
 * resource-filter "focus" mechanism); `label` is what's rendered.
 */
function dimensionKeyAndLabel(
  resource: InfraResource,
  dimension: BreakdownDimension
): { key: string; label: string } {
  switch (dimension) {
    case 'environment':
      return {
        key: resource.environment,
        label: environmentLabel(resource.environment),
      }
    case 'provider':
      return {
        key: resource.provider,
        label: PROVIDERS[resource.provider].label,
      }
    case 'region':
      return { key: resource.region, label: resource.region }
    case 'resourceType':
      return { key: resource.type, label: RESOURCE_TYPES[resource.type].label }
  }
}

export function breakdownBy(
  resources: InfraResource[],
  dimension: BreakdownDimension
): CostBreakdownRow[] {
  const totals = new Map<
    string,
    { label: string; costUsd: number; resourceCount: number }
  >()

  for (const resource of resources) {
    const { key, label } = dimensionKeyAndLabel(resource, dimension)
    const existing = totals.get(key) ?? { label, costUsd: 0, resourceCount: 0 }
    existing.costUsd += resource.monthlyCostUsd
    existing.resourceCount += 1
    totals.set(key, existing)
  }

  const totalCostUsd = resources.reduce((sum, r) => sum + r.monthlyCostUsd, 0)

  return Array.from(totals.entries())
    .map(([key, value]) => ({
      key,
      label: value.label,
      costUsd: value.costUsd,
      resourceCount: value.resourceCount,
      pctOfTotal: totalCostUsd > 0 ? (value.costUsd / totalCostUsd) * 100 : 0,
    }))
    .sort((a, b) => b.costUsd - a.costUsd)
}

export function filterResources(
  resources: InfraResource[],
  filters: ResourceFilters
): InfraResource[] {
  const query = filters.search.trim().toLowerCase()

  return resources.filter((resource) => {
    if (filters.provider !== 'all' && resource.provider !== filters.provider) {
      return false
    }
    if (
      filters.environment !== 'all' &&
      resource.environment !== filters.environment
    ) {
      return false
    }
    if (filters.type !== 'all' && resource.type !== filters.type) {
      return false
    }
    if (filters.region !== 'all' && resource.region !== filters.region) {
      return false
    }
    if (query) {
      const haystack = [resource.name, ...resource.tags].join(' ').toLowerCase()
      if (!haystack.includes(query)) return false
    }
    return true
  })
}

export function computeSummary(
  resources: InfraResource[],
  trend: CostTrendPoint[]
): ServiceCostSummary {
  const totalMonthlyCostUsd = resources.reduce(
    (sum, r) => sum + r.monthlyCostUsd,
    0
  )

  const last30 = trend.slice(-30).reduce((sum, p) => sum + p.totalCostUsd, 0)
  const prev30 = trend
    .slice(-60, -30)
    .reduce((sum, p) => sum + p.totalCostUsd, 0)
  const momChangePct = prev30 > 0 ? ((last30 - prev30) / prev30) * 100 : 0

  const byType = breakdownBy(resources, 'resourceType')
  const topCostDriver = byType[0]
    ? { label: byType[0].label, costUsd: byType[0].costUsd }
    : { label: '—', costUsd: 0 }

  const providerCount = new Set(resources.map((r) => r.provider)).size

  return {
    totalMonthlyCostUsd,
    momChangePct,
    resourceCount: resources.length,
    providerCount,
    topCostDriver,
  }
}
