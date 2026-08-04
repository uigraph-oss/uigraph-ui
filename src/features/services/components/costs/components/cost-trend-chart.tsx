import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import { PROVIDERS } from '../constants/providers'
import type { CostTrendPoint } from '../types'

const chartConfig: ChartConfig = {
  awsCostUsd: { label: PROVIDERS.aws.label, color: PROVIDERS.aws.chartColor },
  azureCostUsd: {
    label: PROVIDERS.azure.label,
    color: PROVIDERS.azure.chartColor,
  },
  gcpCostUsd: { label: PROVIDERS.gcp.label, color: PROVIDERS.gcp.chartColor },
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

export function CostTrendChart({ data }: { data: CostTrendPoint[] }) {
  return (
    <div className="border-stock bg-shading/40 rounded-[12px] border px-6 py-6">
      <p className="text-paragraph mb-4 text-sm font-medium">Cost over time</p>
      <ChartContainer config={chartConfig} className="h-[280px] w-full">
        <AreaChart data={data} margin={{ left: 4, right: 4, top: 4 }}>
          <defs>
            <linearGradient id="fillAws" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="5%"
                stopColor="var(--color-awsCostUsd)"
                stopOpacity={0.5}
              />
              <stop
                offset="95%"
                stopColor="var(--color-awsCostUsd)"
                stopOpacity={0.03}
              />
            </linearGradient>
            <linearGradient id="fillAzure" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="5%"
                stopColor="var(--color-azureCostUsd)"
                stopOpacity={0.5}
              />
              <stop
                offset="95%"
                stopColor="var(--color-azureCostUsd)"
                stopOpacity={0.03}
              />
            </linearGradient>
            <linearGradient id="fillGcp" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="5%"
                stopColor="var(--color-gcpCostUsd)"
                stopOpacity={0.5}
              />
              <stop
                offset="95%"
                stopColor="var(--color-gcpCostUsd)"
                stopOpacity={0.03}
              />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            tickFormatter={(value: string) =>
              axisFormat.format(new Date(value))
            }
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
            dataKey="awsCostUsd"
            type="monotone"
            stackId="cost"
            fill="url(#fillAws)"
            stroke="var(--color-awsCostUsd)"
            strokeWidth={1.5}
            dot={false}
          />
          <Area
            dataKey="azureCostUsd"
            type="monotone"
            stackId="cost"
            fill="url(#fillAzure)"
            stroke="var(--color-azureCostUsd)"
            strokeWidth={1.5}
            dot={false}
          />
          <Area
            dataKey="gcpCostUsd"
            type="monotone"
            stackId="cost"
            fill="url(#fillGcp)"
            stroke="var(--color-gcpCostUsd)"
            strokeWidth={1.5}
            dot={false}
            activeDot={{ r: 4 }}
          />
        </AreaChart>
      </ChartContainer>
    </div>
  )
}
