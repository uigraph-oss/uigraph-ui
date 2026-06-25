const PERIOD_DAYS: Record<string, number> = {
  '1d': 1,
  '7d': 7,
  '30d': 30,
  '1y': 365,
}

export function periodToDays(period: string): number {
  return PERIOD_DAYS[period] ?? PERIOD_DAYS['7d']
}

export function projectedAnnualSavings(
  costSavedUsd: number,
  period: string
): number {
  const days = periodToDays(period)
  return (costSavedUsd / days) * 365
}

export function costSavedPerUser(
  costSavedUsd: number,
  uniqueUsersCount: number
): number | null {
  if (uniqueUsersCount <= 0) return null
  return costSavedUsd / uniqueUsersCount
}
