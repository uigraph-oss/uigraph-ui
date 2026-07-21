'use client'

import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { BetterTabController, useBetterTabs } from '@/hooks/use-better-tabs'
import { PlusIcon } from 'lucide-react'
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  mockArtifacts,
  mockDatasets,
  mockExperiments,
  mockRuns,
} from '../../constants/mock-data'
import { MetricLineChart } from '../metric-chart'
import { ModelVersionLink } from '../model-version-link'
import { InfoRow, Panel } from '../panel'
import { StatusBadge } from '../status-badge'
import { ArtifactModal } from './artifact-modal'

export function RunDetailPage() {
  const { runId } = useParams<{ runId: string }>()

  const run = mockRuns.find((r) => r.id === runId)
  const [control, activeTab] = useBetterTabs([
    { id: 'params', label: 'Parameters' },
    { id: 'metrics', label: 'Metrics' },
  ])
  const [artifactModalOpen, setArtifactModalOpen] = useState(false)

  if (!run) {
    return <div className="p-6 text-[#828DA3]">Run not found.</div>
  }

  const artifacts = mockArtifacts.filter((a) => run.artifactIds.includes(a.id))
  const dataset = mockDatasets.find((d) => d.id === run.datasetId)
  const experiment = mockExperiments.find((e) => e.id === run.experimentId)

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
          {experiment && (
            <InfoRow label="Model / Version">
              <ModelVersionLink
                modelId={experiment.modelId}
                versionId={experiment.versionId}
              />
            </InfoRow>
          )}
          <InfoRow label="Duration">{run.duration}</InfoRow>
          <InfoRow label="Trigger">{run.trigger}</InfoRow>
          <InfoRow label="Environment">{run.environment}</InfoRow>
          <InfoRow label="Dataset">
            {dataset ? (
              <Link
                to={`/dashboard/ml-studio/datasets/${dataset.id}`}
                className="hover:text-primary"
              >
                {dataset.name} {dataset.version}
              </Link>
            ) : (
              '—'
            )}
          </InfoRow>
        </div>
        <InfoRow label="Model architecture">{run.modelArch}</InfoRow>
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

      <Panel
        title="Artifacts"
        action={
          <Button
            preset="outline"
            className="h-9 px-3"
            onClick={() => setArtifactModalOpen(true)}
          >
            <PlusIcon />
            Attach
          </Button>
        }
      >
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

      <ArtifactModal
        open={artifactModalOpen}
        onOpenChange={setArtifactModalOpen}
      />
    </div>
  )
}
