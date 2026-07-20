'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { PlusIcon } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  mockDatasets,
  mockEvaluations,
  mockFindings,
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

  const evaluation = mockEvaluations.find(
    (e) => e.versionId === selectedVersionId
  )
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
          title="Performance summary"
          description={
            selectedVersion
              ? `${selectedVersion.displayName} · ${selectedVersion.version}`
              : undefined
          }
        >
          {evaluation ? (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {evaluation.metrics.map((m) => (
                <div
                  key={m.id}
                  className="border-stock rounded-lg border bg-[#1E2533] p-4"
                >
                  <div className="text-2xl font-bold text-[#F4F7FC]">
                    {m.value}
                    {m.unit && (
                      <span className="ml-1 text-sm text-[#828DA3]">
                        {m.unit}
                      </span>
                    )}
                  </div>
                  <div className="mt-1 text-sm text-[#828DA3]">{m.name}</div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-[#586378]">
              No evaluation recorded for this version.
            </p>
          )}
        </Panel>

        {finding && (
          <Panel title="Linked finding">
            <div className="flex items-start justify-between gap-3">
              <div>
                <Link
                  to={`/dashboard/ml-studio/${model.id}/findings/${finding.id}?v=${selectedVersionId}`}
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
                  to={`/dashboard/ml-studio/${model.id}/datasets/${dataset.id}?v=${selectedVersionId}`}
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
