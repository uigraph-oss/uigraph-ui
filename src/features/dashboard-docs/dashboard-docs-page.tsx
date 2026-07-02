'use client'

import { lazy, Suspense } from 'react'

const DashboardDocsPageInner = lazy(() =>
  import('@/features/dashboard-docs/dashboard-docs-page-inner').then((mod) => ({
    default: mod.DashboardDocsPageInner,
  }))
)

export function DashboardDocsPage() {
  return (
    <Suspense>
      <DashboardDocsPageInner />
    </Suspense>
  )
}
