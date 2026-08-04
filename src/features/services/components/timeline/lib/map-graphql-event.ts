import type { GT } from '@/api'
import type {
  TimelineDecisionEvent,
  TimelineEvent,
  TimelineTouchedRef,
} from '../types'

type GraphqlTimelineEvent =
  GT.ServiceTimelineEventsQuery['serviceTimelineEvents'][number]

export function mapGraphqlTimelineEvent(
  row: GraphqlTimelineEvent
): TimelineEvent {
  const touches: TimelineTouchedRef[] = row.touches.map((t) => ({
    id: t.id,
    label: t.label,
    kind: t.kind === 'node' ? 'node' : 'service',
  }))

  const base = {
    id: row.id,
    title: row.title,
    summary: row.summary,
    date: row.eventDate,
    touches,
    sourceLabel: row.sourceLabel ?? undefined,
    sourceUrl: row.sourceUrl ?? undefined,
    isAgentSummarized: row.isAgentSummarized,
    origin: row.origin === 'auto' ? ('auto' as const) : ('manual' as const),
    attachment: row.attachmentUrl
      ? {
          assetId: row.attachmentAssetId ?? undefined,
          fileName: row.attachmentFileName ?? 'attachment',
          fileType: row.attachmentFileType ?? '',
          url: row.attachmentUrl,
        }
      : undefined,
  }

  if (row.type === 'decision') {
    return {
      ...base,
      type: 'decision',
      adrNumber: row.adrNumber ?? '',
      status:
        (row.decisionStatus as TimelineDecisionEvent['status'] | null) ??
        'accepted',
    }
  }
  if (row.type === 'incident') {
    return { ...base, type: 'incident' }
  }
  return { ...base, type: 'release', version: row.version ?? 'unversioned' }
}
