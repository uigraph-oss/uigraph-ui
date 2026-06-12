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
    pillClass:
      'text-violet-700 border-violet-200 bg-violet-50 dark:text-violet-300 dark:border-violet-800 dark:bg-violet-950/40',
  },
  api: {
    label: 'API',
    icon: Zap,
    pillClass:
      'text-blue-700 border-blue-200 bg-blue-50 dark:text-blue-300 dark:border-blue-800 dark:bg-blue-950/40',
  },
  graphql: {
    label: 'GraphQL',
    icon: Braces,
    pillClass:
      'text-pink-700 border-pink-200 bg-pink-50 dark:text-pink-300 dark:border-pink-800 dark:bg-pink-950/40',
  },
  grpc: {
    label: 'gRPC',
    icon: ArrowLeftRight,
    pillClass:
      'text-teal-700 border-teal-200 bg-teal-50 dark:text-teal-300 dark:border-teal-800 dark:bg-teal-950/40',
  },
  database: {
    label: 'Database',
    icon: Database,
    pillClass:
      'text-orange-700 border-orange-200 bg-orange-50 dark:text-orange-300 dark:border-orange-800 dark:bg-orange-950/40',
  },
  other: {
    label: 'Other',
    icon: Braces,
    pillClass:
      'text-slate-600 border-slate-200 bg-slate-100 dark:text-slate-400 dark:border-slate-700 dark:bg-slate-800/50',
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
