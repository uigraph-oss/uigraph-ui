import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'
import { MapPin, RefreshCw } from 'lucide-react'
import { PROVIDER_ICON_MAP } from '../constants/provider-icon-map'
import { RESOURCE_TYPES } from '../constants/resource-types'
import type { InfraResource } from '../types'
import { ResourceEnvironmentBadge } from './resource-environment-badge'
import { ResourceProviderBadge } from './resource-provider-badge'

const usd = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
})

const STATUS_DOT: Record<InfraResource['status'], string> = {
  running: 'bg-success',
  degraded: 'bg-[var(--chart-4)]',
  stopped: 'bg-paragraph/50',
}

export function ResourceCard({ resource }: { resource: InfraResource }) {
  const typeMeta = RESOURCE_TYPES[resource.type]
  const iconSrc = PROVIDER_ICON_MAP[resource.provider][resource.type]

  return (
    <div className="border-stock bg-shading/40 hover:ring-primary rounded-xl border p-4 transition-colors hover:ring-1">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <span className="bg-muted/30 flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-lg">
            <img src={iconSrc} alt="" className="size-5" />
          </span>
          <div className="min-w-0">
            <p className="text-foreground truncate text-sm font-medium">
              {resource.name}
            </p>
            <p className="text-paragraph text-xs">{typeMeta.label}</p>
          </div>
        </div>
        <span
          className={cn(
            'mt-1.5 size-1.5 shrink-0 rounded-full',
            STATUS_DOT[resource.status]
          )}
          title={resource.status}
        />
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        <ResourceProviderBadge provider={resource.provider} />
        <ResourceEnvironmentBadge environment={resource.environment} />
      </div>

      <div className="text-paragraph mt-3 flex items-center justify-between text-xs">
        <span className="flex items-center gap-1">
          <MapPin className="size-3.5" />
          {resource.region}
        </span>
        <span className="text-foreground text-base font-semibold tabular-nums">
          {usd.format(resource.monthlyCostUsd)}
          <span className="text-paragraph text-xs font-normal">/mo</span>
        </span>
      </div>

      {resource.tags.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-1">
          {resource.tags.map((tag) => (
            <span
              key={tag}
              className={cn(
                'rounded-full px-2 py-0.5 text-[11px] font-medium',
                resource.matchedLabels.includes(tag)
                  ? 'bg-primary/10 text-primary'
                  : 'bg-muted/40 text-paragraph'
              )}
            >
              {tag}
            </span>
          ))}
        </div>
      ) : null}

      <div className="border-stock text-paragraph/70 mt-3 flex items-center gap-1 border-t pt-2.5 text-xs">
        <RefreshCw className="size-3" />
        Synced{' '}
        {formatDistanceToNow(new Date(resource.lastSyncedAt), {
          addSuffix: true,
        })}
      </div>
    </div>
  )
}
