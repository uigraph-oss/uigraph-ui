'use client'

import { UiGraphLogo } from '@/components/logo'
import { Button } from '@/components/ui/button'
import { Dialog, DialogOverlay, DialogPortal } from '@/components/ui/dialog'
import { TeamContextProvider } from '@/features/dashboard-settings/context/team-context'
import { usePermissions } from '@/hooks/use-permissions'
import { cn } from '@/lib/utils'
import {
  refreshOrganizations,
  useCurrentOrganization,
} from '@/store/auth-store'
import { useMutation, useQuery } from '@apollo/client'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { Loader2 } from 'lucide-react'
import { useState } from 'react'
import { COMPLETE_ONBOARDING, LATEST_REPOSITORY_ONBOARDING } from './api'
import { GitHubStep } from './github-step'
import { ProgressStep } from './progress-step'
import { RepositoriesStep } from './repositories-step'
import { TeamsStep } from './teams-step'
import { WelcomeStep } from './welcome-step'

const STEPS = [
  'welcome',
  'teams',
  'github',
  'repositories',
  'progress',
] as const
type Step = (typeof STEPS)[number]

export function OrgOnboardingDialog() {
  const organization = useCurrentOrganization()
  const { isAdmin } = usePermissions()

  const open = Boolean(isAdmin && organization && !organization.onboardingDone)
  if (!open) return null

  return (
    <Dialog open>
      <DialogPortal>
        <DialogOverlay className="bg-black/60 backdrop-blur-md" />
        <DialogPrimitive.Content
          onInteractOutside={(event) => event.preventDefault()}
          onEscapeKeyDown={(event) => event.preventDefault()}
          className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 bg-shading border-stock fixed top-1/2 left-1/2 z-50 h-[min(38rem,calc(100dvh-1.5rem))] w-[calc(100%-1.5rem)] max-w-[36rem] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl border p-0 shadow-2xl duration-200"
        >
          <TeamContextProvider>
            <OrgOnboardingWizard orgID={organization!.id} />
          </TeamContextProvider>
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  )
}

function OrgOnboardingWizard({ orgID }: { orgID: string }) {
  const [step, setStep] = useState<Step | null>(null)
  const [startedBatchID, setStartedBatchID] = useState<string | null>(null)
  const [ignoreOpenBatch, setIgnoreOpenBatch] = useState(false)
  const [team, setTeam] = useState<{ id: string; name: string } | null>(null)
  const [skipError, setSkipError] = useState('')
  const [completeOnboarding, { loading: isSkipping }] =
    useMutation(COMPLETE_ONBOARDING)

  async function handleSkip() {
    setSkipError('')
    try {
      await completeOnboarding({ variables: { orgId: orgID } })
      await refreshOrganizations()
    } catch (caught) {
      setSkipError(
        caught instanceof Error ? caught.message : 'Could not skip onboarding'
      )
    }
  }

  const latestQuery = useQuery(LATEST_REPOSITORY_ONBOARDING, {
    variables: { orgID },
    fetchPolicy: 'network-only',
  })

  const openBatchID = ignoreOpenBatch
    ? null
    : (latestQuery.data?.latestRepositoryOnboarding?.id ?? null)
  const batchID = startedBatchID ?? openBatchID
  const currentStep = step ?? (batchID ? 'progress' : 'welcome')
  const isResuming = latestQuery.loading && !latestQuery.data

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="relative flex shrink-0 flex-col items-center gap-3.5 px-6 pt-7 pb-5 sm:px-8">
        <UiGraphLogo className="size-9" />
        <StepDots step={currentStep} />
        <Button
          preset="ghost"
          disabled={isSkipping}
          onClick={handleSkip}
          className="text-paragraph absolute top-4 right-4 h-8 rounded-lg px-2.5 text-xs"
        >
          {isSkipping && <Loader2 className="size-3.5 animate-spin" />}
          Skip for now
        </Button>
      </div>

      {skipError && (
        <p className="text-destructive shrink-0 px-6 pb-3 text-center text-xs sm:px-8">
          {skipError}
        </p>
      )}

      {isResuming && (
        <div className="text-paragraph flex min-h-0 flex-1 items-center justify-center gap-2 text-sm">
          <Loader2 className="size-4 animate-spin" /> Loading your onboarding
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
          onNext={() => setStep('github')}
        />
      )}

      {!isResuming && currentStep === 'github' && (
        <GitHubStep
          orgID={orgID}
          onBack={() => setStep('teams')}
          onNext={() => setStep('repositories')}
        />
      )}

      {!isResuming && currentStep === 'repositories' && team && (
        <RepositoriesStep
          orgID={orgID}
          team={team}
          onBack={() => setStep('github')}
          onStarted={(id) => {
            setStartedBatchID(id)
            setIgnoreOpenBatch(false)
            setStep('progress')
          }}
        />
      )}

      {!isResuming && currentStep === 'progress' && batchID && (
        <ProgressStep
          orgID={orgID}
          batchID={batchID}
          onRestart={() => {
            setStartedBatchID(null)
            setIgnoreOpenBatch(true)
            setStep('welcome')
          }}
        />
      )}
    </div>
  )
}

function StepDots({ step }: { step: Step }) {
  const current = STEPS.indexOf(step)
  return (
    <div
      className="flex items-center gap-1.5"
      aria-label={`Step ${current + 1} of ${STEPS.length}`}
    >
      {STEPS.map((item, index) => (
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
