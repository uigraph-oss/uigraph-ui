import { lazy } from 'react'

// Heavy, client-only pages (formerly Next `dynamic(..., { ssr: false })`).
export const DiagramPortalPage = lazy(() =>
  import('@/features/diagram-portal/diagram-portal-page').then((mod) => ({
    default: mod.DiagramPortalPage,
  }))
)

export const ApiGroupEndpointsPage = lazy(() =>
  import('@/features/services/components/apis/api-group-endpoints-page').then(
    (mod) => ({ default: mod.ApiGroupEndpointsPage })
  )
)

export const TestRunExecutionPage = lazy(() =>
  import('@/features/services/components/tests/test-run-execution-page').then(
    (mod) => ({ default: mod.TestRunExecutionPage })
  )
)

export const TestRunDetailsPage = lazy(() =>
  import('@/features/services/components/tests/test-run-details-page').then(
    (mod) => ({ default: mod.TestRunDetailsPage })
  )
)
