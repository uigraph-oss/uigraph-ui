'use client'

import { GridScrollBody } from '@/components/grid-scroll-body'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DashboardHeader } from '@/features/dashboard'
import { useModelContext } from '../../contexts/model-context'
import { StatusBadge } from '../status-badge'

export function MlStudioModelLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { model, versions, selectedVersionId, selectedVersion, setVersionId } =
    useModelContext()

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
        <div className="border-stock flex items-center justify-between gap-4 border-b-2 px-6 pt-5 pb-4">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-semibold text-[#F4F7FC]">
              {model.name}
            </h1>
            {selectedVersion && <StatusBadge value={selectedVersion.stage} />}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-[#828DA3]">Version</span>
            <Select
              value={selectedVersionId}
              onValueChange={(value) => void setVersionId(value)}
            >
              <SelectTrigger className="w-56">
                <SelectValue placeholder="Select version" />
              </SelectTrigger>
              <SelectContent>
                {versions.map((v) => (
                  <SelectItem key={v.id} value={v.id}>
                    {v.version}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <GridScrollBody>{children}</GridScrollBody>
      </div>
    </div>
  )
}
