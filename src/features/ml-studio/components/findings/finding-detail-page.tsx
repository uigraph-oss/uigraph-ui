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
import { Pencil } from 'lucide-react'
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useMlStudioData } from '../../contexts/ml-studio-data-context'
import { StatusBadge } from '../status-badge'
import { FindingModal } from './finding-modal'

export function FindingDetailPage() {
  const { findingId } = useParams<{ findingId: string }>()

  const {
    findings,
    runs: allRuns,
    experiments,
    models,
    versions,
  } = useMlStudioData()
  const finding = findings.find((f) => f.id === findingId)

  const [editOpen, setEditOpen] = useState(false)

  if (!finding) {
    return <div className="p-6 text-[#828DA3]">Finding not found.</div>
  }

  const runs = allRuns.filter((r) => finding.runIds.includes(r.id))
  const experimentById = new Map(experiments.map((e) => [e.id, e]))

  const runCount = runs.length
  const model = models.find((m) => m.id === finding.modelId)
  const modelBase = `/dashboard/ml-studio/projects/${model?.projectId}/models/${finding.modelId}`
  const version = finding.versionId
    ? versions.find((v) => v.id === finding.versionId)
    : undefined

  return (
    <div className="flex w-full flex-col gap-6 p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl font-semibold text-[#F4F7FC]">
            {finding.title}
          </h2>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-[#828DA3]">
            <span>Supports</span>
            <Link
              to={
                finding.versionId
                  ? `${modelBase}?v=${finding.versionId}`
                  : modelBase
              }
              className="hover:text-primary font-medium text-[#F4F7FC]"
            >
              {model?.name ?? 'Unknown model'}
              {version ? ` · ${version.version}` : ''}
            </Link>
            <span className="text-[#3A4256]">•</span>
            <span>
              {runCount} {runCount === 1 ? 'run' : 'runs'} of evidence
            </span>
          </div>
        </div>
        <Button
          preset="outline"
          className="h-10 shrink-0"
          onClick={() => setEditOpen(true)}
        >
          <Pencil className="size-4" />
          Edit
        </Button>
      </div>

      {finding.description ? (
        <p className="text-[15px] leading-relaxed whitespace-pre-wrap text-[#C6CEDB]">
          {finding.description}
        </p>
      ) : (
        <p className="text-sm text-[#586378]">No description added yet.</p>
      )}

      <div className="flex flex-col gap-3">
        <h3 className="text-sm font-semibold text-[#F4F7FC]">Evidence</h3>
        {runCount > 0 ? (
          <div className="border-stock overflow-hidden rounded-xl border">
            <Table className="[&_td]:px-4 [&_td]:py-3 [&_th]:h-11 [&_th]:px-4">
              <TableHeader>
                <TableRow>
                  <TableHead>Run</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Experiment</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {runs.map((r) => {
                  const runExperiment = experimentById.get(r.experimentId)
                  const experimentBase = `/dashboard/ml-studio/projects/${runExperiment?.projectId}/experiments/${r.experimentId}`
                  return (
                    <TableRow key={r.id}>
                      <TableCell>
                        <Link
                          to={`${experimentBase}/runs/${r.id}`}
                          className="hover:text-primary font-medium text-[#F4F7FC]"
                        >
                          {r.name}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <StatusBadge value={r.status} />
                      </TableCell>
                      <TableCell>
                        {runExperiment ? (
                          <Link
                            to={experimentBase}
                            className="hover:text-primary text-[#828DA3]"
                          >
                            {runExperiment.name}
                          </Link>
                        ) : (
                          <span className="text-[#586378]">Unknown</span>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        ) : (
          <p className="text-sm text-[#586378]">No runs linked yet.</p>
        )}
      </div>

      <FindingModal
        open={editOpen}
        onOpenChange={setEditOpen}
        finding={finding}
      />
    </div>
  )
}
