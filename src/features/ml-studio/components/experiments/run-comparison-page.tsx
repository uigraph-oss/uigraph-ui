'use client'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { mockRuns } from '../../constants/mock-data'
import { MetricLineChart } from '../metric-chart'
import { InfoRow, Panel } from '../panel'
import { StatusBadge } from '../status-badge'

export function RunComparisonPage() {
  const [searchParams] = useSearchParams()
  const runIds = (searchParams.get('runs') || '').split(',').filter(Boolean)

  const runs = useMemo(
    () => mockRuns.filter((r) => runIds.includes(r.id)),
    [runIds]
  )

  if (runs.length < 2) {
    return (
      <div className="p-6 text-[#828DA3]">
        Select at least two runs to compare.
      </div>
    )
  }

  const paramKeys = Array.from(
    new Set(runs.flatMap((r) => Object.keys(r.parameters)))
  )
  const metricKeys = Array.from(
    new Set(runs.flatMap((r) => Object.keys(r.metrics)))
  )

  const lossSeries = Object.fromEntries(
    runs.map((r) => [r.name, r.series.loss || []])
  )

  return (
    <div className="flex flex-col gap-5 p-6">
      <div>
        <h2 className="text-xl font-semibold text-[#F4F7FC]">Compare runs</h2>
        <p className="mt-1 text-sm text-[#828DA3]">
          {runs.map((r) => r.name).join(' · ')}
        </p>
      </div>

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

      <Panel title="Metrics">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Metric</TableHead>
              {runs.map((r) => (
                <TableHead key={r.id}>{r.name}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {metricKeys.map((key) => (
              <TableRow key={key}>
                <TableCell className="text-[#828DA3]">{key}</TableCell>
                {runs.map((r) => (
                  <TableCell key={r.id} className="font-mono text-[#F4F7FC]">
                    {r.metrics[key] !== undefined ? r.metrics[key] : '—'}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Panel>

      <Panel title="Loss curves" description="Overlaid time-series per run.">
        <MetricLineChart series={lossSeries} className="aspect-[3/1] w-full" />
      </Panel>
    </div>
  )
}
