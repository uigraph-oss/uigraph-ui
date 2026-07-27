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
import { Check, ChevronsUpDown, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import { ML_STUDIO_EVALUATIONS } from '../../api/evaluations'
import { useMetricColumns } from '../../hooks/use-metric-columns'
import { MetricChips } from '../metric-chips'

export function EvidenceEvaluationsSelect({
  value,
  onChange,
}: {
  value: string[]
  onChange: (evaluationIds: string[]) => void
}) {
  const orgId = useCurrentOrganization()?.id
  const evaluationsQuery = useQuery(ML_STUDIO_EVALUATIONS, {
    fetchPolicy: 'cache-and-network',
    skip: !orgId,
    variables: { orgId: orgId! },
  })
  const evaluations = useMemo(
    () => evaluationsQuery.data?.mlEvaluations.evaluations ?? [],
    [evaluationsQuery.data]
  )
  const [open, setOpen] = useState(false)

  const availableMetricKeys = useMemo(() => {
    const keys: string[] = []
    for (const evaluation of evaluations) {
      for (const key of Object.keys(
        (evaluation.metrics ?? {}) as Record<string, number>
      )) {
        if (!keys.includes(key)) {
          keys.push(key)
        }
      }
    }
    return keys
  }, [evaluations])

  const metricColumns = useMetricColumns('ml_evaluation', availableMetricKeys)

  const evaluationById = useMemo(() => {
    const map: Record<string, (typeof evaluations)[number]> = {}
    for (const e of evaluations) {
      map[e.id] = e
    }
    return map
  }, [evaluations])

  function toggle(evaluationId: string) {
    if (value.includes(evaluationId)) {
      onChange(value.filter((id) => id !== evaluationId))
      return
    }
    onChange([...value, evaluationId])
  }

  function remove(evaluationId: string) {
    onChange(value.filter((id) => id !== evaluationId))
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
                  Select evidence evaluations
                </span>
              )}
              {value.map((evaluationId) => {
                const evaluation = evaluationById[evaluationId]
                return (
                  <Badge
                    key={evaluationId}
                    variant="secondary"
                    className="gap-1"
                  >
                    {evaluation ? evaluation.name : evaluationId}
                    <span
                      role="button"
                      tabIndex={0}
                      className="hover:text-white/70"
                      onClick={(e) => {
                        e.stopPropagation()
                        remove(evaluationId)
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault()
                          e.stopPropagation()
                          remove(evaluationId)
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
          onWheel={(e) => e.stopPropagation()}
        >
          <Command>
            <CommandInput placeholder="Search evaluations by id or name..." />
            <CommandList>
              <CommandEmpty>No evaluations found.</CommandEmpty>
              <CommandGroup heading="Evaluations">
                {evaluations.map((evaluation) => {
                  const selected = value.includes(evaluation.id)
                  return (
                    <CommandItem
                      key={evaluation.id}
                      value={`${evaluation.name} ${evaluation.id}`}
                      onSelect={() => toggle(evaluation.id)}
                    >
                      <Check
                        className={cn(
                          'size-4',
                          selected ? 'opacity-100' : 'opacity-0'
                        )}
                      />
                      <div className="flex flex-1 flex-col">
                        <span>{evaluation.name}</span>
                        <span className="text-muted-foreground text-xs">
                          {evaluation.modelName} · {evaluation.version}
                        </span>
                      </div>
                      <MetricChips
                        metrics={
                          (evaluation.metrics ?? {}) as Record<string, number>
                        }
                        columns={metricColumns.columns}
                      />
                      <Badge variant="secondary">{evaluation.type}</Badge>
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
