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
import { ModelVersionLink } from '../model-version-link'
import { DatasetModal } from './dataset-modal'

export function DatasetsTab() {
  const navigate = useNavigate()
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <div className="flex flex-col gap-4 px-5 pt-4 pb-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-semibold text-[#F4F7FC]">Datasets</h2>
          <p className="text-sm text-[#828DA3]">
            Data sources across all models.
          </p>
        </div>
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
        <Table className="[&_td]:px-4 [&_td]:py-3.5 [&_th]:h-12 [&_th]:px-4">
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Model / Version</TableHead>
              <TableHead>Version</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Rows</TableHead>
              <TableHead>Size</TableHead>
              <TableHead>Tags</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockDatasets.map((d) => (
              <TableRow
                key={d.id}
                className="cursor-pointer"
                onClick={() =>
                  navigate(`/dashboard/ml-studio/datasets/${d.id}`)
                }
              >
                <TableCell>
                  <div className="font-medium text-[#F4F7FC]">{d.name}</div>
                  <div className="line-clamp-1 text-sm text-[#828DA3]">
                    {d.description}
                  </div>
                </TableCell>
                <TableCell>
                  <ModelVersionLink
                    modelId={d.modelId}
                    versionId={d.versionId}
                  />
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
