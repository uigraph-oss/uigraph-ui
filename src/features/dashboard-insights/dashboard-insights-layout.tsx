'use client'

import { Button } from '@/components/ui/button'
import { DashboardPageLayout } from '@/features/dashboard'
import { cn } from '@/lib/utils'
import { URLPatternPolyfill } from '@/utils/polyfill'
import { useMemo } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'

const insightsTabs = [
  { id: 'overview', label: 'Overview' },
  { id: 'agents', label: 'Agents' },
] as const

const tabURLPattern = new URLPatternPolyfill({
  pathname: '/dashboard/insights/:tab{/*}?',
})

export function DashboardInsightsLayout() {
  const navigate = useNavigate()
  const { pathname } = useLocation()

  const activeTab = useMemo(() => {
    return tabURLPattern.exec({ pathname })?.pathname.groups.tab || 'overview'
  }, [pathname])

  const activeTabLabel = useMemo(() => {
    return insightsTabs.find((tab) => tab.id === activeTab)?.label || 'Overview'
  }, [activeTab])

  return (
    <DashboardPageLayout
      crumbs={[
        { to: '/dashboard/insights', label: 'Insights' },
        { to: `/dashboard/insights/${activeTab}`, label: activeTabLabel },
      ]}
    >
      <div className="flex h-full min-h-0 flex-col">
        <div className="border-stock bg-card flex items-center border-b-2">
          {insightsTabs.map((tab) => (
            <Button
              key={tab.id}
              variant="ghost"
              className={cn(
                'mb-[-2px] h-11 rounded-none border-b-2 border-transparent bg-transparent px-10 hover:bg-transparent',
                activeTab === tab.id && 'border-primary'
              )}
              onClick={() =>
                navigate(`/dashboard/insights/${tab.id}`, { replace: true })
              }
            >
              {tab.label}
            </Button>
          ))}
        </div>

        <Outlet />
      </div>
    </DashboardPageLayout>
  )
}
