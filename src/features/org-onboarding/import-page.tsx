'use client'

import { OnboardingStep } from '@/api/.gql/graphql'
import { START_REPOSITORY_IMPORT } from '@/features/github-import/api'
import { usePermissions } from '@/hooks/use-permissions'
import {
  refreshOrganizations,
  useAuthStore,
  useCurrentOrganization,
} from '@/store/auth-store'
import { useMutation } from '@apollo/client'
import { Loader2 } from 'lucide-react'
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { COMPLETE_ONBOARDING } from './api/onboarding'
import { ConnectGitHubStep } from './components/connect-github-step'
import { EnvironmentStep } from './components/environment-step'
import { OnboardingTeamChip } from './components/onboarding-team-chip'
import { RunStep } from './components/run-step'
import { RunnerStep } from './components/runner-step'
import { SelectRepositoryStep } from './components/select-repository-step'
import {
  resolveStep,
  useOnboardingProgress,
} from './hooks/use-onboarding-progress'

export function ImportPage() {
  const organization = useCurrentOrganization()
  const { isAdmin } = usePermissions()

  if (!organization) return <Navigate to="/onboarding" replace />
  if (!isAdmin) return <Navigate to="/services" replace />

  return <ImportFlow orgID={organization.id} />
}

function ImportFlow({ orgID }: { orgID: string }) {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const githubEnabled = useAuthStore((state) => state.features.github)
  const { progress, isLoading, error, save } = useOnboardingProgress(orgID)
  const [completeOnboarding] = useMutation(COMPLETE_ONBOARDING)
  const [startImport] = useMutation(START_REPOSITORY_IMPORT)

  async function finish() {
    await completeOnboarding({ variables: { orgId: orgID } })
    await refreshOrganizations()
  }

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

  const teamID = searchParams.get('team') ?? ''
  if (teamID === '') return <OnboardingTeamChip />

  const step = resolveStep(progress)
  const headerRight = <OnboardingTeamChip />

  if (step === OnboardingStep.Runner) {
    return (
      <RunnerStep
        headerRight={headerRight}
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
        headerRight={headerRight}
        onBack={() => void guard(() => save({ step: OnboardingStep.Runner }))}
        onNext={() => guard(() => save({ step: OnboardingStep.Repository }))}
      />
    )
  }

  if (step === OnboardingStep.Repository) {
    return (
      <SelectRepositoryStep
        orgID={orgID}
        headerRight={headerRight}
        repoOwner={progress?.repoOwner ?? null}
        repoName={progress?.repoName ?? null}
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

  if (step === OnboardingStep.Environment && progress) {
    return (
      <EnvironmentStep
        orgID={orgID}
        headerRight={headerRight}
        owner={progress.repoOwner ?? ''}
        repo={progress.repoName ?? ''}
        onBack={() =>
          void guard(() => save({ step: OnboardingStep.Repository }))
        }
        onNext={async () => {
          const result = await startImport({
            variables: {
              orgID,
              teamID,
              owner: progress.repoOwner ?? '',
              repo: progress.repoName ?? '',
            },
          })
          const importId = result.data?.startRepositoryImport.id
          if (!importId) throw new Error('The run started without an ID')
          await save({ step: OnboardingStep.Run, importId })
        }}
      />
    )
  }

  if (step === OnboardingStep.Run && progress?.importId) {
    return (
      <RunStep
        orgID={orgID}
        headerRight={headerRight}
        importID={progress.importId}
        onFinish={() => guard(finish)}
      />
    )
  }

  return <Navigate to="/services" replace />
}
