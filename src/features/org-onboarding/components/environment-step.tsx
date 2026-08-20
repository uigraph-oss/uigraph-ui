import { EnvironmentSecrets } from '@/features/github-import/environment-secrets'
import { AlertCircle } from 'lucide-react'
import { useState } from 'react'
import { OnboardingLayout } from './onboarding-layout'
import { OnboardingTeamChip } from './onboarding-team-chip'
import {
  OnboardingActions,
  OnboardingStepTicks,
  OnboardingStepTitle,
} from './onboarding-ui'

export function EnvironmentStep({
  orgID,
  owner,
  repo,
  onBack,
  onNext,
}: {
  orgID: string
  owner: string
  repo: string
  onBack: () => void
  onNext: () => Promise<void>
}) {
  const [isStarting, setIsStarting] = useState(false)
  const [startError, setStartError] = useState('')

  async function handleNext() {
    setIsStarting(true)
    setStartError('')
    try {
      await onNext()
    } catch (caught) {
      setIsStarting(false)
      setStartError(
        caught instanceof Error ? caught.message : 'Could not start the run'
      )
    }
  }

  return (
    <OnboardingLayout
      headerLeftContent={<OnboardingStepTitle current={2} />}
      headerCenterContent={<OnboardingStepTicks current={2} />}
      headerRightContent={<OnboardingTeamChip />}
    >
      <div className="mx-auto w-full max-w-2xl">
        <EnvironmentSecrets orgID={orgID} owner={owner} repo={repo} />

        {startError && (
          <p className="text-destructive mt-6 flex items-start gap-2 text-sm">
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            {startError}
          </p>
        )}

        <div className="mt-6">
          <OnboardingActions
            onBack={onBack}
            primary={{
              label: 'Go ahead',
              onClick: handleNext,
              loading: isStarting,
            }}
          />
        </div>
      </div>
    </OnboardingLayout>
  )
}
