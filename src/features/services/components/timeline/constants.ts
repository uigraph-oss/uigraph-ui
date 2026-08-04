import { AlertTriangle, FileText, Rocket } from 'lucide-react'
import type { ComponentType } from 'react'
import type { TimelineDecisionEvent, TimelineEvent } from './types'

export const TYPE_ICON: Record<
  TimelineEvent['type'],
  ComponentType<{ className?: string }>
> = {
  release: Rocket,
  decision: FileText,
  incident: AlertTriangle,
}

export const TYPE_LABEL: Record<TimelineEvent['type'], string> = {
  release: 'Release',
  decision: 'Decision',
  incident: 'Incident',
}

export const TYPE_BADGE_STYLES: Record<TimelineEvent['type'], string> = {
  release: 'border-sky-500/30 bg-sky-500/15 text-sky-400',
  decision: 'border-violet-500/30 bg-violet-500/15 text-violet-400',
  incident: 'border-red-500/30 bg-red-500/15 text-red-400',
}

export const MANUAL_BADGE_STYLE =
  'border-amber-500/30 bg-amber-500/15 text-amber-400'

export const AGENT_SUMMARIZED_BADGE_STYLE =
  'border-[#3B6BFF]/30 bg-[#3B6BFF]/15 text-[#7FA0FF]'

export const DECISION_STATUS_OPTIONS: TimelineDecisionEvent['status'][] = [
  'proposed',
  'accepted',
  'superseded',
  'deprecated',
]

export const DECISION_STATUS_STYLES: Record<
  TimelineDecisionEvent['status'],
  string
> = {
  proposed: 'border-amber-500/30 bg-amber-500/15 text-amber-400',
  accepted: 'border-[#21AD6D]/30 bg-[#21AD6D]/15 text-[#3BD68E]',
  superseded: 'border-stock bg-muted/40 text-paragraph',
  deprecated: 'border-red-500/30 bg-red-500/15 text-red-400',
}
