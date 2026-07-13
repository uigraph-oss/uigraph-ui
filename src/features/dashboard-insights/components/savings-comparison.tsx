import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { ArrowDownRight, Info } from 'lucide-react'

type SavingsComparisonProps = {
  costServedUsd: number
  costRawUsd: number
  modelLabel: string
}

export function SavingsComparison({
  costServedUsd,
  costRawUsd,
  modelLabel,
}: SavingsComparisonProps) {
  const max = Math.max(costServedUsd, costRawUsd, 1)
  const savedPct = costRawUsd > 0 ? (1 - costServedUsd / costRawUsd) * 100 : 0
  function usd(value: number) {
    return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
  }

  return (
    <div className="border-stock bg-shading/40 space-y-5 rounded-[12px] border px-6 py-6">
      <div className="flex items-center justify-between">
        <div className="text-paragraph flex items-center gap-1.5">
          <p className="text-sm font-medium">With vs. without uigraph MCP</p>
          <Tooltip>
            <TooltipTrigger asChild>
              <button type="button" className="hover:text-foreground">
                <Info className="size-3.5" />
              </button>
            </TooltipTrigger>
            <TooltipContent className="max-w-56 text-center">
              Estimated cost of the same work when using {modelLabel}, with the
              uigraph MCP server versus feeding raw context without it.
            </TooltipContent>
          </Tooltip>
        </div>
        {savedPct > 0 ? (
          <span className="text-success bg-success/10 flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold">
            <ArrowDownRight className="size-3.5" />
            {savedPct.toFixed(0)}% cheaper
          </span>
        ) : null}
      </div>
      <Bar
        label="With uigraph MCP"
        value={costServedUsd}
        max={max}
        usd={usd}
        color="bg-success"
      />
      <Bar
        label="Without uigraph MCP"
        value={costRawUsd}
        max={max}
        usd={usd}
        color="bg-muted-foreground/40"
      />
    </div>
  )
}

function Bar({
  label,
  value,
  max,
  usd,
  color,
}: {
  label: string
  value: number
  max: number
  usd: (n: number) => string
  color: string
}) {
  const widthPct = Math.max((value / max) * 100, 2)
  return (
    <div>
      <div className="text-paragraph mb-1.5 flex justify-between text-sm">
        <span>{label}</span>
        <span className="text-foreground font-medium">{usd(value)}</span>
      </div>
      <div className="bg-muted/30 h-2.5 w-full overflow-hidden rounded-full">
        <div
          className={`h-full rounded-full ${color} transition-[width] duration-500`}
          style={{ width: `${widthPct}%` }}
        />
      </div>
    </div>
  )
}
