import { cn } from '@/lib/utils'
import type { Environment } from '../types'

const ENVIRONMENT_STYLES: Record<
  Environment,
  { label: string; className: string }
> = {
  production: { label: 'Production', className: 'bg-success/10 text-success' },
  staging: {
    label: 'Staging',
    className: 'bg-[var(--chart-4)]/15 text-[var(--chart-4)]',
  },
  development: {
    label: 'Development',
    className: 'bg-muted/40 text-paragraph',
  },
}

const FALLBACK_STYLE = { className: 'bg-muted/40 text-paragraph' }

export function ResourceEnvironmentBadge({
  environment,
  className,
}: {
  environment: string
  className?: string
}) {
  const known = ENVIRONMENT_STYLES[environment as Environment]
  const label = known?.label ?? (environment || 'Unspecified')
  const styleClassName = known?.className ?? FALLBACK_STYLE.className
  return (
    <span
      className={cn(
        'inline-flex w-fit items-center rounded-md px-2 py-0.5 text-xs font-medium',
        styleClassName,
        className
      )}
    >
      {label}
    </span>
  )
}
