'use client'

import { createContext, useLocalStorage } from 'daily-code/react'

export const OnboardingStep = {
  Team: 'TEAM',
  Runner: 'RUNNER',
  CodingAgent: 'CODING_AGENT',
  Github: 'GITHUB',
  Repository: 'REPOSITORY',
  Environment: 'ENVIRONMENT',
} as const

export type OnboardingStep =
  (typeof OnboardingStep)[keyof typeof OnboardingStep]

export const OnboardingRunner = {
  GithubActions: 'GITHUB_ACTIONS',
  CodingAgent: 'CODING_AGENT',
} as const

export type OnboardingRunner =
  (typeof OnboardingRunner)[keyof typeof OnboardingRunner]

export type OnboardingProgress = {
  step: OnboardingStep
  teamId: string | null
  runner: OnboardingRunner | null
  repoOwner: string | null
  repoName: string | null
}

const EMPTY_PROGRESS: OnboardingProgress = {
  step: OnboardingStep.Runner,
  teamId: null,
  runner: null,
  repoOwner: null,
  repoName: null,
}

function resolveStep(progress: OnboardingProgress) {
  if (!progress.runner) return OnboardingStep.Runner
  if (
    progress.step === OnboardingStep.Team ||
    progress.step === OnboardingStep.Runner
  ) {
    return OnboardingStep.Runner
  }
  if (progress.runner === OnboardingRunner.CodingAgent) {
    return OnboardingStep.CodingAgent
  }
  if (progress.step === OnboardingStep.Github) return OnboardingStep.Github
  if (!progress.repoOwner || !progress.repoName)
    return OnboardingStep.Repository
  if (progress.step === OnboardingStep.Repository) {
    return OnboardingStep.Repository
  }
  return OnboardingStep.Environment
}

function progressKey(orgID: string) {
  return `uigraph.onboarding.${orgID}`
}

export function clearOnboardingProgress(orgID: string) {
  window.localStorage.removeItem(progressKey(orgID))
}

export const [OnboardingProvider, useOnboarding] = createContext(
  (props: { orgID: string }) => {
    const [progress, setProgress] = useLocalStorage(
      progressKey(props.orgID),
      EMPTY_PROGRESS
    )

    return {
      orgID: props.orgID,
      progress,
      step: resolveStep(progress),

      async save(patch: Partial<OnboardingProgress>) {
        setProgress((previous) => ({ ...previous, ...patch }))
      },

      clear() {
        clearOnboardingProgress(props.orgID)
        setProgress(EMPTY_PROGRESS)
      },
    }
  }
)
