import {
  Activity,
  Coins,
  PiggyBank,
  TrendingUp,
  Users,
  type LucideIcon,
} from 'lucide-react'
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
      <StatCard
        icon={PiggyBank}
        label="Cost Saved"
        value={usd(costSavedUsd)}
        highlight
      />
      <StatCard
        icon={TrendingUp}
        label="Projected Annual Savings"
        value={usd(annual)}
      />
      <StatCard
        icon={Coins}
        label="Tokens Saved"
        value={totalTokensSaved.toLocaleString()}
      />
      <StatCard
        icon={Activity}
        label="Total Calls"
        value={totalCalls.toLocaleString()}
      />
      <StatCard
        icon={Users}
        label="Cost Saved / Active User"
        value={perUser === null ? '—' : usd(perUser)}
      />
    </div>
  )
}

function StatCard({
  icon,
  label,
  value,
  highlight,
}: {
  icon: LucideIcon
  label: string
  value: string
  highlight?: boolean
}) {
  const Icon = icon
  return (
    <div
      className={
        highlight
          ? 'border-primary/40 from-primary/10 relative overflow-hidden rounded-[12px] border bg-gradient-to-br to-transparent px-5 py-5'
          : 'border-stock bg-shading/40 hover:border-stock/80 relative overflow-hidden rounded-[12px] border px-5 py-5 transition-colors'
      }
    >
      <div className="flex items-center justify-between">
        <p className="text-paragraph text-xs font-medium tracking-wide uppercase">
          {label}
        </p>
        <span
          className={
            highlight
              ? 'bg-primary/15 text-primary flex size-8 items-center justify-center rounded-lg'
              : 'bg-muted/40 text-paragraph flex size-8 items-center justify-center rounded-lg'
          }
        >
          <Icon className="size-4" />
        </span>
      </div>
      <p
        className={
          highlight
            ? 'text-primary mt-4 text-3xl font-semibold tracking-tight'
            : 'text-foreground mt-4 text-3xl font-semibold tracking-tight'
        }
      >
        {value}
      </p>
    </div>
  )
}
