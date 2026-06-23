'use client'

import {
  ArrowLeftRight,
  Braces,
  Database,
  Pencil,
  Zap,
  type LucideIcon,
} from 'lucide-react'

export type TestTypeKey =
  | 'all'
  | 'manual'
  | 'api'
  | 'graphql'
  | 'grpc'
  | 'database'
  | 'other'

export type TestTypeConfig = {
  label: string
  icon: LucideIcon
  /** Tailwind: text + border + bg for pill/badge */
  pillClass: string
}

const TYPE_CONFIG: Record<Exclude<TestTypeKey, 'all'>, TestTypeConfig> = {
  manual: {
    label: 'Manual',
    icon: Pencil,
    pillClass: 'text-violet-300 border-violet-500/30 bg-violet-500/10',
  },
  api: {
    label: 'API',
    icon: Zap,
    pillClass: 'text-blue-300 border-blue-500/30 bg-blue-500/10',
  },
  graphql: {
    label: 'GraphQL',
    icon: Braces,
    pillClass: 'text-pink-300 border-pink-500/30 bg-pink-500/10',
  },
  grpc: {
    label: 'gRPC',
    icon: ArrowLeftRight,
    pillClass: 'text-teal-300 border-teal-500/30 bg-teal-500/10',
  },
  database: {
    label: 'Database',
    icon: Database,
    pillClass: 'text-orange-300 border-orange-500/30 bg-orange-500/10',
  },
  other: {
    label: 'Other',
    icon: Braces,
    pillClass: 'text-[#828DA3] border-[#2A3242] bg-[#1E2533]',
  },
}

export const TEST_TYPE_ORDER: TestTypeKey[] = [
  'manual',
  'api',
  'graphql',
  'grpc',
  'database',
]

export const TYPE_FILTER_OPTIONS: TestTypeKey[] = [
  'all',
  'manual',
  'api',
  'graphql',
  'grpc',
  'database',
]

export function getTestTypeConfig(
  type: string | null | undefined
): TestTypeConfig {
  const key = (type ?? '').toLowerCase() || 'other'
  if (key in TYPE_CONFIG) return TYPE_CONFIG[key as keyof typeof TYPE_CONFIG]
  return TYPE_CONFIG.other
}

export function normalizeTestTypeKey(
  type: string | null | undefined
): Exclude<TestTypeKey, 'all'> {
  const key = (type ?? '').toLowerCase()
  if (key in TYPE_CONFIG) return key as Exclude<TestTypeKey, 'all'>
  return 'other'
}
