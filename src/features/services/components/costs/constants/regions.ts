import type { CloudProvider } from '../types'

export const REGIONS_BY_PROVIDER: Record<CloudProvider, string[]> = {
  aws: ['us-east-1', 'us-west-2', 'eu-west-1'],
  azure: ['eastus', 'westeurope', 'southeastasia'],
  gcp: ['us-central1', 'europe-west1', 'asia-southeast1'],
}

export const ALL_REGIONS: string[] = Object.values(REGIONS_BY_PROVIDER).flat()
