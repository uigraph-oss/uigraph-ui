'use client'

import { TeamContextProvider } from '@/features/dashboard-settings/context/team-context'
import { usePermissions } from '@/hooks/use-permissions'
import {
  refreshOrganizations,
  useAuthStore,
  useCurrentOrganization,
} from '@/store/auth-store'
import { useMutation } from '@apollo/client'
import { Navigate, useNavigate } from 'react-router-dom'
import { COMPLETE_ONBOARDING } from './api/onboarding'
import { CreateTeamStep } from './components/create-team-step'
import {
  OnboardingProvider,
  OnboardingStep,
  useOnboarding,
} from './context/onboarding-context'

export function GetStartedPage() {
  const organization = useCurrentOrganization()
  const { isAdmin } = usePermissions()

  if (!organization) return <Navigate to="/onboarding" replace />
  if (!isAdmin) return <Navigate to="/services" replace />

  return (
    <OnboardingProvider orgID={organization.id}>
      <TeamContextProvider>
        <TeamFlow />
      </TeamContextProvider>
    </OnboardingProvider>
  )
}

function TeamFlow() {
  const navigate = useNavigate()
  const githubEnabled = useAuthStore((state) => state.features.github)
  const { orgID, progress, save } = useOnboarding()
  const [completeOnboarding] = useMutation(COMPLETE_ONBOARDING)

  if (
    githubEnabled &&
    progress.teamId &&
    progress.step !== OnboardingStep.Team
  ) {
    return (
      <Navigate to={`/get-started/import?team=${progress.teamId}`} replace />
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
      onSkip={() => void navigate('/get-started/import')}
    />
  )
}
