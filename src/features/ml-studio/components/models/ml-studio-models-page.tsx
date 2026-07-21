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
import { useNavigate } from 'react-router-dom'
import { mockModels, mockVersions } from '../../constants/mock-data'
import { StatusBadge } from '../status-badge'

export function ModelsTab() {
  const navigate = useNavigate()

  return (
    <div className="flex flex-col gap-4 p-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-[#828DA3]">
          Model registry — every registered model and its production version.
        </p>
        <Button
          preset="primary"
          className="h-10"
          onClick={() => navigate('/dashboard/ml-studio/models/new')}
        >
          <PlusIcon />
          New Model
        </Button>
      </div>

      <div className="border-stock bg-card overflow-hidden rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Problem Type</TableHead>
              <TableHead>Domain</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead>Production Version</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Updated</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockModels.map((model) => {
              const prod = mockVersions.find(
                (v) => v.id === model.productionVersionId
              )
              return (
                <TableRow
                  key={model.id}
                  className="cursor-pointer"
                  onClick={() =>
                    navigate(`/dashboard/ml-studio/models/${model.id}`)
                  }
                >
                  <TableCell>
                    <div className="font-medium text-[#F4F7FC]">
                      {model.name}
                    </div>
                    <div className="line-clamp-1 text-sm text-[#828DA3]">
                      {model.description}
                    </div>
                  </TableCell>
                  <TableCell className="text-[#828DA3] capitalize">
                    {model.problemType}
                  </TableCell>
                  <TableCell className="text-[#828DA3]">
                    {model.domain}
                  </TableCell>
                  <TableCell className="text-[#828DA3]">
                    {model.owner}
                  </TableCell>
                  <TableCell>
                    {prod ? (
                      <span className="text-[#F4F7FC]">{prod.version}</span>
                    ) : (
                      <span className="text-[#586378]">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <StatusBadge value={model.status} />
                  </TableCell>
                  <TableCell className="text-sm text-[#828DA3]">
                    {new Date(model.updatedAt).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
