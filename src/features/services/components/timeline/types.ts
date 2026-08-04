export type TimelineEventType = 'release' | 'decision' | 'incident'

export interface TimelineTouchedRef {
  id: string
  label: string
  kind: 'service' | 'node'
}

export type TimelineEventOrigin = 'auto' | 'manual'

export interface TimelineAttachment {
  assetId?: string
  fileName: string
  fileType: string
  url: string
  textContent?: string
}

interface TimelineEventBase {
  id: string
  title: string
  summary: string
  date: string
  touches: TimelineTouchedRef[]
  sourceLabel?: string
  sourceUrl?: string
  isAgentSummarized?: boolean
  origin: TimelineEventOrigin
  attachment?: TimelineAttachment
}

export interface TimelineReleaseEvent extends TimelineEventBase {
  type: 'release'
  version: string
}

export interface TimelineDecisionEvent extends TimelineEventBase {
  type: 'decision'
  adrNumber: string
  status: 'proposed' | 'accepted' | 'superseded' | 'deprecated'
}

export interface TimelineIncidentEvent extends TimelineEventBase {
  type: 'incident'
}

export type TimelineEvent =
  TimelineReleaseEvent | TimelineDecisionEvent | TimelineIncidentEvent

export type TimelineTypeFilter = 'all' | TimelineEventType

export type TimelinePeriod = '7d' | '30d' | '90d' | '1y' | 'all'
