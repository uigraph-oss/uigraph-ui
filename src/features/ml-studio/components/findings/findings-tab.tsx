'use client'

import { BetterDialogProvider } from '@/components/better-dialog'
import { SectionLoader } from '@/components/section-loader'
import { Button } from '@/components/ui/button'
import { useCurrentOrganization } from '@/store/auth-store'
import { useQuery } from '@apollo/client'
import { PlusIcon } from 'lucide-react'
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ML_STUDIO_FINDINGS } from '../../api/findings'
import { FindingCard } from './finding-card'
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
        <div className="grid grid-cols-[repeat(auto-fill,minmax(40rem,1fr))] gap-3">
          {findings.map((f) => (
            <FindingCard
              key={f.id}
              id={f.id}
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
