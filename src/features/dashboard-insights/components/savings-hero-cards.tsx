import {
  costSavedPerUser,
  projectedAnnualSavings,
} from '../lib/derived-metrics'

type SavingsHeroCardsProps = {
  period: string
  totalCalls: number
  totalTokensSaved: number
  costSavedUsd: number
  uniqueUsersCount: number
}

export function SavingsHeroCards({
  period,
  totalCalls,
  totalTokensSaved,
  costSavedUsd,
  uniqueUsersCount,
}: SavingsHeroCardsProps) {
  const annual = projectedAnnualSavings(costSavedUsd, period)
  const perUser = costSavedPerUser(costSavedUsd, uniqueUsersCount)

  function usd(value: number) {
    return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
  }

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
      <StatCard label="Cost Saved" value={usd(costSavedUsd)} highlight />
      <StatCard label="Projected Annual Savings" value={usd(annual)} />
      <StatCard
        label="Tokens Saved"
        value={totalTokensSaved.toLocaleString()}
      />
      <StatCard label="Total Calls" value={totalCalls.toLocaleString()} />
      <StatCard
        label="Cost Saved / Active User"
        value={perUser === null ? '—' : usd(perUser)}
      />
    </div>
  )
}

function StatCard({
  label,
  value,
  highlight,
}: {
  label: string
  value: string
  highlight?: boolean
}) {
  return (
    <div className="border-stock rounded-[12px] border px-6 py-6">
      <p className="text-paragraph text-sm font-medium">{label}</p>
      <p
        className={
          highlight
            ? 'text-primary mt-3 text-3xl font-semibold tracking-tight'
            : 'text-foreground mt-3 text-3xl font-semibold tracking-tight'
        }
      >
        {value}
      </p>
    </div>
  )
}
