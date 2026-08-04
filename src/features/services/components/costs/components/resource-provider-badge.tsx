import { cn } from '@/lib/utils'
import { PROVIDERS } from '../constants/providers'
import type { CloudProvider } from '../types'

export function ResourceProviderBadge({
  provider,
  className,
}: {
  provider: CloudProvider
  className?: string
}) {
  const { label, chartColor, badgeClassName } = PROVIDERS[provider]
  return (
    <span
      className={cn(
        'inline-flex w-fit items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium',
        badgeClassName,
        className
      )}
    >
      <span
        className="size-1.5 shrink-0 rounded-full"
        style={{ backgroundColor: chartColor }}
      />
      {label}
    </span>
  )
}
