'use client'

import { OnboardingStep } from '@/api/.gql/graphql'
import { TeamContextProvider } from '@/features/dashboard-settings/context/team-context'
import { usePermissions } from '@/hooks/use-permissions'
import {
  refreshOrganizations,
  useAuthStore,
  useCurrentOrganization,
} from '@/store/auth-store'   
import { useMutation } from '@apollo/client'
import { Loader2 } from 'lucide-react'
import { Navigate, useNavigate } from 'react-router-dom'
import { COMPLETE_ONBOARDING  } from './api'
import { CreateTeamStep } from './create-team-step'
import { resolveStep, useOnboardingProgress } from './use-onboarding-progress'
  
export function GetStartedPage() {
  const organization = useCurrentOrganization()
  const { isAdmin } = usePermissions()

  if (!organization) return <Navigate to="/onboarding" replace />
  if (!isAdmin) return <Navigate to="/services" replace />

  return ( 
    <TeamContextProvider>
      <TeamFlow orgID={organization.id} />
    </TeamContextProvider>
  )
}

function TeamFlow({ orgID }: { orgID: string }) {
  const navigate = useNavigate()
  const githubEnabled = useAuthStore((state) => state.features.github)
  const { progress, isLoading, error, save } = useOnboardingProgress(orgID)
  const [completeOnboarding] = useMutation(COMPLETE_ONBOARDING)

  if (isLoading) {
    return (
      <div className="bg-shading-gray text-paragraph flex min-h-screen items-center justify-center gap-2 text-sm">
        <Loader2 className="size-4 animate-spin" /> Loading your setup
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-shading-gray text-destructive flex min-h-screen items-center justify-center px-6 text-center text-sm">
        {error.message}
      </div>
    )
  }

  if (githubEnabled && resolveStep(progress) !== OnboardingStep.Team) {
    return (
      <Navigate to={`/get-started/import?team=${progress?.teamId}`} replace />
    )
  }

  return (
    <CreateTeamStep
      onContinue={async (team) => {
        if (!githubEnabled) {
          await completeOnboarding({ variables: { orgId: orgID } })
          await refreshOrganizations()
          void navigate('/services')
          return
        }
        await save({ step: OnboardingStep.Runner, teamId: team.id })
        void navigate(`/get-started/import?team=${team.id}`)
      }}
    />
  )
}
