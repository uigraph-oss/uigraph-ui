'use client'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useState } from 'react'
import { ParameterImpactChart } from './metric-chart'
import { Panel } from './panel'

export type ParameterImpactPoint = {
  id: string
  name: string
  parameters: Record<string, string | number>
  metrics: Record<string, number>
}

export function ParameterImpactPanel({
  points,
  subjectLabel,
  onPointClick,
}: {
  points: ParameterImpactPoint[]
  subjectLabel: 'run' | 'evaluation'
  onPointClick?: (id: string) => void
}) {
  const [parameterKey, setParameterKey] = useState('')
  const [metricKey, setMetricKey] = useState('')

  const allParameterKeys = Array.from(
    new Set(points.flatMap((p) => Object.keys(p.parameters)))
  )
  const parameterKeys = allParameterKeys.filter(
    (key) =>
      points.filter(
        (p) =>
          p.parameters[key] !== undefined &&
          p.parameters[key] !== '' &&
          Number.isFinite(Number(p.parameters[key]))
      ).length >= 2
  )
  const metricKeys = Array.from(
    new Set(points.flatMap((p) => Object.keys(p.metrics)))
  )

  const activeParameterKey = parameterKeys.includes(parameterKey)
    ? parameterKey
    : (parameterKeys[0] ?? '')
  const activeMetricKey = metricKeys.includes(metricKey)
    ? metricKey
    : (metricKeys[0] ?? '')

  const data = points.flatMap((p) => {
    const x = Number(p.parameters[activeParameterKey])
    const y = Number(p.metrics[activeMetricKey])
    if (
      p.parameters[activeParameterKey] === undefined ||
      p.parameters[activeParameterKey] === '' ||
      !Number.isFinite(x) ||
      p.metrics[activeMetricKey] === undefined ||
      !Number.isFinite(y)
    ) {
      return []
    }
    return [{ id: p.id, label: p.name, x, y }]
  })

  const hasSelection = activeParameterKey !== '' && activeMetricKey !== ''

  return (
    <Panel
      title="Parameter impact"
      description={`How each parameter value relates to this metric across ${subjectLabel}s.`}
      action={
        hasSelection && (
          <div className="flex items-center gap-3">
            <Select value={activeParameterKey} onValueChange={setParameterKey}>
              <SelectTrigger className="border-stock text-foreground/80 h-[2.7938125rem] w-48 rounded-[0.80315625rem] bg-transparent px-4">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {parameterKeys.map((key) => (
                  <SelectItem key={key} value={key}>
                    {key.replace(/_/g, ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={activeMetricKey} onValueChange={setMetricKey}>
              <SelectTrigger className="border-stock text-foreground/80 h-[2.7938125rem] w-48 rounded-[0.80315625rem] bg-transparent px-4">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {metricKeys.map((key) => (
                  <SelectItem key={key} value={key}>
                    {key.replace(/_/g, ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )
      }
    >
      {!hasSelection && (
        <p className="text-sm text-[#586378]">
          No numeric parameters recorded on these {subjectLabel}s.
        </p>
      )}
      {hasSelection && data.length === 0 && (
        <p className="text-sm text-[#586378]">
          No {subjectLabel} records both this parameter and this metric.
        </p>
      )}
      {hasSelection && data.length > 0 && (
        <ParameterImpactChart
          data={data}
          xKey={activeParameterKey}
          yKey={activeMetricKey}
          className="aspect-[3/1] w-full"
          onPointClick={onPointClick}
        />
      )}
    </Panel>
  )
}
