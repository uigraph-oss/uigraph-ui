export function formatUsd(value: number): string {
  if (value > 0 && value < 0.01) {
    return '<$0.01'
  }

  return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
}

export function formatCost(
  costUsd: number | null | undefined,
  unpricedSteps: number
): string | null {
  if (costUsd === null || costUsd === undefined) {
    return null
  }

  if (unpricedSteps > 0) {
    return `${formatUsd(costUsd)}*`
  }

  return formatUsd(costUsd)
}

export function successRate(
  completedSessions: number,
  failedSessions: number
): string | null {
  const finished = completedSessions + failedSessions

  if (finished === 0) {
    return null
  }

  return `${Math.round((completedSessions / finished) * 100)}%`
}
