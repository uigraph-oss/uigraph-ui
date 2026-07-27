'use client'

import { BetterDialogProvider } from '@/components/better-dialog'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useCurrentOrganization } from '@/store/auth-store'
import { useQuery } from '@apollo/client'
import { Pencil } from 'lucide-react'
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ML_EVALUATION } from '../../api/evaluations'
import { ML_STUDIO_EXPERIMENT } from '../../api/experiments'
import { ML_STUDIO_FINDINGS } from '../../api/findings'
import { ML_STUDIO_MODEL_VERSION } from '../../api/model-versions'
import { ML_STUDIO_MODEL } from '../../api/models'
import { ML_STUDIO_RUN } from '../../api/runs'
import type { Finding } from '../../types'
import { StatusBadge } from '../status-badge'
import { FindingModal } from './finding-modal'

export function FindingDetailPage() {
  const { projectId, findingId } = useParams<{
    projectId: string
    findingId: string
  }>()
  const orgId = useCurrentOrganization()?.id

  const findingsQuery = useQuery(ML_STUDIO_FINDINGS, {
    fetchPolicy: 'cache-and-network',
    skip: !orgId || !projectId,
    variables: { orgId: orgId!, projectId },
  })
  const finding = findingsQuery.data?.mlFindings.find((f) => f.id === findingId)

  const modelQuery = useQuery(ML_STUDIO_MODEL, {
    fetchPolicy: 'cache-and-network',
    skip: !orgId || !finding?.modelId,
    variables: { orgId: orgId!, id: finding?.modelId ?? '' },
  })
  const versionQuery = useQuery(ML_STUDIO_MODEL_VERSION, {
    fetchPolicy: 'cache-and-network',
    skip: !orgId || !finding?.versionId,
    variables: { orgId: orgId!, id: finding?.versionId ?? '' },
  })

  const [editOpen, setEditOpen] = useState(false)

  if (findingsQuery.loading && !finding) {
    return <div className="p-6 text-[#828DA3]">Loading…</div>
  }

  if (!finding) {
    return <div className="p-6 text-[#828DA3]">Finding not found.</div>
  }

  const model = modelQuery.data?.mlModel
  const version = versionQuery.data?.mlModelVersion
  const runCount = finding.runIds.length
  const evaluationCount = finding.evaluationIds.length
  const modelBase = `/dashboard/ml-studio/projects/${model?.projectId}/models/${finding.modelId}`

  const findingForModal: Finding = {
    id: finding.id,
    modelId: finding.modelId,
    versionId: finding.versionId ?? undefined,
    title: finding.title,
    summary: finding.summary,
    description: finding.description,
    runIds: finding.runIds,
    evaluationIds: finding.evaluationIds,
  }

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
              {runCount} {runCount === 1 ? 'run' : 'runs'} · {evaluationCount}{' '}
              {evaluationCount === 1 ? 'evaluation' : 'evaluations'} of evidence
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
        <h3 className="text-sm font-semibold text-[#F4F7FC]">Evidence Runs</h3>
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
                {finding.runIds.map((runId) => (
                  <EvidenceRunRow key={runId} runId={runId} />
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <p className="text-sm text-[#586378]">No runs linked yet.</p>
        )}
      </div>

      <div className="flex flex-col gap-3">
        <h3 className="text-sm font-semibold text-[#F4F7FC]">
          Evidence Evaluations
        </h3>
        {evaluationCount > 0 ? (
          <div className="border-stock overflow-hidden rounded-xl border">
            <Table className="[&_td]:px-4 [&_td]:py-3 [&_th]:h-11 [&_th]:px-4">
              <TableHeader>
                <TableRow>
                  <TableHead>Evaluation</TableHead>
                  <TableHead>Model · Version</TableHead>
                  <TableHead>Experiment</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {finding.evaluationIds.map((evaluationId) => (
                  <EvidenceEvaluationRow
                    key={evaluationId}
                    evaluationId={evaluationId}
                  />
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <p className="text-sm text-[#586378]">No evaluations linked yet.</p>
        )}
      </div>

      <BetterDialogProvider open={editOpen} onOpenChange={setEditOpen}>
        <FindingModal
          onClose={() => setEditOpen(false)}
          finding={findingForModal}
        />
      </BetterDialogProvider>
    </div>
  )
}

function EvidenceRunRow({ runId }: { runId: string }) {
  const orgId = useCurrentOrganization()?.id

  const runQuery = useQuery(ML_STUDIO_RUN, {
    fetchPolicy: 'cache-and-network',
    skip: !orgId || !runId,
    variables: { orgId: orgId!, id: runId },
  })
  const run = runQuery.data?.mlRun

  const experimentQuery = useQuery(ML_STUDIO_EXPERIMENT, {
    fetchPolicy: 'cache-and-network',
    skip: !orgId || !run?.experimentId,
    variables: { orgId: orgId!, id: run?.experimentId ?? '' },
  })
  const runExperiment = experimentQuery.data?.mlExperiment

  const experimentBase = `/dashboard/ml-studio/projects/${runExperiment?.projectId}/experiments/${run?.experimentId}`

  return (
    <TableRow>
      <TableCell>
        {run && (
          <Link
            to={`${experimentBase}/runs/${run.id}`}
            className="hover:text-primary font-medium text-[#F4F7FC]"
          >
            {run.name}
          </Link>
        )}
        {!run && runQuery.loading && <Skeleton className="h-5 w-32" />}
        {!run && !runQuery.loading && (
          <span className="text-[#586378]">Deleted run</span>
        )}
      </TableCell>
      <TableCell>
        {run ? (
          <StatusBadge value={run.status} />
        ) : (
          <span className="text-[#586378]">—</span>
        )}
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
}

function EvidenceEvaluationRow({ evaluationId }: { evaluationId: string }) {
  const orgId = useCurrentOrganization()?.id

  const evaluationQuery = useQuery(ML_EVALUATION, {
    fetchPolicy: 'cache-and-network',
    skip: !orgId || !evaluationId,
    variables: { orgId: orgId!, id: evaluationId },
  })
  const evaluation = evaluationQuery.data?.mlEvaluation

  const experimentQuery = useQuery(ML_STUDIO_EXPERIMENT, {
    fetchPolicy: 'cache-and-network',
    skip: !orgId || !evaluation?.experimentId,
    variables: { orgId: orgId!, id: evaluation?.experimentId ?? '' },
  })
  const evaluationExperiment = experimentQuery.data?.mlExperiment

  const experimentBase = `/dashboard/ml-studio/projects/${evaluationExperiment?.projectId}/experiments/${evaluation?.experimentId}`

  return (
    <TableRow>
      <TableCell>
        {evaluation && (
          <Link
            to={`${experimentBase}/evaluations/${evaluation.id}`}
            className="hover:text-primary font-medium text-[#F4F7FC]"
          >
            {evaluation.name}
          </Link>
        )}
        {!evaluation && evaluationQuery.loading && (
          <Skeleton className="h-5 w-32" />
        )}
        {!evaluation && !evaluationQuery.loading && (
          <span className="text-[#586378]">Deleted evaluation</span>
        )}
      </TableCell>
      <TableCell>
        {evaluation ? (
          <span className="text-[#828DA3]">
            {evaluation.modelName} · {evaluation.version}
          </span>
        ) : (
          <span className="text-[#586378]">—</span>
        )}
      </TableCell>
      <TableCell>
        {evaluationExperiment ? (
          <Link
            to={experimentBase}
            className="hover:text-primary text-[#828DA3]"
          >
            {evaluationExperiment.name}
          </Link>
        ) : (
          <span className="text-[#586378]">Unknown</span>
        )}
      </TableCell>
    </TableRow>
  )
}
