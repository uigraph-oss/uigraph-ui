'use client'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useMlStudioData } from '../../contexts/ml-studio-data-context'
import { useModelContext } from '../../contexts/model-context'
import { MetricLineChart } from '../metric-chart'
import { Panel } from '../panel'

export function ModelMetricsTab() {
  const { selectedVersion } = useModelContext()
  const { runs } = useMlStudioData()

  const latestRun = runs.find((r) => r.id === selectedVersion?.runId)
  const metrics = Object.entries(latestRun?.metrics ?? {})
  const series = latestRun?.series ?? {}
  const hasSeries = Object.values(series).some((points) => points.length > 0)

  if (!latestRun) {
    return (
      <div className="grid grid-cols-1 gap-6 p-6">
        <Panel title="Metrics">
          <p className="text-sm text-[#586378]">
            No run is associated with this version.
          </p>
        </Panel>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-6 p-6">
      <Panel
        title="Training curves"
        description="Metric values logged per training step."
      >
        {hasSeries ? (
          <MetricLineChart series={series} className="aspect-[16/6] w-full" />
        ) : (
          <p className="text-sm text-[#586378]">
            No per-step metrics were logged for this run.
          </p>
        )}
      </Panel>

      <Panel
        title="All metrics"
        description="Every scalar metric captured for this version."
      >
        {metrics.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Metric</TableHead>
                <TableHead>Value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {metrics.map(([key, value]) => (
                <TableRow key={key}>
                  <TableCell className="text-[#828DA3]">
                    {key.replace(/_/g, ' ')}
                  </TableCell>
                  <TableCell className="font-mono text-[#F4F7FC]">
                    {value}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="text-sm text-[#586378]">No metrics recorded.</p>
        )}
      </Panel>
    </div>
  )
}
