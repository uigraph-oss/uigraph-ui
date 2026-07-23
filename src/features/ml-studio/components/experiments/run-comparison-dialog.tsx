'use client'

import { BetterDialogContent } from '@/components/better-dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { Run } from '../../types'
import { MetricBarChart, MetricLineChart } from '../metric-chart'
import { InfoRow, Panel } from '../panel'
import { StatusBadge } from '../status-badge'

export function RunComparisonDialog({ runs }: { runs: Run[] }) {
  const paramKeys = Array.from(
    new Set(runs.flatMap((r) => Object.keys(r.parameters)))
  )
  const metricKeys = Array.from(
    new Set(runs.flatMap((r) => Object.keys(r.metrics)))
  )
  const lossSeries = Object.fromEntries(
    runs.map((r) => [r.name, r.series.loss || []])
  )
  const metricData = metricKeys.map((key) => {
    const row: Record<string, string | number> = { label: key }
    runs.forEach((r) => {
      if (r.metrics[key] !== undefined) {
        row[r.name] = r.metrics[key]
      }
    })
    return row
  })

  return (
    <BetterDialogContent
      title="Compare runs"
      description={runs.map((r) => r.name).join(' · ')}
      className="flex flex-col gap-5"
    >
      <Panel title="Overview">
        <div className="grid grid-cols-2 gap-5 md:grid-cols-4">
          {runs.map((r) => (
            <InfoRow key={r.id} label={r.name}>
              <StatusBadge value={r.status} />
            </InfoRow>
          ))}
        </div>
      </Panel>

      <Panel title="Parameters">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Parameter</TableHead>
              {runs.map((r) => (
                <TableHead key={r.id}>{r.name}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paramKeys.map((key) => (
              <TableRow key={key}>
                <TableCell className="text-[#828DA3]">{key}</TableCell>
                {runs.map((r) => (
                  <TableCell key={r.id} className="font-mono text-[#F4F7FC]">
                    {r.parameters[key] !== undefined
                      ? String(r.parameters[key])
                      : '—'}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Panel>

      <Panel
        title="Metrics"
        description="Final value per metric, grouped by run."
      >
        <MetricBarChart
          data={metricData}
          metricKeys={runs.map((r) => r.name)}
          className="aspect-[3/1] w-full"
        />
      </Panel>

      <Panel title="Loss curves" description="Overlaid time-series per run.">
        <MetricLineChart series={lossSeries} className="aspect-[3/1] w-full" />
      </Panel>
    </BetterDialogContent>
  )
}
