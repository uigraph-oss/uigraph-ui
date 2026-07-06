'use client'

import { UiGraphLogo } from '@/components/logo'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  TeamContextProvider,
  useTeamContext,
} from '@/features/dashboard-settings/context/team-context'
import { usePermissions } from '@/hooks/use-permissions'
import { cn } from '@/lib/utils'
import {
  refreshOrganizations,
  useCurrentOrganization,
} from '@/store/auth-store'
import { useMutation } from '@apollo/client'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { ArrowRight, Check } from 'lucide-react'
import { useState } from 'react'
import { COMPLETE_ONBOARDING } from './api'

const STEPS = ['welcome', 'teams'] as const
type Step = (typeof STEPS)[number]

const fieldClass = 'h-12 rounded-xl border-input'

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
          onInteractOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
          className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 bg-shading border-stock fixed top-[50%] left-[50%] z-50 w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] rounded-2xl border p-0 shadow-2xl duration-200 sm:max-w-md"
        >
          <TeamContextProvider>
            <OrgOnboardingWizard />
          </TeamContextProvider>
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  )
}

function OrgOnboardingWizard() {
  const [step, setStep] = useState<Step>('welcome')

  return (
    <div className="flex max-h-[85vh] flex-col overflow-y-auto p-8">
      <div className="mb-6 flex flex-col items-center gap-4">
        <UiGraphLogo className="h-11 w-11" />
        <StepDots step={step} />
      </div>

      {step === 'welcome' && <WelcomeStep onNext={() => setStep('teams')} />}
      {step === 'teams' && <TeamsStep />}
    </div>
  )
}

function StepDots({ step }: { step: Step }) {
  const current = STEPS.indexOf(step)
  return (
    <div className="flex items-center gap-1.5">
      {STEPS.map((s, i) => (
        <span
          key={s}
          className={cn(
            'h-1.5 rounded-full transition-all',
            i === current ? 'bg-primary w-6' : 'bg-stock w-1.5'
          )}
        />
      ))}
    </div>
  )
}

function WelcomeStep({ onNext }: { onNext: () => void }) {
  return (
    <div className="text-center">
      <DialogTitle className="text-2xl font-semibold">
        Welcome to UIGraph
      </DialogTitle>
      <DialogDescription className="text-paragraph mx-auto mt-3 max-w-sm text-sm leading-relaxed">
        Let&apos;s set up your organization. Create your first team to get
        started.
      </DialogDescription>
      <Button preset="primary" className="mt-8 w-full" onClick={onNext}>
        Get Started
        <ArrowRight />
      </Button>
    </div>
  )
}

function TeamsStep() {
  const { teams, createTeam } = useTeamContext()
  const organization = useCurrentOrganization()
  const [completeOnboarding, { loading: isFinishing }] =
    useMutation(COMPLETE_ONBOARDING)
  const [teamName, setTeamName] = useState('')
  const [isCreating, setIsCreating] = useState(false)

  async function handleAddTeam() {
    const name = teamName.trim()
    if (name === '') return
    setIsCreating(true)
    try {
      await createTeam({ teamName: name })
      setTeamName('')
    } finally {
      setIsCreating(false)
    }
  }

  async function handleFinish() {
    if (!organization) return
    await completeOnboarding({ variables: { orgId: organization.id } })
    await refreshOrganizations()
  }

  return (
    <div>
      <div className="mb-6 text-center">
        <DialogTitle className="text-2xl font-semibold">Add Teams</DialogTitle>
        <DialogDescription className="text-paragraph mx-auto mt-2 max-w-sm text-sm leading-relaxed">
          Create at least one team to organize your organization.
        </DialogDescription>
      </div>

      <div className="space-y-2">
        <Label htmlFor="onboarding-team-name">Team name</Label>
        <div className="flex items-stretch gap-2">
          <Input
            id="onboarding-team-name"
            value={teamName}
            placeholder="e.g. Engineering"
            autoComplete="off"
            className={fieldClass}
            onChange={(e) => setTeamName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                void handleAddTeam()
              }
            }}
          />
          <Button
            preset="outline"
            className={cn(fieldClass, 'shrink-0')}
            disabled={teamName.trim() === '' || isCreating}
            onClick={handleAddTeam}
          >
            Add
          </Button>
        </div>
      </div>

      {teams.length > 0 && (
        <ul className="mt-5 space-y-2">
          {teams.map((team) => (
            <li
              key={team.teamId}
              className="border-stock flex items-center gap-3 rounded-xl border p-3 text-sm"
            >
              <span className="bg-primary/10 text-primary flex h-8 w-8 items-center justify-center rounded-lg">
                <Check className="size-4" />
              </span>
              {team.teamName}
            </li>
          ))}
        </ul>
      )}

      <Button
        preset="primary"
        className="mt-8 w-full"
        disabled={teams.length === 0 || isFinishing}
        onClick={handleFinish}
      >
        <Check />
        Finish
      </Button>
    </div>
  )
}
