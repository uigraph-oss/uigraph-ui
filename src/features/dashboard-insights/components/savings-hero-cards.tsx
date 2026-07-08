import {
  Coins,
  Gauge,
  PiggyBank,
  Timer,
  TrendingUp,
  type LucideIcon,
} from 'lucide-react'
import { projectedAnnualSavings } from '../lib/derived-metrics'
import { formatDuration } from '../lib/format-duration'

type SavingsHeroCardsProps = {
  period: string
  totalCalls: number
  totalTokensSaved: number
  costSavedUsd: number
  timeSavedMs: number
  totalDurationMs: number
}

export function SavingsHeroCards({
  period,
  totalCalls,
  totalTokensSaved,
  costSavedUsd,
  timeSavedMs,
  totalDurationMs,
}: SavingsHeroCardsProps) {
  const annual = projectedAnnualSavings(costSavedUsd, period)
  const avgResolveMs = totalCalls > 0 ? totalDurationMs / totalCalls : 0

  function usd(value: number) {
    return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
  }

  const cards = [
    { icon: PiggyBank, label: 'Total Savings', value: usd(costSavedUsd) },
    {
      icon: Timer,
      label: 'Time Saved (est.)',
      value: formatDuration(timeSavedMs),
    },
    {
      icon: Coins,
      label: 'Tokens Saved',
      value: totalTokensSaved.toLocaleString(),
    },
    {
      icon: Gauge,
      label: 'Avg Resolve Time',
      value: formatDuration(avgResolveMs),
    },
    { icon: TrendingUp, label: 'Est. Annual Savings', value: usd(annual) },
  ]

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
      {cards.map((c) => (
        <StatCard key={c.label} icon={c.icon} label={c.label} value={c.value} />
      ))}
    </div>
  )
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: LucideIcon
  label: string
  value: string
}) {
  const Icon = icon
  return (
    <div className="border-stock bg-shading/40 hover:border-stock/80 rounded-xl border p-5 transition-colors">
      <div className="text-paragraph flex items-center gap-2">
        <Icon className="size-4" />
        <span className="text-xs font-medium tracking-wide uppercase">
          {label}
        </span>
      </div>
      <p className="text-foreground mt-3 text-2xl font-semibold tracking-tight">
        {value}
      </p>
    </div>
  )
}
