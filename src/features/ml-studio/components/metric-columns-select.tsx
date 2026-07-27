'use client'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { ListChecks, ListX, MoreHorizontal, RotateCcw } from 'lucide-react'

export function MetricColumnsSelect({
  options,
  columns,
  onToggle,
  onSelectAll,
  onClear,
  onReset,
}: {
  options: string[]
  columns: string[]
  onToggle: (key: string) => void
  onSelectAll: () => void
  onClear: () => void
  onReset: () => void
}) {
  return (
    <DropdownMenu>
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-foreground h-8 w-8 shrink-0"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent side="left" sideOffset={8}>
          Configure columns
        </TooltipContent>
      </Tooltip>
      <DropdownMenuContent
        align="end"
        className="max-h-80 w-64 overflow-y-auto"
      >
        {options.length === 0 ? (
          <div className="text-muted-foreground px-3 py-4 text-xs">
            No metrics logged yet.
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2 p-1">
              <button
                type="button"
                onClick={onClear}
                className="border-stock text-foreground/80 hover:bg-accent hover:text-foreground flex flex-1 items-center justify-between gap-2 rounded-[0.5rem] border px-3 py-2 text-xs"
              >
                Clear
                <ListX className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={onSelectAll}
                className="border-stock text-foreground/80 hover:bg-accent hover:text-foreground flex flex-1 items-center justify-between gap-2 rounded-[0.5rem] border px-3 py-2 text-xs"
              >
                Select all
                <ListChecks className="h-3.5 w-3.5" />
              </button>
            </div>
            <DropdownMenuSeparator />
            {options.map((key) => (
              <DropdownMenuCheckboxItem
                key={key}
                checked={columns.includes(key)}
                onSelect={(event) => event.preventDefault()}
                onCheckedChange={() => onToggle(key)}
                className="capitalize"
              >
                {key.replace(/_/g, ' ')}
              </DropdownMenuCheckboxItem>
            ))}
            <DropdownMenuSeparator />
            <button
              type="button"
              onClick={onReset}
              className="text-foreground/80 hover:bg-accent hover:text-foreground flex w-full items-center justify-center gap-2 rounded-[0.5rem] px-3 py-2 text-xs"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset columns
            </button>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
