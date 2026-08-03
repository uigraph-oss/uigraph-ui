import { graphql } from '@/api'

export const AGENT_SESSION_SUMMARY = graphql(`
  query AgentSessionSummary($orgId: ID!, $period: String, $type: String) {
    agentSessionSummary(orgId: $orgId, period: $period, type: $type) {
      period
      totalSessions
      completedSessions
      failedSessions
      runningSessions
      totalDurationMs
      totals {
        stepCount
        inputTokens
        outputTokens
        reasoningTokens
        cachedInputTokens
        cachedOutputTokens
        costUsd
        unpricedSteps
        stepDurationMs
      }
      byType {
        type
        totalSessions
        completedSessions
        failedSessions
        runningSessions
        totalDurationMs
        totals {
          stepCount
          inputTokens
          outputTokens
          costUsd
          unpricedSteps
        }
      }
    }
  }
`)

export const AGENT_SESSIONS = graphql(`
  query AgentSessions(
    $orgId: ID!
    $type: String
    $status: String
    $period: String
    $limit: Int
    $offset: Int
  ) {
    agentSessions(
      orgId: $orgId
      type: $type
      status: $status
      period: $period
      limit: $limit
      offset: $offset
    ) {
      total
      period
      limit
      offset
      sessions {
        id
        type
        status
        actorName
        actorAvatarUrl
        serviceAccountId
        title
        modelName
        metadata
        startedAt
        completedAt
        durationMs
        totals {
          stepCount
          inputTokens
          outputTokens
          costUsd
          unpricedSteps
        }
      }
    }
  }
`)

export const AGENT_SESSION = graphql(`
  query AgentSession($orgId: ID!, $id: ID!) {
    agentSession(orgId: $orgId, id: $id) {
      session {
        id
        type
        status
        actorName
        actorAvatarUrl
        serviceAccountId
        title
        modelName
        metadata
        report
        error
        startedAt
        updatedAt
        completedAt
        durationMs
        totals {
          stepCount
          inputTokens
          outputTokens
          reasoningTokens
          cachedInputTokens
          cachedOutputTokens
          costUsd
          unpricedSteps
          stepDurationMs
        }
      }
      steps {
        id
        seq
        kind
        name
        modelName
        input
        output
        text
        finishReason
        error
        inputTokens
        outputTokens
        reasoningTokens
        cachedInputTokens
        cachedOutputTokens
        costUsd
        startedAt
        completedAt
        durationMs
      }
    }
  }
`)
