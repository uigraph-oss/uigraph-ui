import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts'

export type TrendPoint = {
  date: string
  costSavedUsd: number
}

const chartConfig: ChartConfig = {
  costSavedUsd: { label: 'Cost Saved', color: 'var(--primary)' },
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

export function SavingsTrendChart({ data }: { data: TrendPoint[] }) {
  return (
    <div className="border-stock bg-shading/40 rounded-[12px] border px-6 py-6">
      <p className="text-paragraph mb-4 text-sm font-medium">
        Savings over time
      </p>
      <ChartContainer config={chartConfig} className="h-[280px] w-full">
        <AreaChart data={data} margin={{ left: 4, right: 4, top: 4 }}>
          <defs>
            <linearGradient id="fillCostSaved" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="5%"
                stopColor="var(--color-costSavedUsd)"
                stopOpacity={0.4}
              />
              <stop
                offset="95%"
                stopColor="var(--color-costSavedUsd)"
                stopOpacity={0.02}
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
            minTickGap={24}
          />
          <YAxis
            width={52}
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
            dataKey="costSavedUsd"
            type="monotone"
            fill="url(#fillCostSaved)"
            stroke="var(--color-costSavedUsd)"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
          />
        </AreaChart>
      </ChartContainer>
    </div>
  )
}
