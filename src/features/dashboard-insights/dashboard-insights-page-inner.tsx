'use client'

import { DashboardPageSectionLayout } from '@/features/dashboard'

export function DashboardInsightsPageInner() {
  return (
    <DashboardPageSectionLayout
      title="Insights"
      description="Cost and token savings from using Claude/Cursor with the uigraph MCP server."
      crumbs={[{ to: '/dashboard/insights', label: 'Insights' }]}
    >
      <p className="text-paragraph p-6 text-sm">Loading insights…</p>
    </DashboardPageSectionLayout>
  )
}
