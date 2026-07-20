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
import {
  DashboardSectionContent,
  DashboardSectionHeader,
} from '@/features/dashboard'
import { DashboardPageLayout } from '@/features/dashboard/dashboard-layout'
import { PlusIcon } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { mockModels, mockVersions } from '../../constants/mock-data'
import { StatusBadge } from '../status-badge'

export function MlStudioModelsPage() {
  const navigate = useNavigate()

  return (
    <DashboardPageLayout
      crumbs={[{ to: '/dashboard/ml-studio', label: 'ML Studio' }]}
    >
      <div className="flex h-full flex-col">
        <DashboardSectionHeader
          title="Models"
          description="Model registry — experiments, versions, evaluations, and findings for every model."
        >
          <Button
            preset="primary"
            onClick={() => navigate('/dashboard/ml-studio/new')}
          >
            <PlusIcon />
            New Model
          </Button>
        </DashboardSectionHeader>

        <DashboardSectionContent>
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
                        navigate(`/dashboard/ml-studio/${model.id}`)
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
        </DashboardSectionContent>
      </div>
    </DashboardPageLayout>
  )
}
