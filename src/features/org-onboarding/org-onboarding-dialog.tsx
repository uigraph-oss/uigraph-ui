'use client'

import { UiGraphLogo } from '@/components/logo'
import { Dialog, DialogOverlay, DialogPortal } from '@/components/ui/dialog'
import { TeamContextProvider } from '@/features/dashboard-settings/context/team-context'
import { usePermissions } from '@/hooks/use-permissions'
import { cn } from '@/lib/utils'
import { useCurrentOrganization } from '@/store/auth-store'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { useCallback, useState } from 'react'
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

function batchStorageKey(orgID: string) {
  return `org-onboarding:${orgID}:batch`
}

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
  const [batchID, setBatchID] = useState(() =>
    localStorage.getItem(batchStorageKey(orgID))
  )
  const [step, setStep] = useState<Step>(batchID ? 'progress' : 'welcome')
  const [team, setTeam] = useState<{ id: string; name: string } | null>(null)

  const handleRestart = useCallback(() => {
    localStorage.removeItem(batchStorageKey(orgID))
    setBatchID(null)
    setStep('welcome')
  }, [orgID])

  const handleFinished = useCallback(() => {
    localStorage.removeItem(batchStorageKey(orgID))
  }, [orgID])

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex shrink-0 flex-col items-center gap-3.5 px-6 pt-7 pb-5 sm:px-8">
        <UiGraphLogo className="size-9" />
        <StepDots step={step} />
      </div>

      {step === 'welcome' && <WelcomeStep onNext={() => setStep('teams')} />}

      {step === 'teams' && (
        <TeamsStep
          selectedTeamID={team?.id ?? null}
          onBack={() => setStep('welcome')}
          onSelect={setTeam}
          onNext={() => setStep('github')}
        />
      )}

      {step === 'github' && (
        <GitHubStep
          orgID={orgID}
          onBack={() => setStep('teams')}
          onNext={() => setStep('repositories')}
        />
      )}

      {step === 'repositories' && team && (
        <RepositoriesStep
          orgID={orgID}
          team={team}
          onBack={() => setStep('github')}
          onStarted={(id) => {
            localStorage.setItem(batchStorageKey(orgID), id)
            setBatchID(id)
            setStep('progress')
          }}
        />
      )}

      {step === 'progress' && batchID && (
        <ProgressStep
          orgID={orgID}
          batchID={batchID}
          onRestart={handleRestart}
          onFinished={handleFinished}
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
