'use client'

import { UiGraphLogo } from '@/components/logo'
import { Button } from '@/components/ui/button'
import { TeamContextProvider } from '@/features/dashboard-settings/context/team-context'
import {
  GITHUB_APP,
  LATEST_REPOSITORY_IMPORT,
} from '@/features/github-import/api'
import { ConnectGitHubStep } from '@/features/github-import/connect-github-step'
import { ImportProgress } from '@/features/github-import/import-progress'
import {
  SelectRepositoryStep,
  type SelectedRepository,
} from '@/features/github-import/select-repository-step'
import { SyncOptionStep } from '@/features/github-import/sync-option-step'
import { usePermissions } from '@/hooks/use-permissions'
import { cn } from '@/lib/utils'
import {
  refreshOrganizations,
  useAuthStore,
  useCurrentOrganization,
} from '@/store/auth-store'
import { useMutation, useQuery } from '@apollo/client'
import { Loader2 } from 'lucide-react'
import { useRef, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { COMPLETE_ONBOARDING } from './api'
import { TeamsStep } from './teams-step'
import { WelcomeStep } from './welcome-step'

const STEPS = [
  'welcome',
  'teams',
  'github',
  'repository',
  'sync',
  'progress',
] as const
type Step = (typeof STEPS)[number]

export function GetStartedPage() {
  const organization = useCurrentOrganization()
  const { isAdmin } = usePermissions()

  if (!organization) return <Navigate to="/onboarding" replace />
  if (!isAdmin) return <Navigate to="/services" replace />

  return (
    <main className="bg-shading-gray flex min-h-screen justify-center overflow-y-auto px-6 py-10">
      <div className="flex w-full max-w-2xl flex-col">
        <TeamContextProvider>
          <GetStartedWizard orgID={organization.id} />
        </TeamContextProvider>
      </div>
    </main>
  )
}

function GetStartedWizard({ orgID }: { orgID: string }) {
  const navigate = useNavigate()
  const githubEnabled = useAuthStore((state) => state.features.github)
  const [step, setStep] = useState<Step | null>(null)
  const [team, setTeam] = useState<{ id: string; name: string } | null>(null)
  const [repository, setRepository] = useState<SelectedRepository | null>(null)
  const [startedImportID, setStartedImportID] = useState<string | null>(null)
  const [finishError, setFinishError] = useState('')
  const finishedRef = useRef(false)

  const [completeOnboarding, { loading: isSkipping }] =
    useMutation(COMPLETE_ONBOARDING)
  const installationQuery = useQuery(GITHUB_APP, {
    variables: { orgID },
    fetchPolicy: 'network-only',
  })
  const latestQuery = useQuery(LATEST_REPOSITORY_IMPORT, {
    variables: { orgID },
    fetchPolicy: 'network-only',
  })

  const latest = latestQuery.data?.latestRepositoryImport ?? null
  const importID = startedImportID ?? latest?.id ?? null
  const currentStep = step ?? (importID ? 'progress' : 'welcome')
  const isResuming =
    (latestQuery.loading && !latestQuery.data) ||
    (installationQuery.loading && !installationQuery.data)

  async function finish() {
    if (finishedRef.current) return
    finishedRef.current = true
    setFinishError('')
    try {
      await completeOnboarding({ variables: { orgId: orgID } })
      await refreshOrganizations()
    } catch (caught) {
      finishedRef.current = false
      setFinishError(
        caught instanceof Error ? caught.message : 'Could not finish onboarding'
      )
    }
  }

  async function handleSkip() {
    await finish()
    void navigate('/services')
  }

  const canSkip = currentStep !== 'welcome' && currentStep !== 'teams'

  return (
    <>
      <div className="relative flex shrink-0 flex-col items-center gap-4 pb-8">
        <UiGraphLogo className="size-10" />
        <StepDots step={currentStep} githubEnabled={githubEnabled} />
        {canSkip && (
          <Button
            preset="ghost"
            disabled={isSkipping}
            onClick={handleSkip}
            className="text-paragraph absolute top-0 right-0 h-8 rounded-lg px-2.5 text-xs"
          >
            {isSkipping && <Loader2 className="size-3.5 animate-spin" />}
            {currentStep === 'progress'
              ? 'Continue to UIGraph'
              : 'Skip for now'}
          </Button>
        )}
      </div>

      {finishError && (
        <p className="text-destructive shrink-0 pb-3 text-center text-xs">
          {finishError}
        </p>
      )}

      {isResuming && (
        <div className="text-paragraph flex flex-1 items-center justify-center gap-2 py-16 text-sm">
          <Loader2 className="size-4 animate-spin" /> Loading your setup
        </div>
      )}

      {!isResuming && currentStep === 'welcome' && (
        <WelcomeStep onNext={() => setStep('teams')} />
      )}

      {!isResuming && currentStep === 'teams' && (
        <TeamsStep
          selectedTeamID={team?.id ?? null}
          onBack={() => setStep('welcome')}
          onSelect={setTeam}
          onNext={() => {
            if (!githubEnabled) {
              void handleSkip()
              return
            }
            setStep('github')
          }}
        />
      )}

      {!isResuming && currentStep === 'github' && (
        <ConnectGitHubStep
          orgID={orgID}
          onBack={() => setStep('teams')}
          onNext={() => setStep('repository')}
        />
      )}

      {!isResuming && currentStep === 'repository' && team && (
        <SelectRepositoryStep
          orgID={orgID}
          teamID={team.id}
          teamName={team.name}
          selected={repository}
          onBack={() => setStep('github')}
          onSelect={setRepository}
          onNext={() => setStep('sync')}
        />
      )}

      {!isResuming && currentStep === 'sync' && team && repository && (
        <SyncOptionStep
          orgID={orgID}
          teamID={team.id}
          repository={repository}
          onBack={() => setStep('repository')}
          onStarted={(id) => {
            setStartedImportID(id)
            setStep('progress')
          }}
        />
      )}

      {!isResuming && currentStep === 'progress' && importID && (
        <ImportProgress
          orgID={orgID}
          importID={importID}
          onCompleted={finish}
        />
      )}
    </>
  )
}

function StepDots({
  step,
  githubEnabled,
}: {
  step: Step
  githubEnabled: boolean
}) {
  const visible = githubEnabled ? STEPS : STEPS.slice(0, 2)
  const current = visible.indexOf(step)
  if (current === -1) return null

  return (
    <div
      className="flex items-center gap-1.5"
      aria-label={`Step ${current + 1} of ${visible.length}`}
    >
      {visible.map((item, index) => (
        <span
          key={item}
          className={cn(
            'h-1.5 rounded-full transition-all duration-300',
            index === current && 'bg-primary w-6',
            index < current && 'bg-primary/40 w-1.5',
            index > current && 'bg-stock w-1.5'
          )}
        />
      ))}
    </div>
  )
}
