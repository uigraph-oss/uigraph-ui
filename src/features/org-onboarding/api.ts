import { graphql } from '@/api'

export const COMPLETE_ONBOARDING = graphql(`
  mutation CompleteOnboarding($orgId: ID!) {
    completeOnboarding(orgId: $orgId)
  }
`)
