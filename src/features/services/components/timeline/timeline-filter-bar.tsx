import { Input } from '@/components/ui/input'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import type { TimelinePeriod, TimelineTypeFilter } from './types'

const TYPES: { value: TimelineTypeFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'release', label: 'Release' },
  { value: 'decision', label: 'Decision' },
  { value: 'incident', label: 'Incident' },
]

const PERIODS: { value: TimelinePeriod; label: string }[] = [
  { value: '7d', label: '7d' },
  { value: '30d', label: '30d' },
  { value: '90d', label: '90d' },
  { value: '1y', label: '1y' },
  { value: 'all', label: 'All time' },
]

export function TimelineFilterBar({
  type,
  period,
  search,
  onTypeChange,
  onPeriodChange,
  onSearchChange,
}: {
  type: TimelineTypeFilter
  period: TimelinePeriod
  search: string
  onTypeChange: (type: TimelineTypeFilter) => void
  onPeriodChange: (period: TimelinePeriod) => void
  onSearchChange: (search: string) => void
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex flex-wrap items-center gap-3">
        <ToggleGroup
          type="single"
          value={type}
          onValueChange={(value) =>
            value && onTypeChange(value as TimelineTypeFilter)
          }
          variant="outline"
        >
          {TYPES.map((t) => (
            <ToggleGroupItem
              key={t.value}
              value={t.value}
              className="px-4 text-xs"
            >
              {t.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>

        <ToggleGroup
          type="single"
          value={period}
          onValueChange={(value) =>
            value && onPeriodChange(value as TimelinePeriod)
          }
          variant="outline"
        >
          {PERIODS.map((p) => (
            <ToggleGroupItem
              key={p.value}
              value={p.value}
              className="px-4 text-xs"
            >
              {p.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>

      <Input
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Search timeline..."
        className="w-64"
      />
    </div>
  )
}
