import type { AgentSessionRow } from '../components/agent-sessions-table'

export type AgentGroupDimension = 'agent' | 'model' | 'user'

export type AgentGroupRow = {
  key: string
  label: string
  avatarUrl?: string | null
  accountType?: 'service' | 'user'
  totalSessions: number
  completedSessions: number
  failedSessions: number
  runningSessions: number
  stepCount: number
  tokens: number
  costUsd: number | null
  unpricedSteps: number
  finishedSessions: number
  totalDurationMs: number
}

export function groupAgentSessions(
  rows: AgentSessionRow[],
  dimension: AgentGroupDimension
): AgentGroupRow[] {
  const groups = new Map<string, AgentGroupRow>()

  for (const row of rows) {
    let key: string
    let label: string
    let avatarUrl: string | null | undefined
    let accountType: 'service' | 'user' | undefined

    if (dimension === 'agent') {
      key = row.type
      label = row.type
      avatarUrl = undefined
      accountType = undefined
    } else if (dimension === 'model') {
      key = row.modelName ?? '__unknown__'
      label = row.modelName ?? 'Unknown model'
      avatarUrl = undefined
      accountType = undefined
    } else if (dimension === 'user') {
      key = row.serviceAccountId ?? row.actorName ?? '__unknown__'
      label = row.actorName ?? 'Unknown'
      avatarUrl = row.actorAvatarUrl
      accountType = row.serviceAccountId ? 'service' : 'user'
    } else {
      throw new Error(`Unsupported group dimension: ${String(dimension)}`)
    }

    let group = groups.get(key)

    if (!group) {
      group = {
        key,
        label,
        avatarUrl,
        accountType,
        totalSessions: 0,
        completedSessions: 0,
        failedSessions: 0,
        runningSessions: 0,
        stepCount: 0,
        tokens: 0,
        costUsd: null,
        unpricedSteps: 0,
        finishedSessions: 0,
        totalDurationMs: 0,
      }
      groups.set(key, group)
    }

    group.totalSessions += 1

    if (row.status === 'completed') {
      group.completedSessions += 1
    } else if (row.status === 'failed') {
      group.failedSessions += 1
    } else if (row.status === 'running') {
      group.runningSessions += 1
    }

    group.stepCount += row.totals.stepCount
    group.tokens += row.totals.inputTokens + row.totals.outputTokens
    group.unpricedSteps += row.totals.unpricedSteps

    if (row.totals.costUsd !== null && row.totals.costUsd !== undefined) {
      group.costUsd = (group.costUsd ?? 0) + row.totals.costUsd
    }

    if (row.durationMs !== null && row.durationMs !== undefined) {
      group.finishedSessions += 1
      group.totalDurationMs += row.durationMs
    }
  }

  return [...groups.values()].sort((a, b) => {
    if (b.totalSessions !== a.totalSessions) {
      return b.totalSessions - a.totalSessions
    }

    return b.tokens - a.tokens
  })
}
