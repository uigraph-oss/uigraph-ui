import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
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
    {
      icon: PiggyBank,
      label: 'Total Savings',
      value: usd(costSavedUsd),
      hint: 'Tokens saved multiplied by the model’s input price per million tokens.',
    },
    {
      icon: Timer,
      label: 'Time Saved (est.)',
      value: formatDuration(timeSavedMs),
      hint: 'Estimated agent time (raw tokens ÷ ~75 tokens/sec) minus the actual MCP resolve time.',
    },
    {
      icon: Coins,
      label: 'Tokens Saved',
      value: totalTokensSaved.toLocaleString(),
      hint: 'Raw tokens an agent would process minus the tokens actually served over MCP.',
    },
    {
      icon: Gauge,
      label: 'Avg Resolve Time',
      value: formatDuration(avgResolveMs),
      hint: 'Total MCP resolve time divided by the number of calls.',
    },
    {
      icon: TrendingUp,
      label: 'Est. Annual Savings',
      value: usd(annual),
      hint: 'Savings for this period scaled to a full year (365 days).',
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
      {cards.map((c) => (
        <StatCard
          key={c.label}
          icon={c.icon}
          label={c.label}
          value={c.value}
          hint={c.hint}
        />
      ))}
    </div>
  )
}

function StatCard({
  icon,
  label,
  value,
  hint,
}: {
  icon: LucideIcon
  label: string
  value: string
  hint: string
}) {
  const Icon = icon
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="border-stock bg-shading/40 hover:border-stock/80 rounded-xl border p-5 text-left transition-colors">
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
      </TooltipTrigger>
      <TooltipContent className="max-w-56 text-center">{hint}</TooltipContent>
    </Tooltip>
  )
}
