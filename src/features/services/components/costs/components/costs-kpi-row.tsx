import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  Boxes,
  Cloud,
  Coins,
  TrendingDown,
  TrendingUp,
  type LucideIcon,
} from 'lucide-react'
import type { ServiceCostSummary } from '../types'

const usd = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
})

export function CostsKpiRow({ summary }: { summary: ServiceCostSummary }) {
  const trendUp = summary.momChangePct >= 0
  const trendLabel = `${trendUp ? '+' : ''}${summary.momChangePct.toFixed(1)}%`

  const cards: {
    icon: LucideIcon
    label: string
    value: string
    valueClassName?: string
    hint: string
  }[] = [
    {
      icon: Coins,
      label: 'Total Monthly Cost',
      value: usd.format(summary.totalMonthlyCostUsd),
      hint: 'Sum of monthly cost across every tagged resource for this service.',
    },
    {
      icon: trendUp ? TrendingUp : TrendingDown,
      label: 'Cost Trend (MoM)',
      value: trendLabel,
      valueClassName: trendUp ? 'text-destructive' : 'text-success',
      hint: 'Change in total spend over the trailing 30 days vs. the prior 30 days.',
    },
    {
      icon: Boxes,
      label: 'Resources Tracked',
      value: summary.resourceCount.toLocaleString(),
      hint: 'Cloud resources currently matched to this service by tag.',
    },
    {
      icon: Coins,
      label: 'Top Cost Driver',
      value: summary.topCostDriver.label,
      hint: `${usd.format(summary.topCostDriver.costUsd)}/mo — the highest-spend resource type for this service.`,
    },
    {
      icon: Cloud,
      label: 'Providers in Use',
      value: summary.providerCount.toString(),
      hint: 'Distinct cloud providers hosting resources tagged to this service.',
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
      {cards.map((c) => (
        <StatCard key={c.label} {...c} />
      ))}
    </div>
  )
}

function StatCard({
  icon,
  label,
  value,
  valueClassName,
  hint,
}: {
  icon: LucideIcon
  label: string
  value: string
  valueClassName?: string
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
          <p
            className={
              'text-foreground mt-3 text-2xl font-semibold tracking-tight ' +
              (valueClassName ?? '')
            }
          >
            {value}
          </p>
        </div>
      </TooltipTrigger>
      <TooltipContent className="max-w-56 text-center">{hint}</TooltipContent>
    </Tooltip>
  )
}
