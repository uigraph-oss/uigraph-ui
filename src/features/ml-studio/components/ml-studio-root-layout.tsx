'use client'

import { DashboardPageLayout } from '@/features/dashboard'
import { Outlet } from 'react-router-dom'

export function MlStudioRootLayout() {
  return (
    <DashboardPageLayout
      crumbs={[{ to: '/dashboard/ml-studio', label: 'ML Studio' }]}
    >
      <Outlet />
    </DashboardPageLayout>
  )
}
