'use client'

import { GridScrollBody } from '@/components/grid-scroll-body'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DashboardHeader } from '@/features/dashboard'
import { ArrowLeftIcon } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useModelContext } from '../../contexts/model-context'
import { StatusBadge } from '../status-badge'

export function MlStudioModelLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const {
    model,
    versions,
    latestVersionId,
    selectedVersionId,
    selectedVersion,
    setVersionId,
  } = useModelContext()
  const navigate = useNavigate()

  return (
    <div className="grid grid-rows-[auto_1fr] gap-[0.81rem] pt-3 pr-3">
      <DashboardHeader
        crumbs={[
          { to: '/dashboard/ml-studio', label: 'ML Studio' },
          { to: '/dashboard/ml-studio/models', label: 'Models' },
          {
            to: `/dashboard/ml-studio/models/${model.id}`,
            label: model.name,
          },
        ]}
      />

      <div className="grid grid-rows-[auto_1fr] rounded-t-[1.2rem] bg-[#141925]">
        <div className="flex items-center justify-between gap-4 pt-3 pr-3 pb-0 pl-6">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-semibold text-[#F4F7FC]">
              {model.name}
            </h1>
            {selectedVersion && <StatusBadge value={selectedVersion.stage} />}
          </div>

          <div className="flex items-center gap-2">
            <Select
              value={selectedVersionId}
              onValueChange={(value) => void setVersionId(value)}
            >
              <SelectTrigger className="border-stock text-foreground/80 h-[2.7938125rem] w-56 rounded-[0.80315625rem] bg-transparent px-4">
                <SelectValue placeholder="Select version" />
              </SelectTrigger>
              <SelectContent>
                {versions.map((v) => (
                  <SelectItem key={v.id} value={v.id}>
                    <span>{v.version}</span>
                    {v.id === latestVersionId && (
                      <Badge className="border-stock rounded-md border bg-[#1E2533] text-[#828DA3]">
                        Latest
                      </Badge>
                    )}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              preset="outline"
              onClick={() => navigate('/dashboard/ml-studio/models')}
            >
              <ArrowLeftIcon />
              Go To Model Registry
            </Button>
          </div>
        </div>

        <GridScrollBody>{children}</GridScrollBody>
      </div>
    </div>
  )
}
