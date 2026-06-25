import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'
import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts'

export type TrendPoint = {
  date: string
  costSavedUsd: number
}

const chartConfig: ChartConfig = {
  costSavedUsd: { label: 'Cost Saved (USD)', color: 'var(--primary)' },
}

export function SavingsTrendChart({ data }: { data: TrendPoint[] }) {
  return (
    <ChartContainer config={chartConfig} className="h-[280px] w-full">
      <AreaChart data={data}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="date"
          tickFormatter={(value: string) => value.slice(5)}
          tickLine={false}
          axisLine={false}
        />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Area
          dataKey="costSavedUsd"
          type="monotone"
          fill="var(--color-costSavedUsd)"
          stroke="var(--color-costSavedUsd)"
          fillOpacity={0.2}
        />
      </AreaChart>
    </ChartContainer>
  )
}
