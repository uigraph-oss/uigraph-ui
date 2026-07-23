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
  Line,
  LineChart,
  XAxis,
  YAxis,
} from 'recharts'
import type { MetricPoint } from '../types'

const palette = ['#3B6BFF', '#21AD6D', '#F5A623', '#B07CFF', '#FF6369']

export function MetricLineChart({
  series,
  className,
}: {
  series: Record<string, MetricPoint[]>
  className?: string
}) {
  const keys = Object.keys(series)
  const maxLen = Math.max(0, ...keys.map((k) => series[k].length))

  const data = Array.from({ length: maxLen }, (_, i) => {
    const row: Record<string, number> = { step: i + 1 }
    keys.forEach((k) => {
      const point = series[k][i]
      if (point) {
        row[k] = point.value
      }
    })
    return row
  })

  const config: ChartConfig = Object.fromEntries(
    keys.map((k, i) => [k, { label: k, color: palette[i % palette.length] }])
  )

  return (
    <ChartContainer config={config} className={className}>
      <LineChart data={data} margin={{ left: 8, right: 8, top: 8, bottom: 8 }}>
        <CartesianGrid vertical={false} stroke="#2A3242" />
        <XAxis dataKey="step" tickLine={false} axisLine={false} />
        <YAxis tickLine={false} axisLine={false} width={40} />
        <ChartTooltip content={<ChartTooltipContent />} />
        {keys.map((k) => (
          <Line
            key={k}
            dataKey={k}
            type="monotone"
            stroke={`var(--color-${k})`}
            strokeWidth={2}
            dot={false}
          />
        ))}
      </LineChart>
    </ChartContainer>
  )
}

export function MetricTrendChart({
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
