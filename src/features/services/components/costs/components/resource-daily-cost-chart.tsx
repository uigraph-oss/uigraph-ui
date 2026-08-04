import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts'

const chartConfig: ChartConfig = {
  costUsd: { label: 'Cost', color: 'var(--chart-1)' },
}

const axisFormat = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
})

const tooltipFormat = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
})

const usd = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
})

export function ResourceDailyCostChart({
  data,
}: {
  data: { date: string; costUsd: number }[]
}) {
  if (data.length === 0) {
    return (
      <p className="text-paragraph py-8 text-center text-sm">
        No daily cost data synced for this resource yet.
      </p>
    )
  }

  return (
    <ChartContainer config={chartConfig} className="h-[220px] w-full">
      <AreaChart data={data} margin={{ left: 4, right: 4, top: 4 }}>
        <defs>
          <linearGradient id="fillResourceCost" x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="5%"
              stopColor="var(--color-costUsd)"
              stopOpacity={0.5}
            />
            <stop
              offset="95%"
              stopColor="var(--color-costUsd)"
              stopOpacity={0.03}
            />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis
          dataKey="date"
          tickFormatter={(value: string) => axisFormat.format(new Date(value))}
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          minTickGap={32}
        />
        <YAxis
          width={56}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value: number) =>
            usd.format(value).replace(/\.00$/, '')
          }
        />
        <ChartTooltip
          content={
            <ChartTooltipContent
              labelFormatter={(value) =>
                tooltipFormat.format(new Date(value as string))
              }
              formatter={(value) => usd.format(value as number)}
            />
          }
        />
        <Area
          dataKey="costUsd"
          type="monotone"
          fill="url(#fillResourceCost)"
          stroke="var(--color-costUsd)"
          strokeWidth={1.5}
          dot={false}
          activeDot={{ r: 4 }}
        />
      </AreaChart>
    </ChartContainer>
  )
}
