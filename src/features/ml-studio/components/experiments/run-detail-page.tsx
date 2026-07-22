'use client'

import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { BetterTabController, useBetterTabs } from '@/hooks/use-better-tabs'
import { format } from 'date-fns'
import { useParams } from 'react-router-dom'
import { useMlStudioData } from '../../contexts/ml-studio-data-context'
import { MetricLineChart } from '../metric-chart'
import { InfoRow, Panel } from '../panel'
import { StatusBadge } from '../status-badge'

export function RunDetailPage() {
  const { runId } = useParams<{ runId: string }>()

  const { runs, artifacts: allArtifacts, datasets } = useMlStudioData()
  const run = runs.find((r) => r.id === runId)
  const [control, activeTab] = useBetterTabs([
    { id: 'params', label: 'Parameters' },
    { id: 'metrics', label: 'Metrics' },
  ])

  if (!run) {
    return <div className="p-6 text-[#828DA3]">Run not found.</div>
  }

  const artifacts = allArtifacts.filter((a) => run.artifactIds.includes(a.id))
  const dataset = datasets.find((d) => d.id === run.datasetId)

  return (
    <div className="flex flex-col gap-5 p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-[#F4F7FC]">{run.name}</h2>
          <p className="mt-1 text-sm text-[#586378]">
            {run.id} · {run.notes}
          </p>
        </div>
        <StatusBadge value={run.status} />
      </div>

      <Panel>
        <div className="grid grid-cols-2 gap-5 md:grid-cols-4">
          <InfoRow label="Started">
            {format(new Date(run.startedAt), 'PPpp')}
          </InfoRow>
          <InfoRow label="Duration">{run.duration}</InfoRow>
        </div>
      </Panel>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Panel>
          <BetterTabController control={control} />
          <div className="mt-4">
            {activeTab === 'params' && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Parameter</TableHead>
                    <TableHead>Value</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.entries(run.parameters).map(([key, value]) => (
                    <TableRow key={key}>
                      <TableCell className="text-[#828DA3]">{key}</TableCell>
                      <TableCell className="font-mono text-[#F4F7FC]">
                        {String(value)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
            {activeTab === 'metrics' && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Metric</TableHead>
                    <TableHead>Value</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.entries(run.metrics).map(([key, value]) => (
                    <TableRow key={key}>
                      <TableCell className="text-[#828DA3]">{key}</TableCell>
                      <TableCell className="font-mono text-[#F4F7FC]">
                        {value}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </Panel>

        <Panel
          title="Time-series metrics"
          description="Logged per training step."
        >
          <MetricLineChart
            series={run.series}
            className="aspect-[4/3] w-full"
          />
        </Panel>
      </div>

      <Panel title="Artifacts">
        {artifacts.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Format</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>URI</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {artifacts.map((a) => (
                <TableRow key={a.id}>
                  <TableCell className="font-medium text-[#F4F7FC]">
                    {a.name}
                  </TableCell>
                  <TableCell className="text-[#828DA3]">{a.type}</TableCell>
                  <TableCell className="text-[#828DA3]">{a.format}</TableCell>
                  <TableCell className="text-[#828DA3]">{a.size}</TableCell>
                  <TableCell className="font-mono text-xs text-[#586378]">
                    {a.uri}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="text-sm text-[#586378]">No artifacts attached.</p>
        )}
      </Panel>

      <Panel title="Input dataset">
        {dataset ? (
          <div className="flex flex-col gap-5">
            <div className="grid grid-cols-2 gap-5 md:grid-cols-4">
              <InfoRow label="Context">
                <Badge className="border-stock rounded-md border bg-[#1E2533] text-[#828DA3] capitalize">
                  {dataset.context}
                </Badge>
              </InfoRow>
              <InfoRow label="Name">{dataset.name}</InfoRow>
              <InfoRow label="Source">
                <span className="font-mono text-xs text-[#586378]">
                  {dataset.source}
                </span>
              </InfoRow>
              <InfoRow label="Source type">{dataset.sourceType}</InfoRow>
              <InfoRow label="Rows">
                {dataset.rowCount.toLocaleString()}
              </InfoRow>
              <InfoRow label="Digest">
                <span className="font-mono text-xs text-[#586378]">
                  {dataset.digest}
                </span>
              </InfoRow>
            </div>

            {dataset.schema.length > 0 && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Field</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Description</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dataset.schema.map((field) => (
                    <TableRow key={field.name}>
                      <TableCell className="font-mono text-[#F4F7FC]">
                        {field.name}
                      </TableCell>
                      <TableCell className="font-mono text-[#828DA3]">
                        {field.type}
                      </TableCell>
                      <TableCell className="text-[#828DA3]">
                        {field.description}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        ) : (
          <p className="text-sm text-[#586378]">
            No input dataset logged for this run.
          </p>
        )}
      </Panel>
    </div>
  )
}
