'use client'

import { GridScrollBody } from '@/components/grid-scroll-body'
import { DashboardHeader } from '@/features/dashboard'
import { Outlet } from 'react-router-dom'

export function MlStudioRootLayout() {
  return (
    <div className="grid grid-rows-[auto_1fr] gap-[0.81rem] pt-3 pr-3">
      <DashboardHeader
        crumbs={[{ to: '/dashboard/ml-studio', label: 'ML Studio' }]}
      />

      <div className="grid grid-rows-[auto_1fr] rounded-t-[1.2rem] bg-[#141925]">
        <GridScrollBody>
          <Outlet />
        </GridScrollBody>
      </div>
    </div>
  )
}
