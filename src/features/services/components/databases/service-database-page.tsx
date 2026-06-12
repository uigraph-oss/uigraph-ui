'use client'

import { lazy, Suspense } from 'react'

const ServiceDatabasePageInner = lazy(() =>
  import('@/features/services/components/databases/service-database-page-inner').then(
    (mod) => ({ default: mod.ServiceDatabasePageInner })
  )
)

export function ServiceDatabasePage() {
  return (
    <Suspense>
      <ServiceDatabasePageInner />
    </Suspense>
  )
}
