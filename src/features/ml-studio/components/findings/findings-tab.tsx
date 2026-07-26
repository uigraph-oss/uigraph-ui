'use client'

import { BetterDialogProvider } from '@/components/better-dialog'
import { SectionLoader } from '@/components/section-loader'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useCurrentOrganization } from '@/store/auth-store'
import { useQuery } from '@apollo/client'
import { format } from 'date-fns'
import { FlaskConicalIcon, PlusIcon } from 'lucide-react'
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  ML_STUDIO_FINDINGS,
  ML_STUDIO_MODEL,
  ML_STUDIO_MODEL_VERSION,
  ML_STUDIO_RUN,
} from '../../api/ml-studio'
import { FindingModal } from './finding-modal'

export function FindingsTab() {
  const navigate = useNavigate()
  const { projectId } = useParams<{ projectId: string }>()
  const orgId = useCurrentOrganization()?.id
  const { data, loading } = useQuery(ML_STUDIO_FINDINGS, {
    fetchPolicy: 'cache-and-network',
    skip: !orgId || !projectId,
    variables: { orgId: orgId!, projectId },
  })
  const findings = data?.mlFindings ?? []
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <div className="flex flex-col gap-4 px-5 pt-4 pb-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-semibold text-[#F4F7FC]">Findings</h2>
          <p className="text-sm text-[#828DA3]">
            What was learned from experiments across all models.
          </p>
        </div>
        <Button
          preset="primary"
          className="h-10"
          onClick={() => setModalOpen(true)}
        >
          <PlusIcon />
          New finding
        </Button>
      </div>

      {loading && findings.length === 0 && (
        <SectionLoader label="Loading findings..." />
      )}

      {!loading && findings.length === 0 && (
        <div className="border-stock flex flex-col items-center gap-3 rounded-[28px] border border-dashed px-6 py-16 text-center">
          <p className="text-sm font-medium text-[#F4F7FC]">No findings yet</p>
          <p className="max-w-sm text-sm text-[#828DA3]">
            Record what you learned from your experiment runs and link it to the
            model version it supports.
          </p>
          <Button className="mt-1" onClick={() => setModalOpen(true)}>
            <PlusIcon />
            Create your first finding
          </Button>
        </div>
      )}

      {findings.length > 0 && (
        <div className="flex flex-col gap-3">
          {findings.map((f) => (
            <FindingCard
              key={f.id}
              title={f.title}
              summary={f.summary}
              description={f.description}
              createdAt={f.createdAt}
              authorName={f.createdByActor?.name}
              modelId={f.modelId}
              versionId={f.versionId ?? undefined}
              runIds={f.runIds}
              onClick={() =>
                navigate(
                  `/dashboard/ml-studio/projects/${projectId}/findings/${f.id}`
                )
              }
            />
          ))}
        </div>
      )}

      <BetterDialogProvider open={modalOpen} onOpenChange={setModalOpen}>
        <FindingModal
          onClose={() => setModalOpen(false)}
          projectId={projectId}
        />
      </BetterDialogProvider>
    </div>
  )
}

function FindingCard({
  title,
  summary,
  description,
  createdAt,
  authorName,
  modelId,
  versionId,
  runIds,
  onClick,
}: {
  title: string
  summary: string
  description: string
  createdAt?: string | null
  authorName?: string | null
  modelId: string
  versionId?: string
  runIds: string[]
  onClick: () => void
}) {
  const orgId = useCurrentOrganization()?.id

  const modelQuery = useQuery(ML_STUDIO_MODEL, {
    fetchPolicy: 'cache-and-network',
    skip: !orgId || !modelId,
    variables: { orgId: orgId!, id: modelId },
  })
  const versionQuery = useQuery(ML_STUDIO_MODEL_VERSION, {
    fetchPolicy: 'cache-and-network',
    skip: !orgId || !versionId,
    variables: { orgId: orgId!, id: versionId ?? '' },
  })

  const model = modelQuery.data?.mlModel
  const version = versionId ? versionQuery.data?.mlModelVersion : undefined

  return (
    <button
      type="button"
      onClick={onClick}
      className="border-stock bg-card hover:border-primary/40 flex w-full cursor-pointer flex-col gap-3 rounded-2xl border px-6 py-5 text-left transition-colors"
    >
      <div className="flex flex-col gap-1.5">
        <h3 className="text-lg font-semibold text-[#F4F7FC]">{title}</h3>
        <p className="text-[15px] text-[#828DA3]">
          {createdAt ? `Recorded ${format(new Date(createdAt), 'PP')} · ` : ''}
          {authorName ? `${authorName} · ` : ''}
          supports {model?.name ?? 'Unknown model'}
          {version ? ` ${version.version}` : ''}
        </p>
      </div>

      <p className="line-clamp-3 text-[15px] leading-relaxed text-[#828DA3]">
        <span className="font-medium text-[#C6CEDB]">{summary}</span>
        {description ? ` — ${description}` : ''}
      </p>

      {runIds.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="flex items-center gap-1.5 text-sm text-[#586378]">
            <FlaskConicalIcon className="size-4" />
            Evidence Runs:
          </span>
          {runIds.map((runId) => (
            <EvidenceChip key={runId} runId={runId} />
          ))}
        </div>
      )}
    </button>
  )
}

function EvidenceChip({ runId }: { runId: string }) {
  const orgId = useCurrentOrganization()?.id

  const runQuery = useQuery(ML_STUDIO_RUN, {
    fetchPolicy: 'cache-and-network',
    skip: !orgId || !runId,
    variables: { orgId: orgId!, id: runId },
  })
  const run = runQuery.data?.mlRun

  if (!run && runQuery.loading) {
    return <Skeleton className="h-[26px] w-28 rounded-lg" />
  }

  if (!run) {
    return (
      <span className="border-stock rounded-lg border px-2.5 py-1 font-mono text-xs text-[#586378]">
        Deleted run
      </span>
    )
  }

  return (
    <span className="border-stock rounded-lg border px-2.5 py-1 font-mono text-xs text-[#828DA3]">
      {run.name}
    </span>
  )
}
