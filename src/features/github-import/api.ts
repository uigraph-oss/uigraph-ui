import { graphql } from '@/api'

export const GITHUB_APP = graphql(`
  query GitHubImportApp($orgID: ID!) {
    githubApp(orgId: $orgID) {
      installationId
      accountLogin
      accountType
      suspended
    }
  }
`)

export const GITHUB_REPOSITORIES = graphql(`
  query GitHubImportRepositories($orgID: ID!) {
    githubRepositories(orgId: $orgID) {
      githubId
      owner
      name
      fullName
      url
      defaultBranch
      private
      archived
    }
  }
`)

export const REPOSITORY_IMPORT = graphql(`
  query GitHubImportRepositoryImport($orgID: ID!, $importID: ID!) {
    repositoryImport(orgId: $orgID, importId: $importID) {
      id
      githubRepo
      status
      teamId
      teamName
      branch
      runUrl
      pullRequestUrl
      missingAIConfiguration
      error
      serviceId
      createdAt
      runStartedAt
      runCompletedAt
      steps {
        number
        name
        status
        conclusion
        startedAt
        completedAt
      }
    }
  }
`)

export const LATEST_REPOSITORY_IMPORT = graphql(`
  query GitHubImportLatestRepositoryImport($orgID: ID!) {
    latestRepositoryImport(orgId: $orgID) {
      id
      status
    }
  }
`)

export const GITHUB_APP_INSTALL_URL = graphql(`
  mutation GitHubImportInstallURL($orgID: ID!) {
    githubAppInstallURL(orgId: $orgID)
  }
`)

export const DISCONNECT_GITHUB_APP = graphql(`
  mutation GitHubImportDisconnect($orgID: ID!) {
    disconnectGitHubApp(orgId: $orgID)
  }
`)

export const START_REPOSITORY_IMPORT = graphql(`
  mutation GitHubImportStart(
    $orgID: ID!
    $teamID: ID!
    $owner: String!
    $repo: String!
  ) {
    startRepositoryImport(
      orgId: $orgID
      teamId: $teamID
      owner: $owner
      repo: $repo
    ) {
      id
      status
    }
  }
`)

export const RECHECK_REPOSITORY_IMPORT = graphql(`
  mutation GitHubImportRecheck($orgID: ID!, $importID: ID!) {
    recheckRepositoryImport(orgId: $orgID, importId: $importID) {
      id
      status
    }
  }
`)

export const RETRY_REPOSITORY_IMPORT = graphql(`
  mutation GitHubImportRetry($orgID: ID!, $importID: ID!) {
    retryRepositoryImport(orgId: $orgID, importId: $importID) {
      id
      status
    }
  }
`)
