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
import { ModelVersionLink } from '../model-version-link'
import { DecisionModal } from './decision-modal'

export function DecisionsTab() {
  const navigate = useNavigate()
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <div className="flex flex-col gap-4 px-5 pt-4 pb-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-semibold text-[#F4F7FC]">Decisions</h2>
          <p className="text-sm text-[#828DA3]">
            Decisions recorded across all models.
          </p>
        </div>
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
        <Table className="[&_td]:px-4 [&_td]:py-3.5 [&_th]:h-12 [&_th]:px-4">
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Model / Version</TableHead>
              <TableHead>Decision</TableHead>
              <TableHead>Decision maker</TableHead>
              <TableHead>Decided</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockDecisions.map((d) => (
              <TableRow
                key={d.id}
                className="cursor-pointer"
                onClick={() =>
                  navigate(`/dashboard/ml-studio/decisions/${d.id}`)
                }
              >
                <TableCell className="font-medium text-[#F4F7FC]">
                  {d.title}
                </TableCell>
                <TableCell>
                  <ModelVersionLink
                    modelId={d.modelId}
                    versionId={d.versionId}
                  />
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
