export type CloudProvider = 'aws' | 'azure' | 'gcp'

export type Environment = 'production' | 'staging' | 'development'

export type ResourceType =
  | 'compute'
  | 'kubernetes'
  | 'database'
  | 'storage'
  | 'queue'
  | 'load_balancer'
  | 'serverless'
  | 'cache'
  | 'network'

export type ResourceStatus = 'running' | 'stopped' | 'degraded'

export type BreakdownDimension =
  'environment' | 'provider' | 'region' | 'resourceType'

export type InfraResource = {
  id: string
  name: string
  type: ResourceType
  provider: CloudProvider
  // A real cloud resource's environment tag can be any string a customer
  // chose ("prod", "qa", "sandbox", ...) — Environment is only the fixed
  // set the filter UI offers as quick-pick buttons, not an exhaustive list.
  environment: string
  region: string
  monthlyCostUsd: number
  tags: string[]
  matchedLabels: string[]
  lastSyncedAt: string
  status: ResourceStatus
}

export type CostTrendPoint = {
  date: string
  totalCostUsd: number
  awsCostUsd: number
  azureCostUsd: number
  gcpCostUsd: number
}

export type ServiceCostSummary = {
  totalMonthlyCostUsd: number
  momChangePct: number
  resourceCount: number
  providerCount: number
  topCostDriver: {
    label: string
    costUsd: number
  }
}

export type CostBreakdownRow = {
  key: string
  label: string
  costUsd: number
  resourceCount: number
  pctOfTotal: number
}

export type ServiceCostDataset = {
  resources: InfraResource[]
  trend: CostTrendPoint[]
  summary: ServiceCostSummary
}

export type ResourceFilters = {
  provider: CloudProvider | 'all'
  environment: Environment | 'all'
  type: ResourceType | 'all'
  region: string | 'all'
  search: string
}
