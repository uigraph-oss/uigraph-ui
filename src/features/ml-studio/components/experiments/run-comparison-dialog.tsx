'use client'

import { BetterDialogContent } from '@/components/better-dialog'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { BetterTabController, useBetterTabs } from '@/hooks/use-better-tabs'
import { formatDistanceToNow } from 'date-fns'
import {
  ChartColumnIcon,
  ClockIcon,
  PlusIcon,
  SlidersHorizontalIcon,
  XIcon,
} from 'lucide-react'
import type { Run } from '../../types'
import { RunValueBarChart } from '../metric-chart'
import { StatusBadge } from '../status-badge'

function durationSeconds(run: Run) {
  if (run.startedAt && run.endedAt) {
    return (
      (new Date(run.endedAt).getTime() - new Date(run.startedAt).getTime()) /
      1000
    )
  }
  return 0
}

export function RunComparisonDialog({
  runs,
  availableRuns,
  onToggleRun,
}: {
  runs: Run[]
  availableRuns: Run[]
  onToggleRun: (id: string) => void
}) {
  const metricKeys = Array.from(
    new Set(runs.flatMap((r) => Object.keys(r.metrics)))
  )
  const paramKeys = Array.from(
    new Set(runs.flatMap((r) => Object.keys(r.parameters)))
  )

  const [metricControl, activeMetric] = useBetterTabs(
    metricKeys.map((key) => ({ id: key, label: key }))
  )
  const [paramControl, activeParam] = useBetterTabs(
    paramKeys.map((key) => ({ id: key, label: key }))
  )

  const metricData = runs
    .filter((r) => r.metrics[activeMetric] !== undefined)
    .map((r) => ({ name: r.name, value: r.metrics[activeMetric] }))

  const paramData = runs
    .filter((r) => Number.isFinite(Number(r.parameters[activeParam])))
    .map((r) => ({ name: r.name, value: Number(r.parameters[activeParam]) }))

  const durationData = runs.map((r) => ({
    name: r.name,
    value: durationSeconds(r),
  }))

  const addableRuns = availableRuns.filter(
    (r) => !runs.some((s) => s.id === r.id)
  )

  return (
    <BetterDialogContent
      title="Compare runs"
      description="Compare metrics and parameters across the selected runs."
      className="flex flex-col gap-12"
    >
      <div className="flex flex-col gap-2">
        <div className="ml-1 flex items-center justify-between gap-4">
          <h3 className="font-semibold text-[#F4F7FC]">Training runs</h3>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="inline-flex">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      preset="outline"
                      className="h-9"
                      disabled={addableRuns.length === 0}
                    >
                      <PlusIcon />
                      Add run
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="max-h-72 overflow-auto"
                  >
                    {addableRuns.map((r) => (
                      <DropdownMenuItem
                        key={r.id}
                        onClick={() => onToggleRun(r.id)}
                      >
                        {r.name}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </span>
            </TooltipTrigger>
            {addableRuns.length === 0 && (
              <TooltipContent>No other runs available to add.</TooltipContent>
            )}
          </Tooltip>
        </div>
        <div className="flex flex-col divide-y divide-[#2A3242] rounded-xl border border-[#2A3242]">
          {runs.map((r) => (
            <div
              key={r.id}
              className="flex items-center justify-between gap-4 px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-[#F4F7FC]">
                  {r.name}
                </span>
                <StatusBadge value={r.status} />
              </div>
              <div className="flex items-center gap-6 text-sm text-[#828DA3]">
                <span>
                  {r.startedAt
                    ? `Created ${formatDistanceToNow(new Date(r.startedAt), {
                        addSuffix: true,
                      })}`
                    : '—'}
                </span>
                <span>{r.duration}</span>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="inline-flex">
                      <button
                        type="button"
                        onClick={() => onToggleRun(r.id)}
                        disabled={runs.length <= 2}
                        className="flex size-5 items-center justify-center rounded-full text-[#828DA3] transition-colors hover:bg-red-500/15 hover:text-red-400 disabled:opacity-40"
                      >
                        <XIcon className="size-3.5" />
                      </button>
                    </span>
                  </TooltipTrigger>
                  {runs.length <= 2 && (
                    <TooltipContent>
                      At least two runs are required to compare.
                    </TooltipContent>
                  )}
                </Tooltip>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-4">
          <h3 className="flex items-center gap-2 font-semibold text-[#F4F7FC]">
            <ChartColumnIcon className="size-4 text-[#828DA3]" />
            Metrics
          </h3>
          <BetterTabController control={metricControl} className="mx-0" />
        </div>
        <RunValueBarChart data={metricData} className="aspect-[3/1] w-full" />
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-4">
          <h3 className="flex items-center gap-2 font-semibold text-[#F4F7FC]">
            <SlidersHorizontalIcon className="size-4 text-[#828DA3]" />
            Parameters
          </h3>
          <BetterTabController control={paramControl} className="mx-0" />
        </div>
        {paramData.length > 0 ? (
          <RunValueBarChart data={paramData} className="aspect-[3/1] w-full" />
        ) : (
          <p className="text-sm text-[#586378]">
            This parameter is not numeric and cannot be charted.
          </p>
        )}
      </div>

      <div className="flex flex-col gap-4">
        <h3 className="flex items-center gap-2 font-semibold text-[#F4F7FC]">
          <ClockIcon className="size-4 text-[#828DA3]" />
          Training duration (seconds)
        </h3>
        <RunValueBarChart data={durationData} className="aspect-[3/1] w-full" />
      </div>
    </BetterDialogContent>
  )
}
