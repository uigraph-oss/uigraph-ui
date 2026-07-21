'use client'

import { GridScrollBody } from '@/components/grid-scroll-body'
import { Button } from '@/components/ui/button'
import { DashboardHeader } from '@/features/dashboard'
import { cn } from '@/lib/utils'
import { URLPatternPolyfill } from '@/utils/polyfill'
import { useMemo } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'

const rootTabs = [
  { id: 'models', label: 'Models' },
  { id: 'experiments', label: 'Experiments' },
  { id: 'datasets', label: 'Datasets' },
  { id: 'deployments', label: 'Deployments' },
  { id: 'findings', label: 'Findings' },
  { id: 'decisions', label: 'Decisions' },
] as const

const tabURLPattern = new URLPatternPolyfill({
  pathname: '/dashboard/ml-studio/:tab{/*}?',
})

export function MlStudioRootLayout() {
  const navigate = useNavigate()
  const { pathname } = useLocation()

  const activeTab = useMemo(() => {
    return tabURLPattern.exec({ pathname })?.pathname.groups.tab || 'models'
  }, [pathname])

  return (
    <div className="grid grid-rows-[auto_1fr] gap-[0.81rem] pt-3 pr-3">
      <DashboardHeader
        crumbs={[{ to: '/dashboard/ml-studio', label: 'ML Studio' }]}
      />

      <div className="grid grid-rows-[auto_auto_1fr] rounded-t-[1.2rem] bg-[#141925]">
        <div className="flex items-center justify-between gap-4 px-6 pt-5 pb-4">
          <h1 className="text-xl font-semibold text-[#F4F7FC]">ML Studio</h1>
        </div>

        <div className="border-stock flex items-center overflow-x-auto border-b-2">
          {rootTabs.map((tab) => (
            <Button
              key={tab.id}
              variant="ghost"
              className={cn(
                'mb-[-2px] h-11 rounded-none border-b-2 border-transparent bg-transparent px-8 hover:bg-transparent',
                activeTab === tab.id && 'border-primary'
              )}
              onClick={() =>
                navigate(`/dashboard/ml-studio/${tab.id}`, { replace: true })
              }
            >
              {tab.label}
            </Button>
          ))}
        </div>

        <GridScrollBody>
          <Outlet />
        </GridScrollBody>
      </div>
    </div>
  )
}
