'use client'

import { usePermissions } from '@/hooks/use-permissions'
import {
  refreshOrganizations,
  useCurrentOrganization,
} from '@/store/auth-store'
import { useMutation } from '@apollo/client'
import { Navigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { COMPLETE_ONBOARDING } from './api/onboarding'
import { RunStep } from './components/run-step'

export function RunPage() {
  const organization = useCurrentOrganization()
  const { isAdmin } = usePermissions()
  const { importID } = useParams()
  const [completeOnboarding] = useMutation(COMPLETE_ONBOARDING)

  if (!organization) return <Navigate to="/onboarding" replace />
  if (!isAdmin) return <Navigate to="/services" replace />
  if (!importID) return <Navigate to="/get-started/import" replace />

  async function finish() {
    try {
      await completeOnboarding({ variables: { orgId: organization.id } })
      await refreshOrganizations()
    } catch (caught) {
      toast.error(
        caught instanceof Error ? caught.message : 'Could not finish your setup'
      )
    }
  }

  return (
    <RunStep orgID={organization.id} importID={importID} onFinish={finish} />
  )
}
