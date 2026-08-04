import { BetterDialogContent } from '@/components/better-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'
import { ExternalLink, Pencil, Sparkles, Trash2 } from 'lucide-react'
import {
  AGENT_SUMMARIZED_BADGE_STYLE,
  DECISION_STATUS_STYLES,
  MANUAL_BADGE_STYLE,
  TYPE_BADGE_STYLES,
  TYPE_LABEL,
} from './constants'
import { TimelineDocPreview } from './timeline-doc-preview'
import type { TimelineEvent } from './types'

export function TimelineEventDetailDialog({
  event,
  onEdit,
  onDelete,
}: {
  event: TimelineEvent
  onEdit: () => void
  onDelete: () => void
}) {
  const heading =
    event.type === 'release'
      ? `${event.version} — ${event.title}`
      : event.type === 'decision'
        ? `${event.adrNumber} — ${event.title}`
        : event.title

  return (
    <BetterDialogContent
      title={heading}
      description={`${TYPE_LABEL[event.type]} · ${format(new Date(event.date), 'MMM d, yyyy')}`}
      footerCancel="Close"
    >
      <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
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
            <Badge
              className={`rounded-md border font-medium ${event.origin === 'manual' ? MANUAL_BADGE_STYLE : 'border-stock bg-shading/60 text-paragraph'}`}
            >
              {event.origin === 'manual'
                ? 'manually added'
                : 'synced from repo'}
            </Badge>
          </div>

          <div className="flex shrink-0 items-center gap-1.5">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onEdit}
              className="text-muted-foreground hover:text-foreground h-8 px-2.5"
            >
              <Pencil className="size-3.5" />
              Edit
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onDelete}
              className="text-muted-foreground hover:text-destructive h-8 px-2.5"
            >
              <Trash2 className="size-3.5" />
              Delete
            </Button>
          </div>
        </div>

        <div className="space-y-1.5">
          <h5 className="text-foreground text-xs font-semibold tracking-wide uppercase">
            Summary
          </h5>
          <p className="text-foreground/90 text-sm leading-relaxed">
            {event.summary}
          </p>
        </div>

        {event.sourceUrl ? (
          <div className="space-y-1.5">
            <h5 className="text-foreground text-xs font-semibold tracking-wide uppercase">
              Source
            </h5>
            <a
              href={event.sourceUrl}
              target="_blank"
              rel="noreferrer"
              className="text-primary inline-flex items-center gap-1.5 text-sm hover:underline"
            >
              {event.sourceLabel || event.sourceUrl}
              <ExternalLink className="size-3.5" />
            </a>
          </div>
        ) : null}

        {event.touches.length > 0 ? (
          <div className="space-y-1.5">
            <h5 className="text-foreground text-xs font-semibold tracking-wide uppercase">
              Touches
            </h5>
            <div className="flex flex-wrap gap-1.5">
              {event.touches.map((touch) => (
                <Badge
                  key={touch.id}
                  variant="outline"
                  className="border-stock bg-shading/60 text-paragraph rounded-md text-xs font-normal"
                >
                  {touch.label}
                </Badge>
              ))}
            </div>
          </div>
        ) : null}

        {event.attachment ? (
          <div className="space-y-1.5">
            <h5 className="text-foreground text-xs font-semibold tracking-wide uppercase">
              Document
            </h5>
            <TimelineDocPreview attachment={event.attachment} />
          </div>
        ) : null}
      </div>
    </BetterDialogContent>
  )
}
