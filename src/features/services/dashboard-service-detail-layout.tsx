'use client'

import { GridScrollBody } from '@/components/grid-scroll-body'
import { SuperCircleLoader } from '@/components/loader'
import { SectionLoader } from '@/components/section-loader'
import { Button } from '@/components/ui/button'
import { DashboardHeader } from '@/features/dashboard'
import { cn } from '@/lib/utils'
import { URLPatternPolyfill } from '@/utils/polyfill'
import { PropsWithChildren, useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { serviceTabs } from './constants/paths'
import { useServiceContext } from './contexts/service-context'

const tabURLPattern = new URLPatternPolyfill({
  pathname: '/services/:serviceId/:tab{/*}?',
})

export function DashboardServiceDetailLayout({ children }: PropsWithChildren) {
  const { service, isServiceLoading } = useServiceContext()

  const navigate = useNavigate()
  const { pathname } = useLocation()
  const activeTab = useMemo(() => {
    return tabURLPattern.exec({ pathname })?.pathname.groups.tab || 'overview'
  }, [pathname])

  const activeTabLabel = useMemo(() => {
    return serviceTabs.find((tab) => tab.id === activeTab)?.label || 'Overview'
  }, [activeTab])

  return (
    <div className="grid grid-rows-[auto_1fr] gap-[0.81rem] pt-3 pr-3">
      <DashboardHeader
        crumbs={[
          { to: '/services', label: 'Services' },
          {
            to: `/services/${service?.id}`,
            label: isServiceLoading ? (
              <SuperCircleLoader />
            ) : (
              service?.name || 'Untitled Service'
            ),
          },
          {
            to: `/services/${service?.id}/${activeTab}`,
            label: isServiceLoading ? <SuperCircleLoader /> : activeTabLabel,
          },
        ]}
      />

      {isServiceLoading ? (
        <div className="flex h-full items-center justify-center rounded-t-[1.2rem] bg-[#141925]">
          <SectionLoader />
        </div>
      ) : service ? (
        <div className="grid grid-rows-[auto_1fr] rounded-t-[1.2rem] bg-[#141925]">
          <div className="border-stock flex items-center border-b-2">
            {serviceTabs.map((tab) => (
              <Button
                key={tab.id}
                variant="ghost"
                className={cn(
                  'mb-[-2px] h-11 rounded-none border-b-2 border-transparent bg-transparent px-10 hover:bg-transparent',
                  activeTab === tab.id && 'border-primary'
                )}
                onClick={() =>
                  navigate(`/services/${service.id}/${tab.id}`, {
                    replace: true,
                  })
                }
              >
                {tab.label}
              </Button>
            ))}
          </div>

          <GridScrollBody>{children}</GridScrollBody>
        </div>
      ) : (
        <div>Service not found</div>
      )}
    </div>
  )
}
