'use client'

import { BetterDialogProvider } from '@/components/better-dialog'
import { SectionLoader } from '@/components/section-loader'
import { Button } from '@/components/ui/button'
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
import { PlusIcon } from 'lucide-react'
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ML_STUDIO_FINDINGS } from '../../api/ml-studio'
import { ModelVersionLink } from '../model-version-link'
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
        <div className="border-stock bg-card overflow-hidden rounded-xl border">
          <Table className="[&_td]:px-4 [&_td]:py-3.5 [&_th]:h-12 [&_th]:px-4">
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Evidence</TableHead>
                <TableHead>Supports</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {findings.map((f) => (
                <TableRow
                  key={f.id}
                  className="cursor-pointer"
                  onClick={() =>
                    navigate(
                      `/dashboard/ml-studio/projects/${projectId}/findings/${f.id}`
                    )
                  }
                >
                  <TableCell>
                    <div className="font-medium text-[#F4F7FC]">{f.title}</div>
                    <div className="line-clamp-1 text-sm text-[#828DA3]">
                      {f.summary}
                    </div>
                  </TableCell>
                  <TableCell className="text-[#828DA3]">
                    {f.runIds.length} {f.runIds.length === 1 ? 'run' : 'runs'}
                  </TableCell>
                  <TableCell>
                    <ModelVersionLink
                      modelId={f.modelId}
                      versionId={f.versionId ?? undefined}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
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
