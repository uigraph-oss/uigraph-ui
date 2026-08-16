import { graphql } from '@/api'

export const COMPLETE_ONBOARDING = graphql(`
  mutation CompleteOnboarding($orgId: ID!) {
    completeOnboarding(orgId: $orgId)
  }
`)

export const GITHUB_APP = graphql(`
  query OnboardingGitHubApp($orgID: ID!) {
    githubApp(orgId: $orgID) {
      id
      accountLogin
      accountType
      status
    }
  }
`)

export const GITHUB_REPOSITORIES = graphql(`
  query OnboardingGitHubRepositories($orgID: ID!) {
    githubRepositories(orgId: $orgID) {
      id
      githubId
      name
      fullName
      url
      defaultBranch
      private
      archived
    }
  }
`)

export const REPOSITORY_ONBOARDING = graphql(`
  query OnboardingRepositoryOnboarding($orgID: ID!, $batchID: ID!) {
    repositoryOnboarding(orgId: $orgID, batchId: $batchID) {
      id
      status
      teamId
      teamName
      repositories {
        id
        status
        repository {
          id
          githubId
          name
          fullName
          url
          defaultBranch
          private
          archived
        }
        branch
        runUrl
        pullRequestUrl
        missingAIConfiguration
        error
        serviceId
      }
    }
  }
`)

export const LATEST_REPOSITORY_ONBOARDING = graphql(`
  query OnboardingLatestRepositoryOnboarding($orgID: ID!) {
    latestRepositoryOnboarding(orgId: $orgID) {
      id
    }
  }
`)

export const GITHUB_APP_INSTALL_URL = graphql(`
  mutation OnboardingGitHubAppInstallURL($orgID: ID!) {
    githubAppInstallURL(orgId: $orgID)
  }
`)

export const DISCONNECT_GITHUB_APP = graphql(`
  mutation OnboardingDisconnectGitHubApp($orgID: ID!) {
    disconnectGitHubApp(orgId: $orgID)
  }
`)

export const START_REPOSITORY_ONBOARDING = graphql(`
  mutation OnboardingStartRepositoryOnboarding(
    $input: StartRepositoryOnboardingInput!
  ) {
    startRepositoryOnboarding(input: $input) {
      id
      status
    }
  }
`)

export const RECHECK_REPOSITORY_ONBOARDING = graphql(`
  mutation OnboardingRecheckRepositoryOnboarding(
    $orgID: ID!
    $batchID: ID!
    $onboardingID: ID!
  ) {
    recheckRepositoryOnboarding(
      orgId: $orgID
      batchId: $batchID
      onboardingId: $onboardingID
    ) {
      id
      status
    }
  }
`)

export const RETRY_REPOSITORY_ONBOARDING = graphql(`
  mutation OnboardingRetryRepositoryOnboarding(
    $orgID: ID!
    $batchID: ID!
    $onboardingID: ID!
  ) {
    retryRepositoryOnboarding(
      orgId: $orgID
      batchId: $batchID
      onboardingId: $onboardingID
    ) {
      id
      status
    }
  }
`)
