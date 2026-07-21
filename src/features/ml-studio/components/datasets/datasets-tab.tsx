'use client'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useNavigate } from 'react-router-dom'
import { useMlStudioData } from '../../contexts/ml-studio-data-context'

export function DatasetsTab() {
  const navigate = useNavigate()
  const { datasets } = useMlStudioData()

  return (
    <div className="flex flex-col gap-4 px-5 pt-4 pb-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-semibold text-[#F4F7FC]">Datasets</h2>
        <p className="text-sm text-[#828DA3]">
          Data sources across all models.
        </p>
      </div>

      <div className="border-stock bg-card overflow-hidden rounded-xl border">
        <Table className="table-fixed [&_td]:px-4 [&_td]:py-3.5 [&_th]:h-12 [&_th]:px-4">
          <TableHeader>
            <TableRow>
              <TableHead className="w-48">Name</TableHead>
              <TableHead className="w-28">Type</TableHead>
              <TableHead className="w-24">Rows</TableHead>
              <TableHead>Source</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {datasets.map((d) => (
              <TableRow
                key={d.id}
                className="cursor-pointer"
                onClick={() =>
                  navigate(`/dashboard/ml-studio/datasets/${d.id}`)
                }
              >
                <TableCell>
                  <div className="truncate font-medium text-[#F4F7FC]">
                    {d.name}
                  </div>
                </TableCell>
                <TableCell className="text-[#828DA3] capitalize">
                  {d.type}
                </TableCell>
                <TableCell className="text-[#828DA3]">
                  {d.rowCount.toLocaleString()}
                </TableCell>
                <TableCell className="truncate font-mono text-xs text-[#586378]">
                  {d.source}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
