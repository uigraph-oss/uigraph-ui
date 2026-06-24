type SavingsComparisonProps = {
  costServedUsd: number
  costRawUsd: number
}

export function SavingsComparison({
  costServedUsd,
  costRawUsd,
}: SavingsComparisonProps) {
  const max = Math.max(costServedUsd, costRawUsd, 1)
  function usd(value: number) {
    return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
  }

  return (
    <div className="border-stock space-y-4 rounded-[12px] border px-6 py-6">
      <p className="text-paragraph text-sm font-medium">
        With vs. without uigraph MCP
      </p>
      <Bar
        label="With uigraph MCP"
        value={costServedUsd}
        max={max}
        usd={usd}
        color="bg-primary"
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
      <div className="text-paragraph mb-1 flex justify-between text-sm">
        <span>{label}</span>
        <span className="text-foreground font-medium">{usd(value)}</span>
      </div>
      <div className="bg-muted/30 h-2 w-full overflow-hidden rounded-full">
        <div
          className={`h-full rounded-full ${color}`}
          style={{ width: `${widthPct}%` }}
        />
      </div>
    </div>
  )
}
