import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { ExternalLink, Sparkles } from 'lucide-react'
import {
  AGENT_SUMMARIZED_BADGE_STYLE,
  DECISION_STATUS_STYLES,
  MANUAL_BADGE_STYLE,
  TYPE_BADGE_STYLES,
  TYPE_ICON,
  TYPE_LABEL,
} from './constants'
import { TimelineDocThumbnail } from './timeline-doc-preview'
import type { TimelineEvent, TimelineTouchedRef } from './types'

export function TimelineEventCard({
  event,
  onOpenDetail,
}: {
  event: TimelineEvent
  onOpenDetail: (event: TimelineEvent) => void
}) {
  const Icon = TYPE_ICON[event.type]

  return (
    <div className="flex-1">
      <div className="flex min-h-7 flex-wrap items-center gap-2">
        <Icon className="text-paragraph size-3.5 shrink-0" />
        <button
          type="button"
          onClick={() => onOpenDetail(event)}
          className="text-foreground hover:text-primary text-left text-sm font-semibold underline-offset-2 hover:underline"
        >
          {event.type === 'release' ? `${event.version} — ` : null}
          {event.type === 'decision' ? `${event.adrNumber} — ` : null}
          {event.title}
        </button>
        <Badge
          className={`rounded-md border font-medium ${TYPE_BADGE_STYLES[event.type]}`}
        >
          {TYPE_LABEL[event.type]}
        </Badge>
        {event.type === 'decision' ? (
          <Badge
            className={`rounded-md border font-medium ${DECISION_STATUS_STYLES[event.status]}`}
          >
            {event.status}
          </Badge>
        ) : null}
        {event.isAgentSummarized ? (
          <Badge
            className={`gap-1 rounded-md border font-medium ${AGENT_SUMMARIZED_BADGE_STYLE}`}
          >
            <Sparkles className="size-3" />
            agent-summarized
          </Badge>
        ) : null}
        {event.origin === 'manual' ? (
          <Badge
            className={`rounded-md border font-medium ${MANUAL_BADGE_STYLE}`}
          >
            manually added
          </Badge>
        ) : null}
      </div>

      <p className="text-paragraph mt-0.5 line-clamp-1 text-xs">
        {event.summary}
      </p>

      <p className="text-paragraph mt-1 text-xs">
        {format(new Date(event.date), 'MMM d, yyyy')}
        {event.sourceUrl ? (
          <>
            <span className="px-1.5">·</span>
            <a
              href={event.sourceUrl}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="hover:text-primary inline-flex items-center gap-1"
            >
              {event.sourceLabel}
              <ExternalLink className="size-3" />
            </a>
          </>
        ) : null}
      </p>

      {event.touches.length > 0 ? (
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <span className="text-paragraph text-xs">Touches:</span>
          {event.touches.map((touch) => (
            <TouchedBadge key={touch.id} touch={touch} />
          ))}
        </div>
      ) : null}

      {event.attachment ? (
        <div className="mt-2">
          <TimelineDocThumbnail
            attachment={event.attachment}
            onClick={() => onOpenDetail(event)}
          />
        </div>
      ) : null}
    </div>
  )
}

function TouchedBadge({ touch }: { touch: TimelineTouchedRef }) {
  return (
    <Badge
      variant="outline"
      className="border-stock bg-shading/60 text-paragraph rounded-md text-xs font-normal"
    >
      {touch.label}
    </Badge>
  )
}
