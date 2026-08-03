'use client'

import { Badge } from '@/components/ui/badge'

/**
 * Run status is free-text from imports, so this only special-cases the
 * known values and falls back to a neutral treatment for anything else.
 */
export function runStatusBadgeClass(status: string): string {
  switch (status.toLowerCase()) {
    case 'partial':
      return 'border-amber-500/50 bg-amber-500/10 text-amber-300'
    case 'failed':
      return 'border-red-500/50 bg-red-500/10 text-red-300'
    default:
      return 'border-emerald-500/50 bg-emerald-500/10 text-emerald-300'
  }
}

/**
 * Whether a run's perEndpoint rows carry an apiEndpointId at all — cheap to
 * compute from data already on the run, unlike full SLA grading (which
 * needs a threshold lookup per endpoint). Lets the history table flag
 * unattributed runs without fanning out a query per row.
 */
export function RunAttributionCell({ attributed }: { attributed: boolean }) {
  if (attributed) {
    return (
      <Badge
        variant="outline"
        className="border-green-500/50 bg-green-500/10 text-green-300"
      >
        Linked
      </Badge>
    )
  }
  return <span className="text-muted-foreground text-xs">Not attributed</span>
}

export type EndpointSlaState = 'not-linked' | 'no-sla' | 'pass' | 'fail'

export function SlaCell({ state }: { state: EndpointSlaState }) {
  switch (state) {
    case 'pass':
      return (
        <Badge
          variant="outline"
          className="border-green-500/50 bg-green-500/10 text-green-300"
        >
          ✓
        </Badge>
      )
    case 'fail':
      return (
        <Badge
          variant="outline"
          className="border-red-500/50 bg-red-500/10 text-red-300"
        >
          ✗
        </Badge>
      )
    case 'no-sla':
      return <span className="text-muted-foreground text-xs">No SLA set</span>
    case 'not-linked':
      return <span className="text-muted-foreground text-xs">Not linked</span>
  }
}
