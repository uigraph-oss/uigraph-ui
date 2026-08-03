'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { LegacyApiEndpoint } from '@/features/services/api/api-adapters'
import { Plus, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { useServiceApiEndpointsContext } from '../../contexts/service-api-endpoints'

type ThresholdMetric =
  'p95LatencyMs' | 'p99LatencyMs' | 'errorRate' | 'requestsPerSec'
type ThresholdComparator = '<' | '<=' | '>' | '>='

const METRIC_OPTIONS: ThresholdMetric[] = [
  'p95LatencyMs',
  'p99LatencyMs',
  'errorRate',
  'requestsPerSec',
]
const METRIC_LABELS: Record<ThresholdMetric, string> = {
  p95LatencyMs: 'P95 latency (ms)',
  p99LatencyMs: 'P99 latency (ms)',
  errorRate: 'Error rate (%)',
  requestsPerSec: 'Requests/sec',
}
const COMPARATOR_OPTIONS: ThresholdComparator[] = ['<', '<=', '>', '>=']

type Threshold = {
  id: string
  metric: ThresholdMetric
  comparator: ThresholdComparator
  value: number
}

function newThreshold(): Threshold {
  return {
    id: crypto.randomUUID(),
    metric: 'p95LatencyMs',
    comparator: '<',
    value: 0,
  }
}

type ConfigureApiEndpointSlaProps = {
  endpoint: LegacyApiEndpoint
  readonly?: boolean
}

export function ConfigureApiEndpointSla({
  endpoint,
  readonly = false,
}: ConfigureApiEndpointSlaProps) {
  const { updateServiceApiEndpoint } = useServiceApiEndpointsContext()
  const [thresholds, setThresholds] = useState<Threshold[]>([])
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    setThresholds(
      (endpoint.sla?.thresholds ?? []).map((t) => ({
        id: t.id,
        metric: t.metric as ThresholdMetric,
        comparator: t.comparator as ThresholdComparator,
        value: t.value,
      }))
    )
  }, [endpoint.sla])

  function addThreshold() {
    setThresholds((t) => [...t, newThreshold()])
  }

  function updateThreshold(id: string, patch: Partial<Threshold>) {
    setThresholds((t) => t.map((x) => (x.id === id ? { ...x, ...patch } : x)))
  }

  function removeThreshold(id: string) {
    setThresholds((t) => t.filter((x) => x.id !== id))
  }

  async function handleSave() {
    if (!endpoint.apiEndpointId) return
    setIsSaving(true)
    try {
      await updateServiceApiEndpoint({
        variables: {
          apiEndpointId: endpoint.apiEndpointId,
          input: {
            sla: {
              thresholds: thresholds.map(
                ({ id, metric, comparator, value }) => ({
                  id,
                  metric,
                  comparator,
                  value,
                })
              ),
            },
          },
        },
      })
      toast.success('SLA saved')
    } catch (error) {
      toast.error('Failed to save SLA')
      console.error(error)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-4 px-6 pb-6">
      <div>
        <h4 className="text-sm font-semibold">Pass/fail thresholds</h4>
        <p className="text-muted-foreground mt-1 text-xs">
          Any load test run that targets this endpoint is automatically graded
          against these — no need to redeclare them per test pack.
        </p>
      </div>

      {thresholds.length === 0 && (
        <p className="text-muted-foreground text-xs">
          No SLA thresholds set for this endpoint yet.
        </p>
      )}

      {thresholds.length > 0 && (
        <div className="space-y-2">
          {thresholds.map((threshold) => (
            <div key={threshold.id} className="flex items-center gap-2">
              <Select
                value={threshold.metric}
                onValueChange={(v) =>
                  updateThreshold(threshold.id, {
                    metric: v as ThresholdMetric,
                  })
                }
                disabled={readonly}
              >
                <SelectTrigger className="h-9 w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {METRIC_OPTIONS.map((metric) => (
                    <SelectItem key={metric} value={metric}>
                      {METRIC_LABELS[metric]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={threshold.comparator}
                onValueChange={(v) =>
                  updateThreshold(threshold.id, {
                    comparator: v as ThresholdComparator,
                  })
                }
                disabled={readonly}
              >
                <SelectTrigger className="h-9 w-[80px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {COMPARATOR_OPTIONS.map((comparator) => (
                    <SelectItem key={comparator} value={comparator}>
                      {comparator}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                type="number"
                value={threshold.value}
                onChange={(e) =>
                  updateThreshold(threshold.id, {
                    value: Number(e.target.value),
                  })
                }
                disabled={readonly}
                className="h-9 w-[100px]"
              />
              {!readonly && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-destructive h-9 w-9"
                  onClick={() => removeThreshold(threshold.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
      )}

      {!readonly && (
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={addThreshold}>
            <Plus className="h-4 w-4" />
            Add Threshold
          </Button>
          <Button
            preset="primary"
            size="sm"
            onClick={handleSave}
            disabled={isSaving}
          >
            Save SLA
          </Button>
        </div>
      )}
    </div>
  )
}
