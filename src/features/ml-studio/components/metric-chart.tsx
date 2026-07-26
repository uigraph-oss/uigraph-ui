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

  return (
    <ChartContainer config={config} className={className}>
      <LineChart data={data} margin={{ left: 8, right: 8, top: 8, bottom: 8 }}>
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
        <YAxis tickLine={false} axisLine={false} width={40} />
        <ChartTooltip content={<ChartTooltipContent />} />
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
