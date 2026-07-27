'use client'

import { BetterDeleteConfirmationModal } from '@/components/better-delete-confirmation-modal'
import { BetterDialogProvider } from '@/components/better-dialog'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Skeleton } from '@/components/ui/skeleton'
import { useCurrentOrganization } from '@/store/auth-store'
import { useMutation, useQuery } from '@apollo/client'
import { format } from 'date-fns'
import {
  ClipboardCheckIcon,
  EllipsisVertical,
  FlaskConicalIcon,
  Pencil,
  Trash2,
} from 'lucide-react'
import { useState } from 'react'
import { ML_EVALUATION } from '../../api/evaluations'
import { DELETE_ML_FINDING } from '../../api/findings'
import { ML_STUDIO_MODEL_VERSION } from '../../api/model-versions'
import { ML_STUDIO_MODEL } from '../../api/models'
import { ML_STUDIO_RUN } from '../../api/runs'
import type { Finding } from '../../types'
import { FindingModal } from './finding-modal'

export function FindingCard({
  id,
  title,
  summary,
  description,
  createdAt,
  authorName,
  modelId,
  versionId,
  runIds,
  evaluationIds,
  onClick,
}: {
  id: string
  title: string
  summary: string
  description: string
  createdAt?: string | null
  authorName?: string | null
  modelId: string
  versionId?: string
  runIds: string[]
  evaluationIds: string[]
  onClick: () => void
}) {
  const orgId = useCurrentOrganization()?.id
  const [menuOpen, setMenuOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  const [deleteFinding] = useMutation(DELETE_ML_FINDING, {
    refetchQueries: ['MlStudioFindings'],
    awaitRefetchQueries: true,
  })

  const finding: Finding = {
    id,
    modelId,
    versionId,
    title,
    summary,
    description,
    runIds,
    evaluationIds,
  }

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
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          onClick()
        }
      }}
      className="border-stock bg-card hover:border-primary/40 flex w-full cursor-pointer flex-col gap-3 rounded-2xl border px-6 py-5 text-left transition-colors"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-0.5">
          <h3 className="text-base font-semibold text-[#F4F7FC]">{title}</h3>
          <p className="text-sm text-[#828DA3]">
            {createdAt
              ? `Published ${format(new Date(createdAt), 'PP')} · `
              : ''}
            {authorName ? `${authorName} · ` : ''}
            supports {version ? `${version.version} promotion` : model?.name}
          </p>
        </div>

        <div onClick={(e) => e.stopPropagation()}>
          <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <EllipsisVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-[#141925]">
              <DropdownMenuItem
                onClick={() => {
                  setMenuOpen(false)
                  setEditOpen(true)
                }}
              >
                <Pencil className="h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setMenuOpen(false)
                  setDeleteOpen(true)
                }}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="stroke-destructive h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <BetterDialogProvider open={editOpen} onOpenChange={setEditOpen}>
            <FindingModal
              onClose={() => setEditOpen(false)}
              finding={finding}
            />
          </BetterDialogProvider>

          <BetterDeleteConfirmationModal
            open={deleteOpen}
            onOpenChange={setDeleteOpen}
            title="Delete finding?"
            description="This will permanently remove this finding. The runs it cites will stay untouched."
            onConfirm={async () => {
              if (!orgId) {
                return
              }
              await deleteFinding({ variables: { orgId, id } })
            }}
          />
        </div>
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

      {evaluationIds.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="flex items-center gap-1.5 text-sm text-[#586378]">
            <ClipboardCheckIcon className="size-4" />
            Evidence Evaluations:
          </span>
          {evaluationIds.map((evaluationId) => (
            <EvaluationEvidenceChip
              key={evaluationId}
              evaluationId={evaluationId}
            />
          ))}
        </div>
      )}
    </div>
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

function EvaluationEvidenceChip({ evaluationId }: { evaluationId: string }) {
  const orgId = useCurrentOrganization()?.id

  const evaluationQuery = useQuery(ML_EVALUATION, {
    fetchPolicy: 'cache-and-network',
    skip: !orgId || !evaluationId,
    variables: { orgId: orgId!, id: evaluationId },
  })
  const evaluation = evaluationQuery.data?.mlEvaluation

  if (!evaluation && evaluationQuery.loading) {
    return <Skeleton className="h-[26px] w-28 rounded-lg" />
  }

  if (!evaluation) {
    return (
      <span className="border-stock rounded-lg border px-2.5 py-1 font-mono text-xs text-[#586378]">
        Deleted evaluation
      </span>
    )
  }

  return (
    <span className="border-stock rounded-lg border px-2.5 py-1 font-mono text-xs text-[#828DA3]">
      {evaluation.name}
    </span>
  )
}
