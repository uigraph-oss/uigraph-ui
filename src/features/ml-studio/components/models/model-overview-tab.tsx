'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { PlusIcon } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  mockArtifacts,
  mockDatasets,
  mockExperiments,
  mockFindings,
  mockRuns,
} from '../../constants/mock-data'
import { useModelContext } from '../../contexts/model-context'
import { InfoRow, Panel } from '../panel'
import { StatusBadge } from '../status-badge'
import { VersionTimeline } from '../version-timeline'
import { VersionModal } from './version-modal'

export function ModelOverviewTab() {
  const { model, versions, selectedVersionId, selectedVersion, setVersionId } =
    useModelContext()
  const [versionModalOpen, setVersionModalOpen] = useState(false)

  const versionExperiments = mockExperiments.filter(
    (e) => e.versionId === selectedVersionId
  )
  const versionRuns = mockRuns.filter((r) =>
    versionExperiments.some((e) => e.id === r.experimentId)
  )
  const latestRun = versionRuns[versionRuns.length - 1]
  const metrics = Object.entries(latestRun?.metrics ?? {})
  const parameters = Object.entries(latestRun?.parameters ?? {})
  const artifacts = latestRun
    ? mockArtifacts.filter((a) => latestRun.artifactIds.includes(a.id))
    : []

  const dataset = mockDatasets.find((d) => d.versionId === selectedVersionId)
  const finding = mockFindings.find(
    (f) => f.linkedVersionId === selectedVersionId && f.status === 'published'
  )

  return (
    <div className="grid grid-cols-1 gap-5 p-6 lg:grid-cols-3">
      <div className="flex flex-col gap-5 lg:col-span-2">
        <Panel title="Model card">
          <div className="grid grid-cols-2 gap-5 md:grid-cols-4">
            <InfoRow label="Problem type">
              <span className="capitalize">{model.problemType}</span>
            </InfoRow>
            <InfoRow label="Domain">{model.domain}</InfoRow>
            <InfoRow label="Owner">{model.owner}</InfoRow>
            <InfoRow label="Status">
              <StatusBadge value={model.status} />
            </InfoRow>
          </div>
          <p className="text-sm leading-relaxed text-[#828DA3]">
            {model.description}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {model.tags.map((tag) => (
              <Badge
                key={tag}
                className="border-stock rounded-md border bg-[#1E2533] text-[#828DA3]"
              >
                {tag}
              </Badge>
            ))}
          </div>
        </Panel>

        <Panel
          title="Description"
          description={
            selectedVersion
              ? `${selectedVersion.displayName} · ${selectedVersion.version}`
              : undefined
          }
        >
          <p className="text-sm leading-relaxed text-[#828DA3]">
            {selectedVersion?.releaseNotes ||
              'No release notes for this version.'}
          </p>
        </Panel>

        <Panel
          title="Metrics"
          description="Scalar metrics from the version's latest run."
        >
          {metrics.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {metrics.map(([key, value]) => (
                <div
                  key={key}
                  className="border-stock rounded-lg border bg-[#1E2533] p-4"
                >
                  <div className="text-2xl font-bold text-[#F4F7FC]">
                    {value}
                  </div>
                  <div className="mt-1 text-sm text-[#828DA3]">
                    {key.replace(/_/g, ' ')}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-[#586378]">
              No run metrics recorded for this version.
            </p>
          )}
        </Panel>

        <Panel
          title="Parameters"
          description="Hyperparameters from the version's latest run."
        >
          {parameters.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Parameter</TableHead>
                  <TableHead>Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {parameters.map(([key, value]) => (
                  <TableRow key={key}>
                    <TableCell className="text-[#828DA3]">{key}</TableCell>
                    <TableCell className="font-mono text-[#F4F7FC]">
                      {String(value)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-sm text-[#586378]">No parameters recorded.</p>
          )}
        </Panel>

        <Panel
          title="Artifacts"
          description="Outputs produced by the version's latest run."
        >
          {artifacts.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Format</TableHead>
                  <TableHead>Size</TableHead>
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
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-sm text-[#586378]">No artifacts attached.</p>
          )}
        </Panel>

        {finding && (
          <Panel title="Linked finding">
            <div className="flex items-start justify-between gap-3">
              <div>
                <Link
                  to={`/dashboard/ml-studio/findings/${finding.id}`}
                  className="hover:text-primary font-medium text-[#F4F7FC]"
                >
                  {finding.title}
                </Link>
                <p className="mt-1 text-sm text-[#828DA3]">{finding.summary}</p>
              </div>
              <StatusBadge value={finding.severity} />
            </div>
          </Panel>
        )}

        {dataset && (
          <Panel title="Training dataset">
            <div className="grid grid-cols-2 gap-5 md:grid-cols-4">
              <InfoRow label="Name">
                <Link
                  to={`/dashboard/ml-studio/datasets/${dataset.id}`}
                  className="hover:text-primary"
                >
                  {dataset.name}
                </Link>
              </InfoRow>
              <InfoRow label="Version">{dataset.version}</InfoRow>
              <InfoRow label="Rows">
                {dataset.rowCount.toLocaleString()}
              </InfoRow>
              <InfoRow label="Size">{dataset.size}</InfoRow>
            </div>
          </Panel>
        )}
      </div>

      <div className="lg:col-span-1">
        <Panel
          title="Version history"
          action={
            <Button
              preset="outline"
              className="h-9 px-3"
              onClick={() => setVersionModalOpen(true)}
            >
              <PlusIcon />
              Version
            </Button>
          }
        >
          <VersionTimeline
            versions={versions}
            selectedVersionId={selectedVersionId}
            onSelect={(id) => void setVersionId(id)}
          />
        </Panel>
      </div>

      <VersionModal
        open={versionModalOpen}
        onOpenChange={setVersionModalOpen}
      />
    </div>
  )
}
