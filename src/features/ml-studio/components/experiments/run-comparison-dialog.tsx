'use client'

import { BetterDialogContent } from '@/components/better-dialog'
import { BetterTabController, useBetterTabs } from '@/hooks/use-better-tabs'
import { ChartColumnIcon, SlidersHorizontalIcon } from 'lucide-react'
import type { Run } from '../../types'
import { RunValueBarChart } from '../metric-chart'

export function RunComparisonDialog({ runs }: { runs: Run[] }) {
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

  return (
    <BetterDialogContent
      title="Compare runs"
      description={runs.map((r) => r.name).join(' · ')}
      className="flex flex-col gap-8"
    >
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
    </BetterDialogContent>
  )
}
