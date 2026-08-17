'use client'

import { DashboardPageSectionLayout } from '@/features/dashboard'
import { useCurrentOrganization } from '@/store/auth-store'
import { Navigate, useParams } from 'react-router-dom'
import { ImportProgress } from './import-progress'

export function ImportProgressPage() {
  const organization = useCurrentOrganization()
  const { importId } = useParams()

  if (!importId) return <Navigate to="/repositories/import" replace />
  if (!organization) return null

  return (
    <DashboardPageSectionLayout
      title="Repository setup"
      description="Live progress from the GitHub Actions run that documents your repository."
      crumbs={[
        { to: '/services', label: 'Services' },
        { to: '/repositories/import', label: 'Import from GitHub' },
        { to: `/repositories/import/${importId}`, label: 'Setup' },
      ]}
    >
      <div className="mx-auto flex w-full max-w-2xl flex-col pb-8">
        <ImportProgress orgID={organization.id} importID={importId} />
      </div>
    </DashboardPageSectionLayout>
  )
}
