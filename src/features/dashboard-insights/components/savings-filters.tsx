import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'

const PERIODS = [
  { value: '1d', label: 'Today' },
  { value: '7d', label: '7d' },
  { value: '30d', label: '30d' },
  { value: '1y', label: '1y' },
]

export type ModelOption = { value: string; label: string }

type SavingsFiltersProps = {
  period: string
  onPeriodChange: (period: string) => void
  modelId: string
  onModelChange: (modelId: string) => void
  modelOptions: ModelOption[]
}

export function SavingsFilters({
  period,
  onPeriodChange,
  modelId,
  onModelChange,
  modelOptions,
}: SavingsFiltersProps) {
  return (
    <div className="flex items-center gap-3">
      <ToggleGroup
        type="single"
        value={period}
        onValueChange={(value) => value && onPeriodChange(value)}
        variant="outline"
      >
        {PERIODS.map((p) => (
          <ToggleGroupItem key={p.value} value={p.value} aria-label={p.label}>
            {p.label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>

      <Select value={modelId} onValueChange={onModelChange}>
        <SelectTrigger className="h-10 w-[180px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Models</SelectItem>
          {modelOptions.map((m) => (
            <SelectItem key={m.value} value={m.value}>
              {m.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
