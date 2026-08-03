import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import {
  DashboardSectionContent,
  DashboardSectionHeader,
} from '@/features/dashboard'
import { useSearchParamsState } from '@/hooks/use-search-params-state'
import { useCurrentOrganization } from '@/store/auth-store'
import { useQuery } from '@apollo/client'
import { useMemo, useState } from 'react'
import { useServiceContext } from '../../contexts/service-context'
import { SERVICE_COST_RESOURCES, SERVICE_COST_TREND } from './api/costs'
import { CostBreakdownPanel } from './components/cost-breakdown-panel'
import { CostTrendChart } from './components/cost-trend-chart'
import { CostsExportButton } from './components/costs-export-button'
import { CostsKpiRow } from './components/costs-kpi-row'
import { ResourceFilterBar } from './components/resource-filter-bar'
import { ResourceInventoryGrid } from './components/resource-inventory-grid'
import { TagRulesPanel } from './components/tag-rules-panel'
import { RESOURCE_TYPES } from './constants/resource-types'
import {
  breakdownBy,
  computeSummary,
  filterResources,
} from './lib/derive-cost-metrics'
import {
  mapGraphqlResource,
  mapGraphqlTrendPoint,
} from './lib/map-graphql-resources'
import type {
  BreakdownDimension,
  CostBreakdownRow,
  ResourceFilters,
} from './types'

const PERIOD_DAYS = { '7d': 7, '30d': 30, '90d': 90 } as const
type Period = keyof typeof PERIOD_DAYS

const FIELD_FOR_DIMENSION: Record<
  BreakdownDimension,
  'provider' | 'environment' | 'type' | 'region'
> = {
  provider: 'provider',
  environment: 'environment',
  region: 'region',
  resourceType: 'type',
}

