import {
  Activity,
  Coins,
  PiggyBank,
  Timer,
  type LucideIcon,
} from 'lucide-react'
import {
  costSavedPerUser,
  projectedAnnualSavings,
} from '../lib/derived-metrics'
import { formatDuration } from '../lib/format-duration'

type SavingsHeroCardsProps = {
  period: string
  totalCalls: number
  totalTokensSaved: number
  costSavedUsd: number
  uniqueUsersCount: number
  timeSavedMs: number
  totalDurationMs: number
}

export function SavingsHeroCards({
  period,
  totalCalls,
  totalTokensSaved,
  costSavedUsd,
  uniqueUsersCount,
  timeSavedMs,
  totalDurationMs,
}: SavingsHeroCardsProps) {
  const annual = projectedAnnualSavings(costSavedUsd, period)
  const perUser = costSavedPerUser(costSavedUsd, uniqueUsersCount)
  const avgResolveMs = totalCalls > 0 ? totalDurationMs / totalCalls : 0

  function usd(value: number) {
    return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
  }

  const costSub =
    perUser === null
      ? `${usd(annual)} / yr projected`
      : `${usd(annual)} / yr · ${usd(perUser)} / user`
  const timeSub =
    totalCalls > 0 ? `${formatDuration(avgResolveMs)} avg resolve` : undefined

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <StatCard
        icon={PiggyBank}
        label="Cost Saved"
        value={usd(costSavedUsd)}
        sub={costSub}
        highlight
      />
      <StatCard
        icon={Timer}
        label="Time Saved (est.)"
        value={formatDuration(timeSavedMs)}
        sub={timeSub}
        highlight
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
    </div>
  )
}

function StatCard({
  icon,
  label,
  value,
  sub,
  highlight,
}: {
  icon: LucideIcon
  label: string
  value: string
  sub?: string
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
      {sub ? <p className="text-paragraph mt-1.5 text-xs">{sub}</p> : null}
    </div>
  )
}
