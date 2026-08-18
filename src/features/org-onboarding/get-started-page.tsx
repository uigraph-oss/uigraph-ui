'use client'

import { OnboardingStep } from '@/api/.gql/graphql'
import { TeamContextProvider } from '@/features/dashboard-settings/context/team-context'
import { START_REPOSITORY_IMPORT } from '@/features/github-import/api'
import { usePermissions } from '@/hooks/use-permissions'
import {
  refreshOrganizations,
  useAuthStore,
  useCurrentOrganization,
} from '@/store/auth-store'
import { useMutation } from '@apollo/client'
import { Loader2 } from 'lucide-react'
import { Navigate, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { COMPLETE_ONBOARDING } from './api'
import { ConnectGitHubStep } from './connect-github-step'
import { CreateTeamStep } from './create-team-step'
import { EnvironmentStep } from './environment-step'
import { RunStep } from './run-step'
import { RunnerStep } from './runner-step'
import { SelectRepositoryStep } from './select-repository-step'
import {
  useOnboardingProgress,
  type OnboardingProgress,
} from './use-onboarding-progress'

function resolveStep(progress: OnboardingProgress | null) {
  if (!progress) return OnboardingStep.Team
  if (progress.step === OnboardingStep.Team) return OnboardingStep.Team
  if (!progress.teamId) return OnboardingStep.Team
  if (progress.step === OnboardingStep.Runner) return OnboardingStep.Runner
  if (progress.step === OnboardingStep.Github) return OnboardingStep.Github
  if (!progress.repoOwner || !progress.repoName)
    return OnboardingStep.Repository
  if (progress.step === OnboardingStep.Repository) {
    return OnboardingStep.Repository
  }
  if (progress.step === OnboardingStep.Run && progress.importId) {
    return OnboardingStep.Run
  }
  return OnboardingStep.Environment
}

export function GetStartedPage() {
  const organization = useCurrentOrganization()
  const { isAdmin } = usePermissions()

  if (!organization) return <Navigate to="/onboarding" replace />
  if (!isAdmin) return <Navigate to="/services" replace />

  return (
    <TeamContextProvider>
      <OnboardingFlow orgID={organization.id} />
    </TeamContextProvider>
  )
}

function OnboardingFlow({ orgID }: { orgID: string }) {
  const navigate = useNavigate()
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

  if (isLoading) {
    return (
      <div className="bg-shading-gray text-paragraph flex min-h-screen items-center justify-center gap-2 font-mono text-[0.6875rem] tracking-[0.18em] uppercase">
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

  const step = githubEnabled ? resolveStep(progress) : OnboardingStep.Team
  const teamName = progress?.teamName ?? null

  if (step === OnboardingStep.Team) {
    return (
      <CreateTeamStep
        onCreated={(team) =>
          guard(async () => {
            if (!githubEnabled) {
              await finish()
              void navigate('/services')
              return
            }
            await save({ step: OnboardingStep.Runner, teamId: team.id })
          })
        }
      />
    )
  }

  if (step === OnboardingStep.Runner) {
    return (
      <RunnerStep
        teamName={teamName}
        runner={progress?.runner ?? null}
        onBack={() => void guard(() => save({ step: OnboardingStep.Team }))}
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
        teamName={teamName}
        onBack={() => void guard(() => save({ step: OnboardingStep.Runner }))}
        onNext={() => guard(() => save({ step: OnboardingStep.Repository }))}
      />
    )
  }

  if (step === OnboardingStep.Repository) {
    return (
      <SelectRepositoryStep
        orgID={orgID}
        teamName={teamName}
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
        teamName={teamName}
        owner={progress.repoOwner ?? ''}
        repo={progress.repoName ?? ''}
        onBack={() =>
          void guard(() => save({ step: OnboardingStep.Repository }))
        }
        onNext={async () => {
          const result = await startImport({
            variables: {
              orgID,
              teamID: progress.teamId ?? '',
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
        teamName={teamName}
        importID={progress.importId}
        onFinish={() => guard(finish)}
      />
    )
  }

  return <Navigate to="/services" replace />
}
