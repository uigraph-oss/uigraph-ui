'use client'

import { Badge } from '@/components/ui/badge'
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
import { mockDatasets } from '../../constants/mock-data'
import { useModelContext } from '../../contexts/model-context'
import { DatasetModal } from './dataset-modal'

export function DatasetsTab() {
  const { model, selectedVersionId } = useModelContext()
  const navigate = useNavigate()
  const [modalOpen, setModalOpen] = useState(false)
  const versionQuery = selectedVersionId ? `?v=${selectedVersionId}` : ''

  const datasets = mockDatasets.filter((d) => d.versionId === selectedVersionId)

  return (
    <div className="flex flex-col gap-4 p-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-[#828DA3]">
          Data sources referenced by this version.
        </p>
        <Button
          preset="primary"
          className="h-10"
          onClick={() => setModalOpen(true)}
        >
          <PlusIcon />
          Register dataset
        </Button>
      </div>

      <div className="border-stock bg-card overflow-hidden rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Version</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Rows</TableHead>
              <TableHead>Size</TableHead>
              <TableHead>Tags</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {datasets.map((d) => (
              <TableRow
                key={d.id}
                className="cursor-pointer"
                onClick={() =>
                  navigate(
                    `/dashboard/ml-studio/${model.id}/datasets/${d.id}${versionQuery}`
                  )
                }
              >
                <TableCell>
                  <div className="font-medium text-[#F4F7FC]">{d.name}</div>
                  <div className="line-clamp-1 text-sm text-[#828DA3]">
                    {d.description}
                  </div>
                </TableCell>
                <TableCell className="text-[#828DA3]">{d.version}</TableCell>
                <TableCell className="text-[#828DA3] capitalize">
                  {d.type}
                </TableCell>
                <TableCell className="text-[#828DA3]">
                  {d.rowCount.toLocaleString()}
                </TableCell>
                <TableCell className="text-[#828DA3]">{d.size}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {d.tags.map((t) => (
                      <Badge
                        key={t}
                        className="border-stock rounded-md border bg-[#1E2533] text-[#828DA3]"
                      >
                        {t}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <DatasetModal open={modalOpen} onOpenChange={setModalOpen} />
    </div>
  )
}
