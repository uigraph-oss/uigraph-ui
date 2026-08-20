'use client'

import { usePermissions } from '@/hooks/use-permissions'
import { useCurrentOrganization } from '@/store/auth-store'
import { Navigate, useParams } from 'react-router-dom'
import { RunStep } from './components/run-step'

export function RunPage() {
  const organization = useCurrentOrganization()
  const { isAdmin } = usePermissions()
  const { importID } = useParams()

  if (!organization) return <Navigate to="/onboarding" replace />
  if (!isAdmin) return <Navigate to="/services" replace />
  if (!importID) return <Navigate to="/get-started/import" replace />

  return <RunStep orgID={organization.id} importID={importID} />
}
