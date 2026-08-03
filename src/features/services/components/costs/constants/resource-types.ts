import {
  Cpu,
  Database,
  Gauge,
  HardDrive,
  Layers,
  Network,
  Server,
  Waypoints,
  Zap,
  type LucideIcon,
} from 'lucide-react'
import type { ResourceType } from '../types'

export const RESOURCE_TYPES: Record<
  ResourceType,
  { label: string; icon: LucideIcon; minCostUsd: number; maxCostUsd: number }
> = {
  compute: { label: 'Compute', icon: Server, minCostUsd: 40, maxCostUsd: 900 },
  kubernetes: {
    label: 'Kubernetes',
    icon: Cpu,
    minCostUsd: 200,
    maxCostUsd: 1500,
  },
  database: {
    label: 'Database',
    icon: Database,
    minCostUsd: 80,
    maxCostUsd: 1400,
  },
  storage: {
    label: 'Storage',
    icon: HardDrive,
    minCostUsd: 5,
    maxCostUsd: 180,
  },
  queue: { label: 'Queue', icon: Layers, minCostUsd: 5, maxCostUsd: 70 },
  load_balancer: {
    label: 'Load Balancer',
    icon: Waypoints,
    minCostUsd: 20,
    maxCostUsd: 100,
  },
  serverless: {
    label: 'Serverless',
    icon: Zap,
    minCostUsd: 5,
    maxCostUsd: 250,
  },
  cache: { label: 'Cache', icon: Gauge, minCostUsd: 60, maxCostUsd: 500 },
  network: {
    label: 'Network',
    icon: Network,
    minCostUsd: 10,
    maxCostUsd: 300,
  },
}

export const RESOURCE_TYPE_ORDER: ResourceType[] = [
  'compute',
  'kubernetes',
  'database',
  'storage',
  'cache',
  'load_balancer',
  'serverless',
  'queue',
  'network',
]
