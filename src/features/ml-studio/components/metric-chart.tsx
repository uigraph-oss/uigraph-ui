import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Label,
  Line,
  LineChart,
  XAxis,
  YAxis,
} from 'recharts'

const palette = ['#3B6BFF', '#21AD6D', '#F5A623', '#B07CFF', '#FF6369']

function ClickableTick({
  x,
  y,
  payload,
  onLabelClick,
}: {
  x?: number
  y?: number
  payload?: { value: string }
  onLabelClick: (label: string) => void
}) {
  return (
    <text
      x={x}
      y={y}
      dy={12}
      textAnchor="middle"
      className="cursor-pointer fill-[#828DA3] text-xs hover:fill-[#F4F7FC]"
      onClick={() => payload && onLabelClick(payload.value)}
    >
      {payload?.value}
    </text>
  )
}

function formatValue(value: number) {
  if (!Number.isFinite(value)) {
    return '—'
  }
  if (value !== 0 && (Math.abs(value) >= 1e6 || Math.abs(value) < 1e-4)) {
    return value.toExponential(3)
  }
  if (Number.isInteger(value)) {
    return String(value)
  }
  return Number(value.toPrecision(4)).toString()
}

export function MetricTrendChart({
  data,
  metricKeys,
  className,
  onLabelClick,
}: {
  data: Record<string, string | number>[]
  metricKeys: string[]
  className?: string
  onLabelClick?: (label: string) => void
}) {
  const config: ChartConfig = Object.fromEntries(
    metricKeys.map((k, i) => [
      k,
      { label: k.replace(/_/g, ' '), color: palette[i % palette.length] },
    ])
  )

  const ranges = new Map(
    metricKeys.map((k) => {
      const values = data
        .map((row) => Number(row[k]))
        .filter((value) => Number.isFinite(value))
      return [k, { min: Math.min(...values), max: Math.max(...values) }]
    })
  )

  const magnitudes = metricKeys
    .map((k) => {
      const range = ranges.get(k)!
      return Math.max(Math.abs(range.min), Math.abs(range.max))
    })
    .filter((magnitude) => magnitude > 0)

  const scaled =
    magnitudes.length > 1 &&
    Math.max(...magnitudes) / Math.min(...magnitudes) > 100

  const chartData = scaled
    ? data.map((row) => {
        const scaledRow: Record<string, string | number> = {
          label: row.label,
        }
        metricKeys.forEach((k) => {
          const range = ranges.get(k)!
          const value = Number(row[k])
          scaledRow[k] =
            range.max === range.min
              ? 0.5
              : (value - range.min) / (range.max - range.min)
          scaledRow[`${k}__raw`] = value
        })
        return scaledRow
      })
    : data

  return (
    <div className="flex flex-col gap-2">
      {scaled && (
        <p className="text-xs text-[#586378]">
          Metrics have very different ranges, so each line is scaled to its own
          minimum and maximum. Hover a point to see the real values.
        </p>
      )}
      <ChartContainer config={config} className={className}>
        <LineChart
          data={chartData}
          margin={{ left: 8, right: 8, top: 8, bottom: 8 }}
        >
          <CartesianGrid vertical={false} stroke="#2A3242" />
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            tickMargin={12}
            tick={
              onLabelClick ? (
                <ClickableTick onLabelClick={onLabelClick} />
              ) : undefined
            }
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            width={40}
            domain={scaled ? [-0.1, 1.1] : undefined}
            tick={scaled ? false : undefined}
          />
          <ChartTooltip
            content={
              <ChartTooltipContent
                formatter={(value, name, item) => (
                  <>
                    <div
                      className="h-2.5 w-2.5 shrink-0 rounded-[2px]"
                      style={{ backgroundColor: item.color }}
                    />
                    <div className="flex flex-1 items-center justify-between gap-4 leading-none">
                      <span className="text-muted-foreground">
                        {config[name as string]?.label ?? name}
                      </span>
                      <span className="text-foreground font-mono font-medium tabular-nums">
                        {formatValue(
                          scaled
                            ? Number(item.payload[`${name as string}__raw`])
                            : Number(value)
                        )}
                      </span>
                    </div>
                  </>
                )}
              />
            }
          />
          <ChartLegend content={<ChartLegendContent />} />
          {metricKeys.map((k) => (
            <Line
              key={k}
              dataKey={k}
              type="monotone"
              stroke={`var(--color-${k})`}
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
          ))}
        </LineChart>
      </ChartContainer>
    </div>
  )
}

