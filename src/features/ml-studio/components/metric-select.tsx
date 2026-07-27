'use client'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ChevronDown, ListChecks, ListX } from 'lucide-react'

export function MetricSelect({
  metricKeys,
  hiddenKeys,
  onToggle,
  onShowAll,
  onHideAll,
}: {
  metricKeys: string[]
  hiddenKeys: string[]
  onToggle: (key: string) => void
  onShowAll: () => void
  onHideAll: () => void
}) {
  const visibleCount = metricKeys.filter(
    (key) => !hiddenKeys.includes(key)
  ).length

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="border-stock text-foreground/80 h-[2.7938125rem] w-48 justify-between rounded-[0.80315625rem] bg-transparent px-4 font-normal"
        >
          {visibleCount === metricKeys.length
            ? 'All metrics'
            : `${visibleCount} of ${metricKeys.length} metrics`}
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="max-h-80 w-64 overflow-y-auto"
      >
        <div className="flex items-center gap-2 p-1">
          <button
            type="button"
            onClick={onHideAll}
            className="border-stock text-foreground/80 hover:bg-accent hover:text-foreground flex flex-1 items-center justify-between gap-2 rounded-[0.5rem] border px-3 py-2 text-xs"
          >
            Clear
            <ListX className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={onShowAll}
            className="border-stock text-foreground/80 hover:bg-accent hover:text-foreground flex flex-1 items-center justify-between gap-2 rounded-[0.5rem] border px-3 py-2 text-xs"
          >
            Select all
            <ListChecks className="h-3.5 w-3.5" />
          </button>
        </div>
        <DropdownMenuSeparator />
        {metricKeys.map((key) => (
          <DropdownMenuCheckboxItem
            key={key}
            checked={!hiddenKeys.includes(key)}
            onSelect={(event) => event.preventDefault()}
            onCheckedChange={() => onToggle(key)}
          >
            {key.replace(/_/g, ' ')}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
