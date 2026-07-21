'use client'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { PinIcon } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { mockFindings, mockRuns, mockVersions } from '../../constants/mock-data'
import { ModelVersionLink } from '../model-version-link'
import { InfoRow, Panel } from '../panel'
import { StatusBadge } from '../status-badge'

export function FindingDetailPage() {
  const { findingId } = useParams<{ findingId: string }>()

  const finding = mockFindings.find((f) => f.id === findingId)

  if (!finding) {
    return <div className="p-6 text-[#828DA3]">Finding not found.</div>
  }

  const runs = mockRuns.filter((r) => finding.runIds.includes(r.id))
  const linkedVersion = finding.linkedVersionId
    ? mockVersions.find((v) => v.id === finding.linkedVersionId)
    : undefined

  return (
    <div className="flex flex-col gap-5 p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            {finding.pinned && <PinIcon className="size-4 text-[#3B6BFF]" />}
            <h2 className="text-xl font-semibold text-[#F4F7FC]">
              {finding.title}
            </h2>
          </div>
          <p className="mt-1 text-sm text-[#828DA3]">{finding.summary}</p>
        </div>
        <div className="flex gap-2">
          <StatusBadge value={finding.severity} />
          <StatusBadge value={finding.status} />
        </div>
      </div>

      <Panel>
        <div className="grid grid-cols-2 gap-5 md:grid-cols-4">
          <InfoRow label="Model / Version">
            <ModelVersionLink
              modelId={finding.modelId}
              versionId={finding.versionId}
            />
          </InfoRow>
          <InfoRow label="Source">{finding.source}</InfoRow>
          <InfoRow label="Author">{finding.author}</InfoRow>
          <InfoRow label="Created">
            {new Date(finding.createdAt).toLocaleDateString()}
          </InfoRow>
          <InfoRow label="Linked version">
            {linkedVersion ? linkedVersion.displayName : '—'}
          </InfoRow>
        </div>
        <InfoRow label="Description">{finding.description}</InfoRow>
      </Panel>

      <Panel title="Evidence" description="Runs referenced by this finding.">
        {runs.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Run</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Experiment</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {runs.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>
                    <Link
                      to={`/dashboard/ml-studio/experiments/${r.experimentId}/runs/${r.id}`}
                      className="hover:text-primary font-medium text-[#F4F7FC]"
                    >
                      {r.name}
                    </Link>
                    <div className="text-xs text-[#586378]">{r.id}</div>
                  </TableCell>
                  <TableCell>
                    <StatusBadge value={r.status} />
                  </TableCell>
                  <TableCell className="text-[#828DA3]">
                    {r.experimentId}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="text-sm text-[#586378]">No linked runs.</p>
        )}
      </Panel>
    </div>
  )
}
