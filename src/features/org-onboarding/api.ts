import { graphql } from '@/api'

export const COMPLETE_ONBOARDING = graphql(`
  mutation CompleteOnboarding($orgId: ID!) {
    completeOnboarding(orgId: $orgId)
  }
`)

export const ONBOARDING_PROGRESS = graphql(`
  query OnboardingProgress($orgID: ID!) {
    onboardingProgress(orgId: $orgID) {
      step
      teamId
      teamName
      runner
      repoOwner
      repoName
      importId
    }
  }
`)

export const SAVE_ONBOARDING_PROGRESS = graphql(`
  mutation SaveOnboardingProgress(
    $orgID: ID!
    $input: OnboardingProgressInput!
  ) {
    saveOnboardingProgress(orgId: $orgID, input: $input) {
      step
      teamId
      teamName
      runner
      repoOwner
      repoName
      importId
    }
  }
`)