export function ParameterImpactChart({
  data,
  xKey,
  yKey,
  className,
  onPointClick,
}: {
  data: { id: string; label: string; x: number; y: number }[]
  xKey: string
  yKey: string
  className?: string
  onPointClick?: (id: string) => void
}) {
  const config: ChartConfig = {
    y: { label: yKey.replace(/_/g, ' '), color: palette[0] },
  }

  const chartData = [...data].sort((a, b) => a.x - b.x)

  return (
    <ChartContainer config={config} className={className}>
      <LineChart
        data={chartData}
        margin={{ left: 8, right: 16, top: 8, bottom: 28 }}
        className={onPointClick ? 'cursor-pointer' : undefined}
        onClick={(state) => {
          const point = state.activePayload?.[0]?.payload as
            { id: string } | undefined
          if (onPointClick && point) {
            onPointClick(point.id)
          }
        }}
      >
        <CartesianGrid vertical={false} stroke="#2A3242" />
        <XAxis
          type="number"
          dataKey="x"
          tickLine={false}
          axisLine={false}
          tickMargin={12}
          domain={['dataMin', 'dataMax']}
          tickFormatter={formatValue}
        >
          <Label
            value={xKey.replace(/_/g, ' ')}
            position="bottom"
            offset={12}
            className="fill-[#828DA3] text-xs"
          />
        </XAxis>
        <YAxis
          tickLine={false}
          axisLine={false}
          width={56}
          tickFormatter={formatValue}
        >
          <Label
            value={yKey.replace(/_/g, ' ')}
            angle={-90}
            position="insideLeft"
            className="fill-[#828DA3] text-xs"
            style={{ textAnchor: 'middle' }}
          />
        </YAxis>
        <ChartTooltip
          content={<ParameterImpactTooltip xKey={xKey} yKey={yKey} />}
        />
        <Line
          dataKey="y"
          type="monotone"
          stroke={palette[0]}
          strokeWidth={2}
          dot={{ r: 3 }}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ChartContainer>
  )
}

function ParameterImpactTooltip({
  active,
  payload,
  xKey,
  yKey,
}: {
  active?: boolean
  payload?: { payload: { label: string; x: number; y: number } }[]
  xKey: string
  yKey: string
}) {
  if (!active || !payload?.length) {
    return null
  }

  const point = payload[0].payload

  return (
    <div className="border-border/50 bg-background grid min-w-[10rem] gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs shadow-xl">
      <div className="font-medium">{point.label}</div>
      <div className="flex items-center justify-between gap-4">
        <span className="text-muted-foreground">{xKey.replace(/_/g, ' ')}</span>
        <span className="text-foreground font-mono font-medium tabular-nums">
          {formatValue(point.x)}
        </span>
      </div>
      <div className="flex items-center justify-between gap-4">
        <span className="text-muted-foreground">{yKey.replace(/_/g, ' ')}</span>
        <span className="text-foreground font-mono font-medium tabular-nums">
          {formatValue(point.y)}
        </span>
      </div>
    </div>
  )
}

export function RunValueBarChart({
  data,
  className,
}: {
  data: { name: string; value: number }[]
  className?: string
}) {
  const config: ChartConfig = Object.fromEntries(
    data.map((d, i) => [
      d.name,
      { label: d.name, color: palette[i % palette.length] },
    ])
  )

  return (
    <ChartContainer config={config} className={className}>
      <BarChart data={data} margin={{ left: 8, right: 8, top: 8, bottom: 8 }}>
        <CartesianGrid vertical={false} stroke="#2A3242" />
        <XAxis dataKey="name" tickLine={false} axisLine={false} />
        <YAxis tickLine={false} axisLine={false} width={48} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Bar dataKey="value" radius={4}>
          {data.map((d, i) => (
            <Cell key={d.name} fill={palette[i % palette.length]} />
          ))}
        </Bar>
      </BarChart>
    </ChartContainer>
  )
}

export function MetricBarChart({
  data,
  metricKeys,
  className,
}: {
  data: Record<string, string | number>[]
  metricKeys: string[]
  className?: string
}) {
  const config: ChartConfig = Object.fromEntries(
    metricKeys.map((k, i) => [
      k,
      { label: k, color: palette[i % palette.length] },
    ])
  )

  return (
    <ChartContainer config={config} className={className}>
      <BarChart data={data} margin={{ left: 8, right: 8, top: 8, bottom: 8 }}>
        <CartesianGrid vertical={false} stroke="#2A3242" />
        <XAxis dataKey="label" tickLine={false} axisLine={false} />
        <YAxis tickLine={false} axisLine={false} width={40} />
        <ChartTooltip content={<ChartTooltipContent />} />
        {metricKeys.map((k) => (
          <Bar key={k} dataKey={k} fill={`var(--color-${k})`} radius={4} />
        ))}
      </BarChart>
    </ChartContainer>
  )
}
