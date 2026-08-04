import { cn } from '@/lib/utils'
import { Circle } from 'lucide-react'
import { TimelineEventCard } from './timeline-event-card'
import type { TimelineEvent } from './types'

export function TimelineList({
  events,
  onSelectEvent,
}: {
  events: TimelineEvent[]
  onSelectEvent: (event: TimelineEvent) => void
}) {
  return (
    <ol className="relative flex flex-col">
      {events.map((event, i) => (
        <TimelineRow
          key={event.id}
          isLast={i === events.length - 1}
          event={event}
          onSelectEvent={onSelectEvent}
        />
      ))}
    </ol>
  )
}

function TimelineRow({
  isLast,
  event,
  onSelectEvent,
}: {
  isLast: boolean
  event: TimelineEvent
  onSelectEvent: (event: TimelineEvent) => void
}) {
  return (
    <li className="relative flex gap-3 pb-6 last:pb-0">
      <div className="relative flex flex-col items-center">
        <span
          className={cn(
            'border-stock bg-shading text-paragraph',
            'z-10 flex size-7 shrink-0 items-center justify-center rounded-full border'
          )}
        >
          <Circle className="size-3" />
        </span>
        {!isLast && (
          <span className="bg-stock absolute top-8 bottom-[-24px] w-px" />
        )}
      </div>

      <TimelineEventCard event={event} onOpenDetail={onSelectEvent} />
    </li>
  )
}
