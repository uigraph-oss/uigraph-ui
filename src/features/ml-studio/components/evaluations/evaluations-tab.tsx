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
import { mockEvaluations } from '../../constants/mock-data'
import { useModelContext } from '../../contexts/model-context'
import { EvaluationModal } from './evaluation-modal'

export function EvaluationsTab() {
  const { model, selectedVersionId } = useModelContext()
  const navigate = useNavigate()
  const [modalOpen, setModalOpen] = useState(false)
  const versionQuery = selectedVersionId ? `?v=${selectedVersionId}` : ''

  const evaluations = mockEvaluations.filter(
    (e) => e.versionId === selectedVersionId
  )

  return (
    <div className="flex flex-col gap-4 p-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-[#828DA3]">
          Benchmarks and tests run against this version.
        </p>
        <Button
          preset="primary"
          className="h-10"
          onClick={() => setModalOpen(true)}
        >
          <PlusIcon />
          New evaluation
        </Button>
      </div>

      <div className="border-stock bg-card overflow-hidden rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Summary</TableHead>
              <TableHead>Metrics</TableHead>
              <TableHead>Evaluator</TableHead>
              <TableHead>Evaluated</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {evaluations.map((e) => (
              <TableRow
                key={e.id}
                className="cursor-pointer"
                onClick={() =>
                  navigate(
                    `/dashboard/ml-studio/${model.id}/evaluations/${e.id}${versionQuery}`
                  )
                }
              >
                <TableCell className="font-medium text-[#F4F7FC]">
                  {e.name}
                </TableCell>
                <TableCell className="text-[#828DA3]">{e.type}</TableCell>
                <TableCell className="line-clamp-1 text-[#828DA3]">
                  {e.summary}
                </TableCell>
                <TableCell className="text-[#828DA3]">
                  {e.metrics.length}
                </TableCell>
                <TableCell className="text-[#828DA3]">{e.evaluator}</TableCell>
                <TableCell className="text-[#828DA3]">
                  {new Date(e.evaluatedAt).toLocaleDateString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <EvaluationModal open={modalOpen} onOpenChange={setModalOpen} />
    </div>
  )
}
