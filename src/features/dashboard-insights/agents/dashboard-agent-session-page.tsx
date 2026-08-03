'use client'

import { lazy, Suspense } from 'react'

const DashboardAgentSessionPageInner = lazy(() =>
  import('@/features/dashboard-insights/agents/dashboard-agent-session-page-inner').then(
    (mod) => ({ default: mod.DashboardAgentSessionPageInner })
  )
)

export function DashboardAgentSessionPage() {
  return (
    <Suspense>
      <DashboardAgentSessionPageInner />
    </Suspense>
  )
}
