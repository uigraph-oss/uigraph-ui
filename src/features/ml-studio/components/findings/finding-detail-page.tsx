'use client'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Link, useParams } from 'react-router-dom'
import { useMlStudioData } from '../../contexts/ml-studio-data-context'
import { ModelVersionLink } from '../model-version-link'
import { Panel } from '../panel'
import { StatusBadge } from '../status-badge'

export function FindingDetailPage() {
  const { findingId } = useParams<{ findingId: string }>()

  const { findings, runs: allRuns } = useMlStudioData()
  const finding = findings.find((f) => f.id === findingId)

  if (!finding) {
    return <div className="p-6 text-[#828DA3]">Finding not found.</div>
  }

  const runs = allRuns.filter((r) => finding.runIds.includes(r.id))

  return (
    <div className="flex flex-col gap-5 p-6">
      <div>
        <h2 className="text-xl font-semibold text-[#F4F7FC]">
          {finding.title}
        </h2>
        <p className="mt-1 text-sm text-[#828DA3]">{finding.summary}</p>
      </div>

      <Panel title="Body">
        <p className="text-sm leading-relaxed text-[#828DA3]">
          {finding.description}
        </p>
      </Panel>

      <Panel title="Evidence" description="Runs that support this finding.">
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
          <p className="text-sm text-[#586378]">No runs linked.</p>
        )}
      </Panel>

      <Panel
        title="Supports → Model Version"
        description="The model version this finding justifies."
      >
        {finding.versionId ? (
          <ModelVersionLink
            modelId={finding.modelId}
            versionId={finding.versionId}
          />
        ) : (
          <p className="text-sm text-[#586378]">No model version promoted.</p>
        )}
      </Panel>
    </div>
  )
}
