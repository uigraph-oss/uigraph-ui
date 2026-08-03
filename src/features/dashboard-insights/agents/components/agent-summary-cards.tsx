import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Coins, Gauge, PlayCircle, Timer, Wallet } from 'lucide-react'
import { formatDuration } from '../../lib/format-duration'
import { formatCost, successRate } from '../lib/agent-session-format'

type AgentSummaryCardsProps = {
  totalSessions: number
  completedSessions: number
  failedSessions: number
  runningSessions: number
  totalDurationMs: number
  inputTokens: number
  outputTokens: number
  costUsd: number | null | undefined
  unpricedSteps: number
}

export function AgentSummaryCards({
  totalSessions,
  completedSessions,
  failedSessions,
  runningSessions,
  totalDurationMs,
  inputTokens,
  outputTokens,
  costUsd,
  unpricedSteps,
}: AgentSummaryCardsProps) {
  const finishedSessions = completedSessions + failedSessions
  const avgDurationMs =
    finishedSessions > 0 ? totalDurationMs / finishedSessions : 0

  const cards = [
    {
      icon: PlayCircle,
      label: 'Runs',
      value: totalSessions.toLocaleString(),
      hint: `${runningSessions.toLocaleString()} running, ${completedSessions.toLocaleString()} completed, ${failedSessions.toLocaleString()} failed.`,
    },
    {
      icon: Gauge,
      label: 'Success Rate',
      value: successRate(completedSessions, failedSessions),
      hint: 'Completed runs as a share of runs that finished. Running runs are excluded.',
    },
    {
      icon: Coins,
      label: 'Tokens',
      value: (inputTokens + outputTokens).toLocaleString(),
      hint: `${inputTokens.toLocaleString()} input, ${outputTokens.toLocaleString()} output.`,
    },
    {
      icon: Wallet,
      label: 'Est. Cost',
      value: formatCost(costUsd, unpricedSteps),
      hint:
        unpricedSteps > 0
          ? `Estimated from model prices at run time. ${unpricedSteps.toLocaleString()} step(s) ran on a model with no known price and are not included.`
          : 'Estimated from model prices at run time. Cached tokens are not discounted.',
    },
    {
      icon: Timer,
      label: 'Avg Duration',
      value: formatDuration(avgDurationMs),
      hint: 'Wall clock time of finished runs, divided by the number of finished runs.',
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
      {cards.map((card) => (
        <Tooltip key={card.label}>
          <TooltipTrigger asChild>
            <div className="border-stock bg-shading/40 hover:border-stock/80 rounded-xl border p-5 text-left transition-colors">
              <div className="text-paragraph flex items-center gap-2">
                <card.icon className="size-4" />
                <span className="text-xs font-medium tracking-wide uppercase">
                  {card.label}
                </span>
              </div>
              <p className="text-foreground mt-3 text-2xl font-semibold tracking-tight">
                {card.value}
              </p>
            </div>
          </TooltipTrigger>
          <TooltipContent className="max-w-56 text-center">
            {card.hint}
          </TooltipContent>
        </Tooltip>
      ))}
    </div>
  )
}
