'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Trash2 } from 'lucide-react'
import { EndpointPicker } from '../endpoint-picker'

export type TargetEndpointRow = {
  id: string
  apiEndpointId?: string
  endpoint: string
  method: string
  requestCount: string
  requestsPerSec: string
  errorRatePct: string
  avgLatencyMs: string
  p50LatencyMs: string
  p90LatencyMs: string
  p95LatencyMs: string
  p99LatencyMs: string
}

type NumericFieldKey = Exclude<
  keyof TargetEndpointRow,
  'id' | 'apiEndpointId' | 'endpoint' | 'method'
>

const TRAFFIC_FIELDS: { key: NumericFieldKey; label: string }[] = [
  { key: 'requestCount', label: 'Requests' },
  { key: 'requestsPerSec', label: 'Requests/sec' },
  { key: 'errorRatePct', label: 'Error %' },
]

const LATENCY_FIELDS: { key: NumericFieldKey; label: string }[] = [
  { key: 'avgLatencyMs', label: 'Avg (ms)' },
  { key: 'p50LatencyMs', label: 'P50 (ms)' },
  { key: 'p90LatencyMs', label: 'P90 (ms)' },
  { key: 'p95LatencyMs', label: 'P95 (ms)' },
  { key: 'p99LatencyMs', label: 'P99 (ms)' },
]

function emptyMetricFields(): Record<NumericFieldKey, string> {
  return {
    requestCount: '',
    requestsPerSec: '',
    errorRatePct: '',
    avgLatencyMs: '',
    p50LatencyMs: '',
    p90LatencyMs: '',
    p95LatencyMs: '',
    p99LatencyMs: '',
  }
}

type TargetEndpointsFieldProps = {
  rows: TargetEndpointRow[]
  onChange: (rows: TargetEndpointRow[]) => void
  /** Endpoint-scoped pack: rows come from the pack's declared endpoints and can't be added/removed here. */
  locked?: boolean
  /** Endpoint-scoped pack: every metric below must be filled in for every row before the run can be saved. */
  required?: boolean
  error?: string | null
}

export function TargetEndpointsField({
  rows,
  onChange,
  locked = false,
  required = false,
  error,
}: TargetEndpointsFieldProps) {
  function addRow(endpoint: { id: string; method: string; path: string }) {
    if (
      rows.some(
        (r) => r.endpoint === endpoint.path && r.method === endpoint.method
      )
    ) {
      return
    }
    onChange([
      ...rows,
      {
        id: crypto.randomUUID(),
        apiEndpointId: endpoint.id,
        endpoint: endpoint.path,
        method: endpoint.method,
        ...emptyMetricFields(),
      },
    ])
  }

  function updateRow(id: string, patch: Partial<TargetEndpointRow>) {
    onChange(rows.map((r) => (r.id === id ? { ...r, ...patch } : r)))
  }

  function removeRow(id: string) {
    onChange(rows.filter((r) => r.id !== id))
  }

  return (
    <div className="border-border rounded-[16px] border bg-[#141925] p-4">
      <p className="text-sm font-semibold">
        Target Endpoints{' '}
        <span className="text-muted-foreground font-normal">
          ({required ? 'required' : 'optional'})
        </span>
      </p>
      <p className="text-muted-foreground mt-1 mb-3 text-xs">
        {locked
          ? "This pack is endpoint-scoped — enter this run's traffic and latency for each of its declared endpoints. The run totals below are computed from these, so there's nothing to re-type."
          : "Optionally attribute this run's metrics to specific endpoints, used for SLA grading. These are independent from the run totals below — enter them separately, they aren't rolled into each other."}
      </p>

      {rows.length > 0 && (
        <div className="mb-3 space-y-3">
          {rows.map((row) => (
            <div
              key={row.id}
              className="rounded-[12px] border border-[#2A3242] bg-[#0F131C] p-3"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="min-w-0 truncate font-mono text-xs">
                  {row.method} {row.endpoint}
                </span>
                {!locked && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-destructive h-7 w-7 shrink-0"
                    onClick={() => removeRow(row.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <div className="mt-2.5 grid grid-cols-3 gap-2">
                {TRAFFIC_FIELDS.map(({ key, label }) => (
                  <div key={key} className="space-y-1">
                    <Label className="text-muted-foreground text-[10px] font-normal">
                      {label}
                    </Label>
                    <Input
                      type="number"
                      value={row[key]}
                      onChange={(e) =>
                        updateRow(row.id, { [key]: e.target.value })
                      }
                      className="h-8"
                    />
                  </div>
                ))}
              </div>

              <div className="mt-2 grid grid-cols-5 gap-2">
                {LATENCY_FIELDS.map(({ key, label }) => (
                  <div key={key} className="space-y-1">
                    <Label className="text-muted-foreground text-[10px] font-normal">
                      {label}
                    </Label>
                    <Input
                      type="number"
                      value={row[key]}
                      onChange={(e) =>
                        updateRow(row.id, { [key]: e.target.value })
                      }
                      className="h-8"
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {!locked && <EndpointPicker onSelect={addRow} />}
      {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
    </div>
  )
}
