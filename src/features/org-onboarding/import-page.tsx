'use client'

import { START_REPOSITORY_IMPORT } from '@/features/github-import/api'
import { usePermissions } from '@/hooks/use-permissions'
import { useAuthStore, useCurrentOrganization } from '@/store/auth-store'
import { useMutation } from '@apollo/client'
import { Navigate, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { ConnectGitHubStep } from './components/connect-github-step'
import { EnvironmentStep } from './components/environment-step'
import { RunnerStep } from './components/runner-step'
import { SelectRepositoryStep } from './components/select-repository-step'
import {
  OnboardingProvider,
  OnboardingStep,
  useOnboarding,
} from './context/onboarding-context'

export function ImportPage() {
  const organization = useCurrentOrganization()
  const { isAdmin } = usePermissions()

  if (!organization) return <Navigate to="/onboarding" replace />
  if (!isAdmin) return <Navigate to="/services" replace />

  return (
    <OnboardingProvider orgID={organization.id}>
      <ImportFlow />
    </OnboardingProvider>
  )
}

function ImportFlow() {
  const navigate = useNavigate()
  const githubEnabled = useAuthStore((state) => state.features.github)
  const { orgID, teamID, progress, step, save, clear } = useOnboarding()
  const [startImport] = useMutation(START_REPOSITORY_IMPORT)

  async function guard(action: () => Promise<void>) {
    try {
      await action()
    } catch (caught) {
      toast.error(
        caught instanceof Error ? caught.message : 'Could not save your setup'
      )
    }
  }

  if (!githubEnabled) return <Navigate to="/services" replace />

  if (step === OnboardingStep.Runner) {
    return (
      <RunnerStep
        onBack={() =>
          void guard(async () => {
            await save({ step: OnboardingStep.Team })
            void navigate('/get-started')
          })
        }
        onNext={(runner) =>
          guard(() => save({ step: OnboardingStep.Github, runner }))
        }
      />
    )
  }

  if (step === OnboardingStep.Github) {
    return (
      <ConnectGitHubStep
        orgID={orgID}
        onBack={() => void guard(() => save({ step: OnboardingStep.Runner }))}
        onNext={() => guard(() => save({ step: OnboardingStep.Repository }))}
      />
    )
  }

  if (step === OnboardingStep.Repository) {
    return (
      <SelectRepositoryStep
        orgID={orgID}
        repoOwner={progress.repoOwner}
        repoName={progress.repoName}
        onBack={() => void guard(() => save({ step: OnboardingStep.Github }))}
        onNext={(repository) =>
          guard(() =>
            save({
              step: OnboardingStep.Environment,
              repoOwner: repository.owner,
              repoName: repository.name,
            })
          )
        }
      />
    )
  }

  if (step === OnboardingStep.Environment) {
    return (
      <EnvironmentStep
        orgID={orgID}
        owner={progress.repoOwner ?? ''}
        repo={progress.repoName ?? ''}
        onBack={() =>
          void guard(() => save({ step: OnboardingStep.Repository }))
        }
        onNext={async () => {
          if (!teamID || !progress.repoOwner || !progress.repoName)
            throw new Error('Some of your setup is missing. Go back a step.')

          const result = await startImport({
            variables: {
              orgID,
              teamID,
              owner: progress.repoOwner,
              repo: progress.repoName,
            },
          })
          const importID = result.data?.startRepositoryImport.id
          if (!importID) throw new Error('The run started without an ID')

          clear()
          void navigate(`/get-started/import/${importID}`, { replace: true })
        }}
      />
    )
  }

  return <Navigate to="/services" replace />
}
