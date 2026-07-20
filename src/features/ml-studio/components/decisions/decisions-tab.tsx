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
import { PlusIcon } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { mockDecisions } from '../../constants/mock-data'
import { useModelContext } from '../../contexts/model-context'
import { DecisionModal } from './decision-modal'

export function DecisionsTab() {
  const { model, selectedVersionId } = useModelContext()
  const navigate = useNavigate()
  const [modalOpen, setModalOpen] = useState(false)
  const versionQuery = selectedVersionId ? `?v=${selectedVersionId}` : ''

  const decisions = mockDecisions.filter(
    (d) => d.versionId === selectedVersionId
  )

  return (
    <div className="flex flex-col gap-4 p-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-[#828DA3]">
          Decisions recorded for this version.
        </p>
        <Button
          preset="primary"
          className="h-10"
          onClick={() => setModalOpen(true)}
        >
          <PlusIcon />
          New decision
        </Button>
      </div>

      <div className="border-stock bg-card overflow-hidden rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Decision</TableHead>
              <TableHead>Decision maker</TableHead>
              <TableHead>Decided</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {decisions.map((d) => (
              <TableRow
                key={d.id}
                className="cursor-pointer"
                onClick={() =>
                  navigate(
                    `/dashboard/ml-studio/${model.id}/decisions/${d.id}${versionQuery}`
                  )
                }
              >
                <TableCell className="font-medium text-[#F4F7FC]">
                  {d.title}
                </TableCell>
                <TableCell className="line-clamp-1 text-[#828DA3]">
                  {d.decision}
                </TableCell>
                <TableCell className="text-[#828DA3]">
                  {d.decisionMaker}
                </TableCell>
                <TableCell className="text-[#828DA3]">
                  {new Date(d.decidedAt).toLocaleDateString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <DecisionModal open={modalOpen} onOpenChange={setModalOpen} />
    </div>
  )
}
