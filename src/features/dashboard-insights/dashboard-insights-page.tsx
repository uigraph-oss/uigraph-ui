'use client'

import { lazy, Suspense } from 'react'

const DashboardInsightsPageInner = lazy(() =>
  import('@/features/dashboard-insights/dashboard-insights-page-inner').then(
    (mod) => ({ default: mod.DashboardInsightsPageInner })
  )
)

export function DashboardInsightsPage() {
  return (
    <Suspense>
      <DashboardInsightsPageInner />
    </Suspense>
  )
}
