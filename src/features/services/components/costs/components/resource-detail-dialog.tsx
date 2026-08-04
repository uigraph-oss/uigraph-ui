'use client'

import {
  BetterDialogContent,
  BetterDialogProvider,
} from '@/components/better-dialog'
import { useCurrentOrganization } from '@/store/auth-store'
import { useQuery } from '@apollo/client'
import { formatDistanceToNow } from 'date-fns'
import { RESOURCE_DAILY_COSTS } from '../api/costs'
import { RESOURCE_TYPES } from '../constants/resource-types'
import type { InfraResource } from '../types'
import { ResourceDailyCostChart } from './resource-daily-cost-chart'
import { ResourceEnvironmentBadge } from './resource-environment-badge'
import { ResourceProviderBadge } from './resource-provider-badge'

const usd = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
})

export function ResourceDetailDialog({
  resource,
  onOpenChange,
}: {
  resource: InfraResource | null
  onOpenChange: (open: boolean) => void
}) {
  const orgId = useCurrentOrganization()?.id as string
  const typeMeta = resource ? RESOURCE_TYPES[resource.type] : null

  const dailyCostsQuery = useQuery(RESOURCE_DAILY_COSTS, {
    variables: { orgId, resourceId: resource?.id ?? '', days: 90 },
    skip: !orgId || !resource,
  })

  const dailyCosts = dailyCostsQuery.data?.resourceDailyCosts ?? []

  return (
    <BetterDialogProvider
      open={resource !== null}
      onOpenChange={onOpenChange}
      className="sm:max-w-[36rem]"
    >
      {resource && (
        <BetterDialogContent
          title={resource.name}
          description={typeMeta?.label}
          footerCancel="Close"
        >
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-1.5">
              <ResourceProviderBadge provider={resource.provider} />
              <ResourceEnvironmentBadge environment={resource.environment} />
              <span className="text-paragraph text-xs">{resource.region}</span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-paragraph text-xs">Monthly cost</p>
                <p className="text-foreground text-lg font-semibold">
                  {usd.format(resource.monthlyCostUsd)}
                </p>
              </div>
              <div>
                <p className="text-paragraph text-xs">Last synced</p>
                <p className="text-foreground">
                  {formatDistanceToNow(new Date(resource.lastSyncedAt), {
                    addSuffix: true,
                  })}
                </p>
              </div>
            </div>

            <div>
              <p className="text-paragraph mb-3 text-sm font-medium">
                Daily cost (last 90 days)
              </p>
              {dailyCostsQuery.loading && !dailyCostsQuery.data ? (
                <p className="text-paragraph py-8 text-center text-sm">
                  Loading…
                </p>
              ) : (
                <ResourceDailyCostChart data={dailyCosts} />
              )}
            </div>

            {resource.tags.length > 0 && (
              <div>
                <p className="text-paragraph mb-2 text-sm font-medium">Tags</p>
                <div className="flex flex-wrap gap-1">
                  {resource.tags.map((tag) => (
                    <span
                      key={tag}
                      className={
                        resource.matchedLabels.includes(tag)
                          ? 'bg-primary/10 text-primary rounded-full px-2 py-0.5 text-[11px] font-medium break-all'
                          : 'bg-muted/40 text-paragraph rounded-full px-2 py-0.5 text-[11px] font-medium break-all'
                      }
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </BetterDialogContent>
      )}
    </BetterDialogProvider>
  )
}
