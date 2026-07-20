'use client'

import { GridScrollBody } from '@/components/grid-scroll-body'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DashboardHeader } from '@/features/dashboard'
import { cn } from '@/lib/utils'
import { URLPatternPolyfill } from '@/utils/polyfill'
import { useMemo } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { useModelContext } from '../../contexts/model-context'
import { StatusBadge } from '../status-badge'

const modelTabs = [
  { id: 'overview', label: 'Overview' },
  { id: 'experiments', label: 'Experiments' },
  { id: 'datasets', label: 'Datasets' },
  { id: 'evaluations', label: 'Evaluations' },
  { id: 'deployments', label: 'Deployments' },
  { id: 'findings', label: 'Findings' },
  { id: 'decisions', label: 'Decisions' },
] as const

const tabURLPattern = new URLPatternPolyfill({
  pathname: '/dashboard/ml-studio/:modelId/:tab{/*}?',
})

export function MlStudioModelLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { model, versions, selectedVersionId, selectedVersion, setVersionId } =
    useModelContext()

  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [searchParams] = useSearchParams()

  const activeTab = useMemo(() => {
    return tabURLPattern.exec({ pathname })?.pathname.groups.tab || 'overview'
  }, [pathname])

  const versionQuery = selectedVersionId ? `?v=${selectedVersionId}` : ''

  return (
    <div className="grid grid-rows-[auto_1fr] gap-[0.81rem] pt-3 pr-3">
      <DashboardHeader
        crumbs={[
          { to: '/dashboard/ml-studio', label: 'ML Studio' },
          {
            to: `/dashboard/ml-studio/${model.id}`,
            label: model.name,
          },
        ]}
      />

      <div className="grid grid-rows-[auto_auto_1fr] rounded-t-[1.2rem] bg-[#141925]">
        <div className="flex items-center justify-between gap-4 px-6 pt-5 pb-4">
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
              onValueChange={(value) => {
                const params = new URLSearchParams(searchParams)
                params.set('v', value)
                void navigate(`${pathname}?${params.toString()}`, {
                  replace: true,
                })
                void setVersionId(value)
              }}
            >
              <SelectTrigger className="w-56">
                <SelectValue placeholder="Select version" />
              </SelectTrigger>
              <SelectContent>
                {versions.map((v) => (
                  <SelectItem key={v.id} value={v.id}>
                    {v.displayName} · {v.version}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="border-stock flex items-center overflow-x-auto border-b-2">
          {modelTabs.map((tab) => (
            <Button
              key={tab.id}
              variant="ghost"
              className={cn(
                'mb-[-2px] h-11 rounded-none border-b-2 border-transparent bg-transparent px-8 hover:bg-transparent',
                activeTab === tab.id && 'border-primary'
              )}
              onClick={() =>
                navigate(
                  `/dashboard/ml-studio/${model.id}/${tab.id}${versionQuery}`,
                  { replace: true }
                )
              }
            >
              {tab.label}
            </Button>
          ))}
        </div>

        <GridScrollBody>{children}</GridScrollBody>
      </div>
    </div>
  )
}
