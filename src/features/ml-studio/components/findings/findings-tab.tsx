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
import { ModelVersionLink } from '../model-version-link'
import { StatusBadge } from '../status-badge'
import { FindingModal } from './finding-modal'

export function FindingsTab() {
  const navigate = useNavigate()
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <div className="flex flex-col gap-4 px-5 pt-4 pb-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-semibold text-[#F4F7FC]">Findings</h2>
          <p className="text-sm text-[#828DA3]">
            Insights and observations across all models.
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

      <div className="border-stock bg-card overflow-hidden rounded-xl border">
        <Table className="[&_td]:px-4 [&_td]:py-3.5 [&_th]:h-12 [&_th]:px-4">
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Model / Version</TableHead>
              <TableHead>Severity</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Author</TableHead>
              <TableHead>Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockFindings.map((f) => (
              <TableRow
                key={f.id}
                className="cursor-pointer"
                onClick={() =>
                  navigate(`/dashboard/ml-studio/findings/${f.id}`)
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
                  <ModelVersionLink
                    modelId={f.modelId}
                    versionId={f.versionId}
                  />
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
