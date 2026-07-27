'use client'

import { BetterDialogContent } from '@/components/better-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { BetterTabController, useBetterTabs } from '@/hooks/use-better-tabs'
import { formatToHumanReadableMS } from '@/utils/time'
import { formatDistanceToNow } from 'date-fns'
import {
  ChartColumnIcon,
  ClockIcon,
  PlusIcon,
  SlidersHorizontalIcon,
  XIcon,
} from 'lucide-react'
import { RunValueBarChart } from '../metric-chart'

export type ComparableEvaluation = {
  id: string
  name: string
  type: string
  modelName: string
  version: string
  startedAt: string
  endedAt: string | null
  parameters: Record<string, string | number>
  metrics: Record<string, number>
}

function evaluationDurationMS(evaluation: ComparableEvaluation): number | null {
  const start = Date.parse(evaluation.startedAt)
  if (Number.isNaN(start)) return null
  if (!evaluation.endedAt) return null

  const end = Date.parse(evaluation.endedAt)
  if (Number.isNaN(end)) return null
  if (end < start) return null
  return end - start
}

function formatEvaluationDuration(evaluation: ComparableEvaluation): string {
  const ms = evaluationDurationMS(evaluation)
  if (ms === null) return '—'
  return formatToHumanReadableMS(ms)
}

export function EvaluationComparisonDialog({
  evaluations,
  availableEvaluations,
  onToggleEvaluation,
}: {
  evaluations: ComparableEvaluation[]
  availableEvaluations: ComparableEvaluation[]
  onToggleEvaluation: (id: string) => void
}) {
  const metricKeys = Array.from(
    new Set(evaluations.flatMap((e) => Object.keys(e.metrics)))
  )
  const paramKeys = Array.from(
    new Set(evaluations.flatMap((e) => Object.keys(e.parameters)))
  )

  const [metricControl, activeMetric, setActiveMetric] = useBetterTabs(
    metricKeys.map((key) => ({ id: key, label: key }))
  )
  const [paramControl, activeParam, setActiveParam] = useBetterTabs(
    paramKeys.map((key) => ({ id: key, label: key }))
  )

  const metricData = evaluations
    .filter((e) => e.metrics[activeMetric] !== undefined)
    .map((e) => ({ name: e.name, value: e.metrics[activeMetric] }))

  const paramData = evaluations
    .filter((e) => Number.isFinite(Number(e.parameters[activeParam])))
    .map((e) => ({ name: e.name, value: Number(e.parameters[activeParam]) }))

  const durationData = evaluations.flatMap((e) => {
    const durationMS = evaluationDurationMS(e)
    if (durationMS === null) return []
    return [{ name: e.name, value: durationMS / 1000 }]
  })

  const addableEvaluations = availableEvaluations.filter(
    (e) => !evaluations.some((s) => s.id === e.id)
  )

  return (
    <BetterDialogContent
      title="Compare evaluations"
      description="Compare metrics and parameters across the selected evaluation runs."
      className="flex flex-col gap-12"
    >
      <div className="flex flex-col gap-2">
        <div className="ml-1 flex items-center justify-between gap-4">
          <h3 className="font-semibold text-[#F4F7FC]">Evaluation runs</h3>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="inline-flex">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      preset="outline"
                      className="h-9"
                      disabled={addableEvaluations.length === 0}
                    >
                      <PlusIcon />
                      Add evaluation
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="max-h-72 overflow-auto"
                  >
                    {addableEvaluations.map((e) => (
                      <DropdownMenuItem
                        key={e.id}
                        onClick={() => onToggleEvaluation(e.id)}
                      >
                        {e.name}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </span>
            </TooltipTrigger>
            {addableEvaluations.length === 0 && (
              <TooltipContent>
                No other evaluations available to add.
              </TooltipContent>
            )}
          </Tooltip>
        </div>
        <div className="flex flex-col divide-y divide-[#2A3242] rounded-xl border border-[#2A3242]">
          {evaluations.map((e) => (
            <div
              key={e.id}
              className="flex items-center justify-between gap-4 px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-[#F4F7FC]">
                  {e.name}
                </span>
                <Badge className="border-stock rounded-md border bg-[#1E2533] text-[#828DA3]">
                  {e.type}
                </Badge>
                <span className="text-sm text-[#828DA3]">
                  {e.modelName}{' '}
                  <span className="text-[#F4F7FC]">v{e.version}</span>
                </span>
              </div>
              <div className="flex items-center gap-6 text-sm text-[#828DA3]">
                <span>
                  {e.startedAt
                    ? `Evaluated ${formatDistanceToNow(new Date(e.startedAt), {
                        addSuffix: true,
                      })}`
                    : '—'}
                </span>
                <span>{formatEvaluationDuration(e)}</span>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="inline-flex">
                      <button
                        type="button"
                        onClick={() => onToggleEvaluation(e.id)}
                        disabled={evaluations.length <= 2}
                        className="flex size-5 items-center justify-center rounded-full text-[#828DA3] transition-colors hover:bg-red-500/15 hover:text-red-400 disabled:opacity-40"
                      >
                        <XIcon className="size-3.5" />
                      </button>
                    </span>
                  </TooltipTrigger>
                  {evaluations.length <= 2 && (
                    <TooltipContent>
                      At least two evaluations are required to compare.
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
          {metricKeys.length > 4 ? (
            <Select value={activeMetric} onValueChange={setActiveMetric}>
              <SelectTrigger className="h-10 w-[280px] rounded-[12px]">
                <SelectValue placeholder="Select a metric" />
              </SelectTrigger>
              <SelectContent className="max-h-72">
                {metricKeys.map((key) => (
                  <SelectItem key={key} value={key}>
                    {key}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <BetterTabController control={metricControl} className="mx-0" />
          )}
        </div>
        <RunValueBarChart data={metricData} className="aspect-[3/1] w-full" />
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-4">
          <h3 className="flex items-center gap-2 font-semibold text-[#F4F7FC]">
            <SlidersHorizontalIcon className="size-4 text-[#828DA3]" />
            Parameters
          </h3>
          {paramKeys.length > 4 ? (
            <Select value={activeParam} onValueChange={setActiveParam}>
              <SelectTrigger className="h-10 w-[280px] rounded-[12px]">
                <SelectValue placeholder="Select a parameter" />
              </SelectTrigger>
              <SelectContent className="max-h-72">
                {paramKeys.map((key) => (
                  <SelectItem key={key} value={key}>
                    {key}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <BetterTabController control={paramControl} className="mx-0" />
          )}
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
          Evaluation duration (seconds)
        </h3>
        <RunValueBarChart data={durationData} className="aspect-[3/1] w-full" />
      </div>
    </BetterDialogContent>
  )
}
