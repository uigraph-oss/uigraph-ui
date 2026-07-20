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
import { PinIcon, PlusIcon } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { mockFindings } from '../../constants/mock-data'
import { useModelContext } from '../../contexts/model-context'
import { StatusBadge } from '../status-badge'
import { FindingModal } from './finding-modal'

export function FindingsTab() {
  const { model, selectedVersionId } = useModelContext()
  const navigate = useNavigate()
  const [modalOpen, setModalOpen] = useState(false)
  const versionQuery = selectedVersionId ? `?v=${selectedVersionId}` : ''

  const findings = mockFindings.filter((f) => f.versionId === selectedVersionId)

  return (
    <div className="flex flex-col gap-4 p-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-[#828DA3]">
          Insights and observations captured for this version.
        </p>
        <Button
          preset="primary"
          className="h-10"
          onClick={() => setModalOpen(true)}
        >
          <PlusIcon />
          New finding
        </Button>
      </div>

      <div className="border-stock bg-card overflow-hidden rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Severity</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Author</TableHead>
              <TableHead>Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {findings.map((f) => (
              <TableRow
                key={f.id}
                className="cursor-pointer"
                onClick={() =>
                  navigate(
                    `/dashboard/ml-studio/${model.id}/findings/${f.id}${versionQuery}`
                  )
                }
              >
                <TableCell>
                  <div className="flex items-center gap-2">
                    {f.pinned && (
                      <PinIcon className="size-3.5 text-[#3B6BFF]" />
                    )}
                    <div>
                      <div className="font-medium text-[#F4F7FC]">
                        {f.title}
                      </div>
                      <div className="line-clamp-1 text-sm text-[#828DA3]">
                        {f.summary}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <StatusBadge value={f.severity} />
                </TableCell>
                <TableCell>
                  <StatusBadge value={f.status} />
                </TableCell>
                <TableCell className="text-[#828DA3]">{f.source}</TableCell>
                <TableCell className="text-[#828DA3]">{f.author}</TableCell>
                <TableCell className="text-[#828DA3]">
                  {new Date(f.createdAt).toLocaleDateString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <FindingModal open={modalOpen} onOpenChange={setModalOpen} />
    </div>
  )
}
