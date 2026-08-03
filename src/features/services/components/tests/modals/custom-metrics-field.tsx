'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ChartLine, Plus, Trash2 } from 'lucide-react'

export type CustomMetricRow = {
  id: string
  name: string
  value: string
  unit: string
  timeSeriesCsv: string
  showTimeSeries: boolean
}

export function newCustomMetricRow(): CustomMetricRow {
  return {
    id: crypto.randomUUID(),
    name: '',
    value: '',
    unit: '',
    timeSeriesCsv: '',
    showTimeSeries: false,
  }
}

type CustomMetricsFieldProps = {
  rows: CustomMetricRow[]
  onChange: (rows: CustomMetricRow[]) => void
}

/**
 * Lets a user capture metrics beyond the fixed throughput/latency set —
 * e.g. "DB CPU %" or "Queue Depth" pulled from Grafana/Splunk/SignalFx —
 * each optionally with a pasted time series so the results view can chart
 * it, same idea as ML Studio's custom run parameters/metrics.
 */
export function CustomMetricsField({
  rows,
  onChange,
}: CustomMetricsFieldProps) {
  function addRow() {
    onChange([...rows, newCustomMetricRow()])
  }

  function updateRow(id: string, patch: Partial<CustomMetricRow>) {
    onChange(rows.map((r) => (r.id === id ? { ...r, ...patch } : r)))
  }

  function removeRow(id: string) {
    onChange(rows.filter((r) => r.id !== id))
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold">Custom Metrics</p>
          <p className="text-muted-foreground mt-1 text-xs">
            Add any other metric you tracked for this run. Optionally paste a
            time series to chart it on the results page.
          </p>
        </div>
        <Button variant="secondary" size="sm" onClick={addRow}>
          <Plus className="h-4 w-4" />
          Add Metric
        </Button>
      </div>

      {rows.length > 0 && (
        <div className="space-y-3">
          {rows.map((row) => (
            <div
              key={row.id}
              className="border-border rounded-[12px] border bg-[#0F131C] p-3"
            >
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Metric name, e.g. DB CPU"
                  value={row.name}
                  onChange={(e) => updateRow(row.id, { name: e.target.value })}
                  className="h-9 flex-1"
                />
                <Input
                  type="number"
                  placeholder="Value"
                  value={row.value}
                  onChange={(e) => updateRow(row.id, { value: e.target.value })}
                  className="h-9 w-[110px]"
                />
                <Input
                  placeholder="Unit"
                  value={row.unit}
                  onChange={(e) => updateRow(row.id, { unit: e.target.value })}
                  className="h-9 w-[80px]"
                />
                <Button
                  type="button"
                  variant={row.showTimeSeries ? 'secondary' : 'ghost'}
                  size="icon"
                  className="h-9 w-9 shrink-0"
                  title="Add time series for a chart"
                  onClick={() =>
                    updateRow(row.id, { showTimeSeries: !row.showTimeSeries })
                  }
                >
                  <ChartLine className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-destructive h-9 w-9 shrink-0"
                  onClick={() => removeRow(row.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              {row.showTimeSeries && (
                <div className="mt-2 space-y-1">
                  <Label className="text-muted-foreground text-[10px] font-normal">
                    Time series — one &quot;seconds,value&quot; pair per line
                  </Label>
                  <Textarea
                    placeholder={'0,42\n10,55\n20,48'}
                    value={row.timeSeriesCsv}
                    onChange={(e) =>
                      updateRow(row.id, { timeSeriesCsv: e.target.value })
                    }
                    className="h-20 font-mono text-xs"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
