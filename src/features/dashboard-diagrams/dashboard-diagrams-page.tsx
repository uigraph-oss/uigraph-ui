'use client'

import { lazy, Suspense } from 'react'

const DashboardDiagramsPageInner = lazy(() =>
  import('@/features/dashboard-diagrams/dashboard-diagrams-page-inner').then(
    (mod) => ({ default: mod.DashboardDiagramsPageInner })
  )
)

export function DashboardDiagramsPage() {
  return (
    <Suspense>
      <DashboardDiagramsPageInner />
    </Suspense>
  )
}
