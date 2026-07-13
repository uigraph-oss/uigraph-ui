import { graphql } from '@/api'

export const COST_SAVINGS_SUMMARY = graphql(`
  query CostSavingsSummary($orgId: ID!, $period: String, $modelId: String) {
    costSavingsSummary(orgId: $orgId, period: $period, modelId: $modelId) {
      orgId
      period
      modelId
      totalCalls
      totalTokensServed
      totalTokensSaved
      costServedUsd
      costRawUsd
      costSavedUsd
      uniqueUsersCount
      totalDurationMs
      estAgentTimeMs
      timeSavedMs
    }
  }
`)

export const COST_SAVINGS_TIMESERIES = graphql(`
  query CostSavingsTimeseries($orgId: ID!, $period: String, $modelId: String) {
    costSavingsTimeseries(orgId: $orgId, period: $period, modelId: $modelId) {
      date
      totalCalls
      totalTokensServed
      totalTokensSaved
      costServedUsd
      costRawUsd
      costSavedUsd
      totalDurationMs
      estAgentTimeMs
      timeSavedMs
    }
  }
`)

export const COST_SAVINGS_BY_TOOL = graphql(`
  query CostSavingsByTool($orgId: ID!, $period: String, $modelId: String) {
    costSavingsByTool(orgId: $orgId, period: $period, modelId: $modelId) {
      toolName
      totalCalls
      tokensSaved
      costSavedUsd
      totalDurationMs
    }
  }
`)

export const COST_SAVINGS_BY_CLIENT = graphql(`
  query CostSavingsByClient($orgId: ID!, $period: String, $modelId: String) {
    costSavingsByClient(orgId: $orgId, period: $period, modelId: $modelId) {
      clientName
      totalCalls
      tokensSaved
      costSavedUsd
      totalDurationMs
    }
  }
`)

export const COST_SAVINGS_BY_MODEL = graphql(`
  query CostSavingsByModel($orgId: ID!, $period: String) {
    costSavingsByModel(orgId: $orgId, period: $period) {
      modelId
      displayName
      provider
      totalCalls
      tokensSaved
      costRawUsd
      costSavedUsd
    }
  }
`)

export const COST_SAVINGS_BY_USER = graphql(`
  query CostSavingsByUser($orgId: ID!, $period: String, $modelId: String) {
    costSavingsByUser(orgId: $orgId, period: $period, modelId: $modelId) {
      userId
      serviceAccountId
      displayName
      avatarUrl
      totalCalls
      tokensSaved
      costSavedUsd
      totalDurationMs
    }
  }
`)
