import { subDays } from 'date-fns'
import type {
  TimelineEvent,
  TimelinePeriod,
  TimelineTypeFilter,
} from '../types'

const PERIOD_DAYS: Record<Exclude<TimelinePeriod, 'all'>, number> = {
  '7d': 7,
  '30d': 30,
  '90d': 90,
  '1y': 365,
}

export interface TimelineFilters {
  type: TimelineTypeFilter
  period: TimelinePeriod
  search: string
}

export function filterTimelineEvents(
  events: TimelineEvent[],
  { type, period, search }: TimelineFilters
): TimelineEvent[] {
  const searchTerm = search.trim().toLowerCase()
  const cutoff =
    period === 'all' ? null : subDays(new Date(), PERIOD_DAYS[period])

  return events
    .filter((event) => type === 'all' || event.type === type)
    .filter((event) => !cutoff || new Date(event.date) >= cutoff)
    .filter((event) => {
      if (!searchTerm) return true
      const haystack = [
        event.title,
        event.summary,
        event.sourceLabel,
        ...event.touches.map((t) => t.label),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      return haystack.includes(searchTerm)
    })
    .sort((a, b) => +new Date(b.date) - +new Date(a.date))
}
