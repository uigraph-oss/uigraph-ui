'use client'

import { Badge } from '@/components/ui/badge'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { useCurrentOrganization } from '@/store/auth-store'
import { useQuery } from '@apollo/client'
import { Check, ChevronsUpDown, Plus, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import { ML_STUDIO_EXPERIMENTS, ML_STUDIO_RUNS } from '../../api/ml-studio'
import { StatusBadge } from '../status-badge'

export function EvidenceRunsSelect({
  value,
  onChange,
}: {
  value: string[]
  onChange: (runIds: string[]) => void
}) {
  const orgId = useCurrentOrganization()?.id
  const runsQuery = useQuery(ML_STUDIO_RUNS, {
    fetchPolicy: 'cache-and-network',
    skip: !orgId,
    variables: { orgId: orgId! },
  })
  const experimentsQuery = useQuery(ML_STUDIO_EXPERIMENTS, {
    fetchPolicy: 'cache-and-network',
    skip: !orgId,
    variables: { orgId: orgId! },
  })
  const runs = useMemo(() => runsQuery.data?.mlRuns ?? [], [runsQuery.data])
  const experiments = useMemo(
    () => experimentsQuery.data?.mlExperiments ?? [],
    [experimentsQuery.data]
  )
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')

  const experimentName = useMemo(() => {
    const map: Record<string, string> = {}
    for (const e of experiments) {
      map[e.id] = e.name
    }
    return map
  }, [experiments])

  const runById = useMemo(() => {
    const map: Record<string, (typeof runs)[number]> = {}
    for (const r of runs) {
      map[r.id] = r
    }
    return map
  }, [runs])

  function toggle(runId: string) {
    if (value.includes(runId)) {
      onChange(value.filter((id) => id !== runId))
      return
    }
    onChange([...value, runId])
  }

  function remove(runId: string) {
    onChange(value.filter((id) => id !== runId))
  }

  const normalizedQuery = query.trim()
  const queryMatchesRun = runs.some(
    (r) =>
      r.id.toLowerCase() === normalizedQuery.toLowerCase() ||
      r.name.toLowerCase() === normalizedQuery.toLowerCase()
  )
  const showAddNewRun =
    normalizedQuery.length > 0 &&
    !queryMatchesRun &&
    !value.includes(normalizedQuery)

  function addNewRun() {
    onChange([...value, normalizedQuery])
    setQuery('')
  }

  return (
    <div className="flex flex-col gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="flex min-h-[56px] w-full items-center justify-between gap-2 rounded-[16px] border border-[#2A3242] bg-transparent px-6 py-2 text-left text-sm focus:outline-none"
          >
            <div className="flex flex-1 flex-wrap items-center gap-1">
              {value.length === 0 && (
                <span className="text-muted-foreground">
                  Select evidence runs
                </span>
              )}
              {value.map((runId) => {
                const run = runById[runId]
                return (
                  <Badge key={runId} variant="secondary" className="gap-1">
                    {run ? run.name : runId}
                    <span
                      role="button"
                      tabIndex={0}
                      className="hover:text-white/70"
                      onClick={(e) => {
                        e.stopPropagation()
                        remove(runId)
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault()
                          e.stopPropagation()
                          remove(runId)
                        }
                      }}
                    >
                      <X className="size-3" />
                    </span>
                  </Badge>
                )
              })}
            </div>
            <ChevronsUpDown className="text-muted-foreground size-4 shrink-0 opacity-50" />
          </button>
        </PopoverTrigger>
        <PopoverContent
          className="w-(--radix-popover-trigger-width) p-0"
          align="start"
        >
          <Command
            filter={(itemValue, search) => {
              if (itemValue === '__add_new__') return 1
              return itemValue.toLowerCase().includes(search.toLowerCase())
                ? 1
                : 0
            }}
          >
            <CommandInput
              placeholder="Search runs by id or name..."
              value={query}
              onValueChange={setQuery}
            />
            <CommandList>
              {!showAddNewRun && <CommandEmpty>No runs found.</CommandEmpty>}
              {showAddNewRun && (
                <CommandGroup>
                  <CommandItem value="__add_new__" onSelect={addNewRun}>
                    <Plus className="size-4" />
                    Add new run “{normalizedQuery}”
                  </CommandItem>
                </CommandGroup>
              )}
              <CommandGroup heading="Runs">
                {runs.map((run) => {
                  const selected = value.includes(run.id)
                  return (
                    <CommandItem
                      key={run.id}
                      value={`${run.name} ${run.id}`}
                      onSelect={() => toggle(run.id)}
                    >
                      <Check
                        className={cn(
                          'size-4',
                          selected ? 'opacity-100' : 'opacity-0'
                        )}
                      />
                      <div className="flex flex-1 flex-col">
                        <span>{run.name}</span>
                        {experimentName[run.experimentId] && (
                          <span className="text-muted-foreground text-xs">
                            {experimentName[run.experimentId]}
                          </span>
                        )}
                      </div>
                      <StatusBadge value={run.status} />
                    </CommandItem>
                  )
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}
