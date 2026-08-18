'use client'

import { createContext, useLocalStorage } from 'daily-code/react'
import { useSearchParams } from 'react-router-dom'

export const OnboardingStep = {
  Team: 'TEAM',
  Runner: 'RUNNER',
  Github: 'GITHUB',
  Repository: 'REPOSITORY',
  Environment: 'ENVIRONMENT',
  Run: 'RUN',
} as const

export type OnboardingStep =
  (typeof OnboardingStep)[keyof typeof OnboardingStep]

export const OnboardingRunner = {
  GithubActions: 'GITHUB_ACTIONS',
} as const

export type OnboardingRunner =
  (typeof OnboardingRunner)[keyof typeof OnboardingRunner]

export type OnboardingProgress = {
  step: OnboardingStep
  teamId: string | null
  runner: OnboardingRunner | null
  repoOwner: string | null
  repoName: string | null
  importId: string | null
}

const EMPTY_PROGRESS: OnboardingProgress = {
  step: OnboardingStep.Runner,
  teamId: null,
  runner: null,
  repoOwner: null,
  repoName: null,
  importId: null,
}

function resolveStep(progress: OnboardingProgress) {
  if (progress.step === OnboardingStep.Team) return OnboardingStep.Runner
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

export const [OnboardingProvider, useOnboarding] = createContext(
  (props: { orgID: string }) => {
    const [searchParams] = useSearchParams()
    const [progress, setProgress] = useLocalStorage(
      `uigraph.onboarding.${props.orgID}`,
      EMPTY_PROGRESS
    )

    return {
      orgID: props.orgID,
      teamID: searchParams.get('team') ?? '',
      progress,
      step: resolveStep(progress),

      async save(patch: Partial<OnboardingProgress>) {
        setProgress((previous) => ({ ...previous, ...patch }))
      },
    }
  }
)
