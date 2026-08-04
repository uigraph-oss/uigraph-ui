import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { Search, X } from 'lucide-react'
import { PROVIDERS } from '../constants/providers'
import {
  RESOURCE_TYPE_ORDER,
  RESOURCE_TYPES,
} from '../constants/resource-types'
import type { ResourceFilters } from '../types'

export function ResourceFilterBar({
  filters,
  onFiltersChange,
  availableRegions,
  focusChip,
}: {
  filters: ResourceFilters
  onFiltersChange: (partial: Partial<ResourceFilters>) => void
  availableRegions: string[]
  focusChip: { label: string; onClear: () => void } | null
}) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <ToggleGroup
        type="single"
        value={filters.provider}
        onValueChange={(value) =>
          value &&
          onFiltersChange({ provider: value as ResourceFilters['provider'] })
        }
        variant="outline"
      >
        <ToggleGroupItem value="all" className="px-3 text-xs">
          All
        </ToggleGroupItem>
        {(['aws', 'azure', 'gcp'] as const).map((p) => (
          <ToggleGroupItem key={p} value={p} className="px-3 text-xs">
            {PROVIDERS[p].label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>

      <ToggleGroup
        type="single"
        value={filters.environment}
        onValueChange={(value) =>
          value &&
          onFiltersChange({
            environment: value as ResourceFilters['environment'],
          })
        }
        variant="outline"
      >
        <ToggleGroupItem value="all" className="px-3 text-xs">
          All Envs
        </ToggleGroupItem>
        <ToggleGroupItem value="production" className="px-3 text-xs">
          Prod
        </ToggleGroupItem>
        <ToggleGroupItem value="staging" className="px-3 text-xs">
          Staging
        </ToggleGroupItem>
        <ToggleGroupItem value="development" className="px-3 text-xs">
          Dev
        </ToggleGroupItem>
      </ToggleGroup>

      <Select
        value={filters.type}
        onValueChange={(value) =>
          onFiltersChange({ type: value as ResourceFilters['type'] })
        }
      >
        <SelectTrigger className="w-40">
          <SelectValue placeholder="Type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All types</SelectItem>
          {RESOURCE_TYPE_ORDER.map((type) => (
            <SelectItem key={type} value={type}>
              {RESOURCE_TYPES[type].label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.region}
        onValueChange={(value) =>
          onFiltersChange({ region: value as ResourceFilters['region'] })
        }
      >
        <SelectTrigger className="w-40">
          <SelectValue placeholder="Region" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All regions</SelectItem>
          {availableRegions.map((region) => (
            <SelectItem key={region} value={region}>
              {region}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="relative">
        <Search className="text-paragraph absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2" />
        <Input
          value={filters.search}
          onChange={(e) => onFiltersChange({ search: e.target.value })}
          placeholder="Search resources or tags..."
          className="w-56 pl-8"
        />
      </div>

      {focusChip ? (
        <button
          type="button"
          onClick={focusChip.onClear}
          className="bg-primary/10 text-primary inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium"
        >
          Filtered by {focusChip.label}
          <X className="size-3" />
        </button>
      ) : null}
    </div>
  )
}
