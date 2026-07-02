import { cn } from '@/lib/utils'

export const EXECUTION_STATUSES = [
  'passed',
  'failed',
  'skipped',
  'blocked',
] as const

export type ExecutionStatus = (typeof EXECUTION_STATUSES)[number]

export const executionSectionLabelClass =
  'text-muted-foreground text-xs font-medium tracking-wider uppercase'

const executionStatusClassMap: Record<
  ExecutionStatus,
  {
    badge: string
    icon: string
    button: string
    summary: string
  }
> = {
  passed: {
    badge: 'border border-emerald-200 bg-emerald-50 text-emerald-700',
    icon: 'bg-emerald-50 text-emerald-600',
    button:
      'border-emerald-200 bg-emerald-50 text-emerald-700 hover:border-emerald-300 hover:bg-emerald-100',
    summary: 'text-emerald-700',
  },
  failed: {
    badge: 'border border-rose-200 bg-rose-50 text-rose-700',
    icon: 'bg-rose-50 text-rose-600',
    button:
      'border-rose-200 bg-rose-50 text-rose-700 hover:border-rose-300 hover:bg-rose-100',
    summary: 'text-rose-700',
  },
  skipped: {
    badge: 'border border-[#2A3242] bg-[#1E2533] text-[#D2D9E6]',
    icon: 'bg-[#1E2533] text-[#828DA3]',
    button:
      'border-[#2A3242] bg-[#1E2533] text-[#D2D9E6] hover:border-[#3B4658] hover:bg-[#2A3242]',
    summary: 'text-[#D2D9E6]',
  },
  blocked: {
    badge: 'border border-amber-200 bg-amber-50 text-amber-700',
    icon: 'bg-amber-50 text-amber-600',
    button:
      'border-amber-200 bg-amber-50 text-amber-700 hover:border-amber-300 hover:bg-amber-100',
    summary: 'text-amber-700',
  },
}

export function getExecutionStatusBadgeClass(status: ExecutionStatus) {
  return cn(
    'inline-flex items-center justify-center rounded-full px-2.5 py-0.5 text-xs font-medium',
    executionStatusClassMap[status].badge
  )
}

export function getExecutionStatusIconClass(status: ExecutionStatus) {
  return cn(
    'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
    executionStatusClassMap[status].icon
  )
}

export function getExecutionStatusButtonClass(
  status: ExecutionStatus,
  selected: boolean
) {
  return cn(
    'h-11 rounded-[12px] border bg-[#141925] text-sm font-medium text-[#D2D9E6] shadow-none',
    selected
      ? executionStatusClassMap[status].button
      : 'border-[#2A3242] hover:border-[#3B4658] hover:bg-[#1E2533]'
  )
}

export function getExecutionSummaryClass(status: ExecutionStatus) {
  return executionStatusClassMap[status].summary
}

export function getExecutionTypeBadgeClass(type: string | null | undefined) {
  switch ((type ?? '').toLowerCase()) {
    case 'api':
      return 'border border-sky-200 bg-sky-50 text-sky-700'
    case 'manual':
      return 'border border-violet-200 bg-violet-50 text-violet-700'
    case 'graphql':
      return 'border border-fuchsia-200 bg-fuchsia-50 text-fuchsia-700'
    case 'grpc':
      return 'border border-cyan-200 bg-cyan-50 text-cyan-700'
    case 'database':
      return 'border border-teal-200 bg-teal-50 text-teal-700'
    default:
      return 'border border-[#2A3242] bg-[#1E2533] text-[#D2D9E6]'
  }
}
