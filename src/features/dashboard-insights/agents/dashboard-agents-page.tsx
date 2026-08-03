'use client'

import { lazy, Suspense } from 'react'

const DashboardAgentsPageInner = lazy(() =>
  import('@/features/dashboard-insights/agents/dashboard-agents-page-inner').then(
    (mod) => ({ default: mod.DashboardAgentsPageInner })
  )
)

export function DashboardAgentsPage() {
  return (
    <Suspense>
      <DashboardAgentsPageInner />
    </Suspense>
  )
}