export function ServiceCostsInfraPage() {
  const { serviceId } = useServiceContext()
  const orgId = useCurrentOrganization()?.id as string
  const [search, setSearch] = useState('')

  const [
    {
      dimension: dimensionParam,
      period: periodParam,
      provider,
      environment,
      type,
      region,
    },
    setSearchParams,
  ] = useSearchParamsState(
    'dimension',
    'period',
    'provider',
    'environment',
    'type',
    'region'
  )

  const dimension = (dimensionParam as BreakdownDimension) ?? 'resourceType'
  const period = (periodParam as Period) ?? '30d'

  const filters: ResourceFilters = useMemo(
    () => ({
      provider: (provider as ResourceFilters['provider']) ?? 'all',
      environment: (environment as ResourceFilters['environment']) ?? 'all',
      type: (type as ResourceFilters['type']) ?? 'all',
      region: (region as ResourceFilters['region']) ?? 'all',
      search,
    }),
    [provider, environment, type, region, search]
  )

  const resourcesQuery = useQuery(SERVICE_COST_RESOURCES, {
    variables: { orgId, serviceId },
    skip: !orgId || !serviceId,
  })
  const trendQuery = useQuery(SERVICE_COST_TREND, {
    variables: { orgId, serviceId, days: PERIOD_DAYS[period] },
    skip: !orgId || !serviceId,
  })

  const resources = useMemo(
    () =>
      (resourcesQuery.data?.serviceCostResources ?? []).map(mapGraphqlResource),
    [resourcesQuery.data]
  )
  const slicedTrend = useMemo(
    () => (trendQuery.data?.serviceCostTrend ?? []).map(mapGraphqlTrendPoint),
    [trendQuery.data]
  )
  const isLoading =
    (resourcesQuery.loading && !resourcesQuery.data) ||
    (trendQuery.loading && !trendQuery.data)

  const summary = useMemo(
    () => computeSummary(resources, slicedTrend),
    [resources, slicedTrend]
  )

  const filteredResources = useMemo(
    () => filterResources(resources, filters),
    [resources, filters]
  )

  const availableRegions = useMemo(
    () => Array.from(new Set(resources.map((r) => r.region))).sort(),
    [resources]
  )

  const activeField = FIELD_FOR_DIMENSION[dimension]
  const activeFocusValue = filters[activeField]

  const focusChip = useMemo(() => {
    if (activeFocusValue === 'all') return null
    const rows = breakdownBy(resources, dimension)
    const match = rows.find((r) => r.key === activeFocusValue)
    return match
      ? {
          label: match.label,
          onClear: () => setSearchParams({ [activeField]: null }),
        }
      : null
  }, [activeFocusValue, resources, dimension, activeField, setSearchParams])

  function handleDimensionChange(nextDimension: BreakdownDimension) {
    const oldField = FIELD_FOR_DIMENSION[dimension]
    setSearchParams({ dimension: nextDimension, [oldField]: null })
  }

  function handleBreakdownRowClick(row: CostBreakdownRow) {
    const field = FIELD_FOR_DIMENSION[dimension]
    const isAlreadyActive = filters[field] === row.key
    setSearchParams({ [field]: isAlreadyActive ? null : row.key })
  }

  function handleFiltersChange(partial: Partial<ResourceFilters>) {
    if (partial.search !== undefined) {
      setSearch(partial.search)
      return
    }
    const patch: Partial<
      Record<'provider' | 'environment' | 'type' | 'region', string>
    > = {}
    if (partial.provider !== undefined) patch.provider = partial.provider
    if (partial.environment !== undefined)
      patch.environment = partial.environment
    if (partial.type !== undefined) patch.type = partial.type
    if (partial.region !== undefined) patch.region = partial.region
    setSearchParams(patch)
  }

  return (
    <div className="flex h-full flex-col">
      <DashboardSectionHeader
        title="Costs & Infra"
        description="Cloud spend and infrastructure inventory for this service, pulled from AWS, Azure, and GCP by resource tag."
      >
        <ToggleGroup
          type="single"
          value={period}
          onValueChange={(value) => value && setSearchParams({ period: value })}
          variant="outline"
        >
          <ToggleGroupItem value="7d" className="px-4 text-xs">
            7d
          </ToggleGroupItem>
          <ToggleGroupItem value="30d" className="px-4 text-xs">
            30d
          </ToggleGroupItem>
          <ToggleGroupItem value="90d" className="px-4 text-xs">
            90d
          </ToggleGroupItem>
        </ToggleGroup>
      </DashboardSectionHeader>

      <DashboardSectionContent className="gap-6">
        <TagRulesPanel serviceId={serviceId} />

        {isLoading ? (
          <p className="text-paragraph py-8 text-center text-sm">Loading…</p>
        ) : (
          <>
            <CostsKpiRow summary={summary} />

            <CostTrendChart data={slicedTrend} />

            <div className="border-stock bg-shading/40 rounded-[12px] border">
              <CostBreakdownPanel
                resources={resources}
                dimension={dimension}
                onDimensionChange={handleDimensionChange}
                activeKey={activeFocusValue === 'all' ? null : activeFocusValue}
                onRowClick={handleBreakdownRowClick}
              />

              <div className="border-stock border-t px-6 py-4">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <ResourceFilterBar
                    filters={filters}
                    onFiltersChange={handleFiltersChange}
                    availableRegions={availableRegions}
                    focusChip={focusChip}
                  />
                  <CostsExportButton
                    rows={filteredResources}
                    filename={`service-resources-${serviceId}.csv`}
                    columns={[
                      { header: 'Name', value: (r) => r.name },
                      {
                        header: 'Type',
                        value: (r) => RESOURCE_TYPES[r.type].label,
                      },
                      { header: 'Provider', value: (r) => r.provider },
                      { header: 'Environment', value: (r) => r.environment },
                      { header: 'Region', value: (r) => r.region },
                      {
                        header: 'Monthly Cost (USD)',
                        value: (r) => r.monthlyCostUsd,
                      },
                      { header: 'Tags', value: (r) => r.tags.join('; ') },
                    ]}
                  />
                </div>

                <ResourceInventoryGrid resources={filteredResources} />
              </div>
            </div>
          </>
        )}
      </DashboardSectionContent>
    </div>
  )
}
