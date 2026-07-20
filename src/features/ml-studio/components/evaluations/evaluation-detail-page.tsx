'use client'

import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useParams } from 'react-router-dom'
import { mockEvaluations } from '../../constants/mock-data'
import { MetricBarChart } from '../metric-chart'
import { InfoRow, Panel } from '../panel'

export function EvaluationDetailPage() {
  const { evaluationId } = useParams<{ evaluationId: string }>()
  const evaluation = mockEvaluations.find((e) => e.id === evaluationId)

  if (!evaluation) {
    return <div className="p-6 text-[#828DA3]">Evaluation not found.</div>
  }

  const chartData = evaluation.metrics.map((m) => ({
    label: m.name,
    value: m.value,
  }))

  return (
    <div className="flex flex-col gap-5 p-6">
      <div>
        <h2 className="text-xl font-semibold text-[#F4F7FC]">
          {evaluation.name}
        </h2>
        <p className="mt-1 text-sm text-[#828DA3]">{evaluation.description}</p>
      </div>

      <Panel>
        <div className="grid grid-cols-2 gap-5 md:grid-cols-4">
          <InfoRow label="Type">{evaluation.type}</InfoRow>
          <InfoRow label="Evaluator">{evaluation.evaluator}</InfoRow>
          <InfoRow label="Evaluated">
            {new Date(evaluation.evaluatedAt).toLocaleDateString()}
          </InfoRow>
          <InfoRow label="Metrics">{evaluation.metrics.length}</InfoRow>
        </div>
        <InfoRow label="Summary">{evaluation.summary}</InfoRow>
      </Panel>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Panel title="Metrics">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Metric</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Direction</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {evaluation.metrics.map((m) => (
                <TableRow key={m.id}>
                  <TableCell className="text-[#F4F7FC]">{m.name}</TableCell>
                  <TableCell className="font-mono text-[#F4F7FC]">
                    {m.value}
                    {m.unit}
                  </TableCell>
                  <TableCell className="text-[#828DA3] capitalize">
                    {m.category}
                  </TableCell>
                  <TableCell>
                    <Badge className="border-stock rounded-md border bg-[#1E2533] text-[#828DA3]">
                      {m.direction}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Panel>

        <Panel title="Metric values" description="Reported scalar metrics.">
          <MetricBarChart
            data={chartData}
            metricKeys={['value']}
            className="aspect-[4/3] w-full"
          />
        </Panel>
      </div>
    </div>
  )
}
