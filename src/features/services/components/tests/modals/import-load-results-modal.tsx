'use client'

import { GT } from '@/api'
import { BetterDialogContent } from '@/components/better-dialog'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { uploadFile } from '@/features/uploads/api/uploads'
import { BetterTabController, useBetterTabs } from '@/hooks/use-better-tabs'
import { cn } from '@/lib/utils'
import { useCurrentOrganization } from '@/store/auth-store'
import { ChevronDown, UploadCloud } from 'lucide-react'
import { useRef, useState } from 'react'
import type { PackTargetEndpoint } from '../../../lib/load-pack-target-endpoints'
import {
  LoadTestParseError,
  parseLoadTestFile,
} from '../../../lib/parse-load-test-file'
import {
  CustomMetricsField,
  type CustomMetricRow,
} from './custom-metrics-field'
import { ScreenshotUploader } from './screenshot-uploader'
import {
  TargetEndpointsField,
  type TargetEndpointRow,
} from './target-endpoints-field'

type ImportLoadResultsModalProps = {
  /**
   * The endpoints declared on this run's test pack, if it's endpoint-scoped.
   * Empty for a broad/system-wide pack — the target-endpoints section is
   * then optional and freely editable instead of locked/required.
   */
  scopedTargetEndpoints?: PackTargetEndpoint[]
  onSubmit: (data: {
    environment: string
    releaseLabel?: string
    overallStatus?: string
    loadMetrics: GT.LoadTestMetricsInput
  }) => Promise<void>
}

const RESULT_OPTIONS = [
  { value: 'passed', label: 'Passed' },
  { value: 'partial', label: 'Partial' },
  { value: 'failed', label: 'Failed' },
] as const

type ManualFieldKey =
  | 'durationSec'
  | 'totalRequests'
  | 'requestsPerSec'
  | 'errorRatePct'
  | 'minLatencyMs'
  | 'avgLatencyMs'
  | 'maxLatencyMs'
  | 'p50LatencyMs'
  | 'p90LatencyMs'
  | 'p95LatencyMs'
  | 'p99LatencyMs'

const MANUAL_FIELD_DEFAULTS: Record<ManualFieldKey, string> = {
  durationSec: '',
  totalRequests: '',
  requestsPerSec: '',
  errorRatePct: '',
  minLatencyMs: '',
  avgLatencyMs: '',
  maxLatencyMs: '',
  p50LatencyMs: '',
  p90LatencyMs: '',
  p95LatencyMs: '',
  p99LatencyMs: '',
}

const TRAFFIC_FIELDS: { key: ManualFieldKey; label: string }[] = [
  { key: 'durationSec', label: 'Duration (sec)' },
  { key: 'totalRequests', label: 'Total Requests' },
  { key: 'requestsPerSec', label: 'Requests/sec' },
  { key: 'errorRatePct', label: 'Error Rate (%)' },
]

const LATENCY_FIELDS: { key: ManualFieldKey; label: string }[] = [
  { key: 'minLatencyMs', label: 'Min (ms)' },
  { key: 'avgLatencyMs', label: 'Avg (ms)' },
  { key: 'maxLatencyMs', label: 'Max (ms)' },
  { key: 'p50LatencyMs', label: 'P50 (ms)' },
  { key: 'p90LatencyMs', label: 'P90 (ms)' },
  { key: 'p95LatencyMs', label: 'P95 (ms)' },
  { key: 'p99LatencyMs', label: 'P99 (ms)' },
]

function num(value: string): number {
  const n = Number(value)
  return Number.isFinite(n) ? n : 0
}

function parseTimeSeriesCsv(text: string): GT.CustomMetricPointInput[] {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [t, v] = line.split(',').map((s) => s.trim())
      return { t: num(t), v: num(v) }
    })
}

function buildCustomMetrics(
  rows: CustomMetricRow[]
): GT.CustomMetricInput[] | undefined {
  const metrics = rows
    .filter((r) => r.name.trim())
    .map((r) => ({
      name: r.name.trim(),
      value: r.value.trim() ? num(r.value) : undefined,
      unit: r.unit.trim() || undefined,
      timeSeries: r.timeSeriesCsv.trim()
        ? parseTimeSeriesCsv(r.timeSeriesCsv)
        : undefined,
    }))
  return metrics.length > 0 ? metrics : undefined
}

function buildPerEndpoint(
  rows: TargetEndpointRow[]
): GT.LoadTestEndpointBreakdownInput[] | undefined {
  return rows.length > 0
    ? rows.map((r) => ({
        endpoint: r.endpoint,
        method: r.method,
        requestCount: num(r.requestCount),
        requestsPerSec: num(r.requestsPerSec),
        errorRate: num(r.errorRatePct) / 100,
        avgLatencyMs: num(r.avgLatencyMs),
        p50LatencyMs: num(r.p50LatencyMs),
        p90LatencyMs: num(r.p90LatencyMs),
        p95LatencyMs: num(r.p95LatencyMs),
        p99LatencyMs: num(r.p99LatencyMs),
        apiEndpointId: r.apiEndpointId,
      }))
    : undefined
}

/**
 * For an endpoint-scoped pack, the target-endpoint rows are the only
 * numbers the user enters — the run-level totals are a rollup of them
 * rather than a second, separately-typed set of the same figures.
 * Percentiles don't average meaningfully across endpoints, so each rolls
 * up as the worst (max) value among them — a conservative "the slowest
 * path in this run" summary. Average latency, being linear, is rolled up
 * as a request-weighted mean instead.
 */
function computeScopedTotals(rows: TargetEndpointRow[]) {
  const totalRequests = rows.reduce((sum, r) => sum + num(r.requestCount), 0)
  const requestsPerSec = rows.reduce((sum, r) => sum + num(r.requestsPerSec), 0)
  const weightedErrorSum = rows.reduce(
    (sum, r) => sum + num(r.requestCount) * num(r.errorRatePct),
    0
  )
  const errorRatePct = totalRequests > 0 ? weightedErrorSum / totalRequests : 0
  const weightedAvgSum = rows.reduce(
    (sum, r) => sum + num(r.requestCount) * num(r.avgLatencyMs),
    0
  )
  const avgLatencyMs = totalRequests > 0 ? weightedAvgSum / totalRequests : 0
  function maxOf(
    key: 'p50LatencyMs' | 'p90LatencyMs' | 'p95LatencyMs' | 'p99LatencyMs'
  ) {
    const values = rows.map((r) => num(r[key])).filter((v) => v > 0)
    return values.length > 0 ? Math.max(...values) : 0
  }
  return {
    totalRequests,
    requestsPerSec,
    errorRatePct,
    avgLatencyMs,
    p50LatencyMs: maxOf('p50LatencyMs'),
    p90LatencyMs: maxOf('p90LatencyMs'),
    p95LatencyMs: maxOf('p95LatencyMs'),
    p99LatencyMs: maxOf('p99LatencyMs'),
  }
}

export function ImportLoadResultsModal({
  scopedTargetEndpoints = [],
  onSubmit,
}: ImportLoadResultsModalProps) {
  const isScoped = scopedTargetEndpoints.length > 0
  const orgId = useCurrentOrganization().id
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [environment, setEnvironment] = useState('')
  const [releaseLabel, setReleaseLabel] = useState('')
  const [overallStatus, setOverallStatus] = useState('')
  const [environmentError, setEnvironmentError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [modeControl, mode] = useBetterTabs([
    { id: 'file', label: 'Upload File' },
    { id: 'manual', label: 'Enter Manually' },
  ])

  const [fileName, setFileName] = useState<string | null>(null)
  const [rawText, setRawText] = useState('')
  const [parseError, setParseError] = useState<string | null>(null)

  const [manualFields, setManualFields] = useState<
    Record<ManualFieldKey, string>
  >(MANUAL_FIELD_DEFAULTS)
  // Fields the user has typed into directly — once touched, deriving RPS
  // from duration/total requests stops overwriting it, so a deliberate
  // override sticks.
  const [touchedManualFields, setTouchedManualFields] = useState<
    Set<ManualFieldKey>
  >(new Set())
  const [manualError, setManualError] = useState<string | null>(null)
  const [advancedOpen, setAdvancedOpen] = useState(false)

  // For a broad pack, run totals and the per-endpoint breakdown are
  // independent numbers entered separately — one is the whole-run summary,
  // the other is optional detail used for SLA grading. For a scoped pack
  // the endpoint rows are the only numbers entered at all; run totals are
  // computed from them (see computeScopedTotals) rather than re-typed.
  const [targetEndpoints, setTargetEndpoints] = useState<TargetEndpointRow[]>(
    () =>
      scopedTargetEndpoints.map((e) => ({
        id: e.apiEndpointId,
        apiEndpointId: e.apiEndpointId,
        endpoint: e.path,
        method: e.method,
        requestCount: '',
        requestsPerSec: '',
        errorRatePct: '',
        avgLatencyMs: '',
        p50LatencyMs: '',
        p90LatencyMs: '',
        p95LatencyMs: '',
        p99LatencyMs: '',
      }))
  )
  const [targetEndpointsError, setTargetEndpointsError] = useState<
    string | null
  >(null)
  const [customMetrics, setCustomMetrics] = useState<CustomMetricRow[]>([])
  const [notes, setNotes] = useState('')
  const [screenshots, setScreenshots] = useState<File[]>([])

  function withAutoRps(
    fields: Record<ManualFieldKey, string>,
    touched: Set<ManualFieldKey>
  ): Record<ManualFieldKey, string> {
    if (touched.has('requestsPerSec')) return fields
    const duration = num(fields.durationSec)
    const total = num(fields.totalRequests)
    if (duration <= 0 || total <= 0) return fields
    return {
      ...fields,
      requestsPerSec: String(Math.round((total / duration) * 100) / 100),
    }
  }

  function updateManualField(key: ManualFieldKey, value: string) {
    const nextTouched = new Set(touchedManualFields)
    nextTouched.add(key)
    setTouchedManualFields(nextTouched)
    setManualFields((fields) =>
      withAutoRps({ ...fields, [key]: value }, nextTouched)
    )
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setFileName(file.name)
    setParseError(null)
    try {
      const text = await file.text()
      setRawText(text)
    } catch {
      setParseError('Could not read that file.')
    }
  }

  function buildManualMetrics(): GT.LoadTestMetricsInput | null {
    if (isScoped) {
      if (!manualFields.durationSec.trim()) {
        setManualError('Duration is required.')
        return null
      }
      setManualError(null)
      const totals = computeScopedTotals(targetEndpoints)
      const duration = num(manualFields.durationSec)
      // Min/max latency aren't collected per endpoint (not shown anywhere
      // in the results UI either), so they fall back to the nearest rollup
      // we do have — the p50/p99 rollups — rather than a fabricated number.
      return {
        durationSec: duration,
        totalRequests: totals.totalRequests,
        requestsPerSec: totals.requestsPerSec,
        // Not collected via manual entry — only ever comes from an
        // uploaded k6 summary, which reports it directly.
        virtualUsers: 0,
        errorRate: totals.errorRatePct / 100,
        minLatencyMs: totals.p50LatencyMs,
        avgLatencyMs: totals.avgLatencyMs,
        maxLatencyMs: totals.p99LatencyMs,
        p50LatencyMs: totals.p50LatencyMs,
        p90LatencyMs: totals.p90LatencyMs,
        p95LatencyMs: totals.p95LatencyMs,
        p99LatencyMs: totals.p99LatencyMs,
        timeSeries: [],
        perEndpoint: [],
        customMetrics: buildCustomMetrics(customMetrics),
      }
    }

    if (
      !manualFields.durationSec.trim() ||
      !manualFields.requestsPerSec.trim() ||
      !manualFields.p95LatencyMs.trim()
    ) {
      setManualError('Duration, requests/sec, and P95 latency are required.')
      return null
    }
    setManualError(null)
    return {
      durationSec: num(manualFields.durationSec),
      totalRequests: num(manualFields.totalRequests),
      requestsPerSec: num(manualFields.requestsPerSec),
      // Not collected via manual entry — only ever comes from an uploaded
      // k6 summary, which reports it directly.
      virtualUsers: 0,
      errorRate: num(manualFields.errorRatePct) / 100,
      minLatencyMs: num(manualFields.minLatencyMs),
      avgLatencyMs: num(manualFields.avgLatencyMs),
      maxLatencyMs: num(manualFields.maxLatencyMs),
      p50LatencyMs: num(manualFields.p50LatencyMs),
      p90LatencyMs: num(manualFields.p90LatencyMs),
      p95LatencyMs: num(manualFields.p95LatencyMs),
      p99LatencyMs: num(manualFields.p99LatencyMs),
      timeSeries: [],
      perEndpoint: [],
      customMetrics: buildCustomMetrics(customMetrics),
    }
  }

  async function handleSubmit() {
    setEnvironmentError(null)
    setParseError(null)
    setManualError(null)
    setTargetEndpointsError(null)

    if (!environment.trim()) {
      setEnvironmentError('Environment is required')
      return
    }

    if (isScoped) {
      const incomplete = targetEndpoints.some(
        (r) =>
          !r.requestCount.trim() ||
          !r.requestsPerSec.trim() ||
          !r.errorRatePct.trim() ||
          !r.avgLatencyMs.trim() ||
          !r.p50LatencyMs.trim() ||
          !r.p90LatencyMs.trim() ||
          !r.p95LatencyMs.trim() ||
          !r.p99LatencyMs.trim()
      )
      if (incomplete) {
        setTargetEndpointsError(
          'This pack is endpoint-scoped — fill in every traffic and latency field for each target endpoint.'
        )
        return
      }
    }

    let loadMetrics: GT.LoadTestMetricsInput
    // Scoped packs have no file-upload option — they always compute the
    // run from the (required) target-endpoint rows above.
    if (isScoped || mode === 'manual') {
      const manualMetrics = buildManualMetrics()
      if (!manualMetrics) return
      loadMetrics = manualMetrics
    } else {
      if (!rawText.trim()) {
        setParseError('Upload or paste a load test results file first.')
        return
      }
      try {
        loadMetrics = parseLoadTestFile(rawText, fileName ?? undefined)
      } catch (error) {
        setParseError(
          error instanceof LoadTestParseError
            ? error.message
            : 'Could not parse this file.'
        )
        return
      }
    }

    const perEndpoint = buildPerEndpoint(targetEndpoints)
    if (perEndpoint) loadMetrics.perEndpoint = perEndpoint
    if (notes.trim()) loadMetrics.notes = notes.trim()

    setIsSubmitting(true)
    try {
      if (screenshots.length > 0 && orgId) {
        loadMetrics.screenshotUrls = await Promise.all(
          screenshots.map((file) => uploadFile(orgId, file))
        )
      }
      await onSubmit({
        environment: environment.trim(),
        releaseLabel: releaseLabel.trim() || undefined,
        overallStatus: overallStatus || undefined,
        loadMetrics,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <BetterDialogContent
      title="Add Load Test Run"
      description={
        isScoped
          ? "Enter this run's traffic and latency for each of this pack's target endpoints."
          : 'Import a k6/CSV results file or enter the metrics from your load test manually.'
      }
      footerSubmit="Add Run"
      footerSubmitLoading={isSubmitting}
      onFooterSubmitClick={handleSubmit}
      footerCancel="Cancel"
    >
      <div className="space-y-6">
        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-2">
            <Label htmlFor="environment" className="text-sm font-normal">
              Environment
            </Label>
            <Input
              id="environment"
              placeholder="e.g. staging, production"
              value={environment}
              onChange={(e) => setEnvironment(e.target.value)}
              className={cn(
                'h-11 rounded-[12px] border border-[#2A3242] bg-[#141925] px-4 focus:outline-none',
                environmentError && 'border-red-500'
              )}
            />
            {environmentError && (
              <p className="text-sm text-red-500">{environmentError}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="releaseLabel" className="text-sm font-normal">
              Release Label{' '}
              <span className="text-muted-foreground">(optional)</span>
            </Label>
            <Input
              id="releaseLabel"
              placeholder="e.g. v1.2.3"
              value={releaseLabel}
              onChange={(e) => setReleaseLabel(e.target.value)}
              className="h-11 rounded-[12px] border border-[#2A3242] bg-[#141925] px-4 focus:outline-none"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="overallStatus" className="text-sm font-normal">
              Result <span className="text-muted-foreground">(optional)</span>
            </Label>
            <Select value={overallStatus} onValueChange={setOverallStatus}>
              <SelectTrigger
                id="overallStatus"
                className="h-11 w-full rounded-[12px] border border-[#2A3242] bg-[#141925] px-4"
              >
                <SelectValue placeholder="Not set" />
              </SelectTrigger>
              <SelectContent>
                {RESULT_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-4">
          {isScoped ? (
            <>
              <TargetEndpointsField
                rows={targetEndpoints}
                onChange={setTargetEndpoints}
                locked
                required
                error={targetEndpointsError}
              />

              <div className="space-y-1.5">
                <Label className="text-sm font-normal">Duration (sec)</Label>
                <Input
                  type="number"
                  value={manualFields.durationSec}
                  onChange={(e) =>
                    updateManualField('durationSec', e.target.value)
                  }
                  className="h-9 w-[160px]"
                />
              </div>
            </>
          ) : (
            <>
              <BetterTabController control={modeControl} />

              {mode === 'file' ? (
                <div className="space-y-2">
                  <Label className="text-sm font-normal">Results file</Label>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className={cn(
                      'flex w-full flex-col items-center gap-2 rounded-[16px] border border-dashed border-[#2A3242] bg-[#141925] px-6 py-8 text-center transition-colors hover:border-[#3A4356]',
                      parseError && 'border-red-500'
                    )}
                  >
                    <UploadCloud className="text-muted-foreground h-6 w-6" />
                    <span className="text-sm font-medium">
                      {fileName ?? 'Click to upload a results file'}
                    </span>
                    <span className="text-muted-foreground text-xs">
                      k6 --summary-export JSON, or a CSV export from Grafana,
                      Splunk, or SignalFx
                    </span>
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="application/json,.json,.csv,text/csv"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  {parseError && (
                    <p className="text-sm text-red-500">{parseError}</p>
                  )}
                  <div className="text-muted-foreground flex flex-wrap items-center gap-x-1.5 gap-y-1 text-xs">
                    <span>Not sure about the format?</span>
                    <a
                      href="/samples/load-test/k6-summary-example.json"
                      target="_blank"
                      rel="noreferrer"
                      className="text-primary underline underline-offset-2"
                    >
                      View k6 summary sample
                    </a>
                    <span>·</span>
                    <a
                      href="/samples/load-test/full-metrics-example.json"
                      target="_blank"
                      rel="noreferrer"
                      className="text-primary underline underline-offset-2"
                    >
                      View full-detail JSON sample
                    </a>
                    <span>·</span>
                    <a
                      href="/samples/load-test/generic-metrics-example.csv"
                      target="_blank"
                      rel="noreferrer"
                      className="text-primary underline underline-offset-2"
                    >
                      View CSV sample
                    </a>
                  </div>
                </div>
              ) : (
                <>
                  <div className="border-border rounded-[16px] border bg-[#141925] p-4">
                    <p className="text-sm font-semibold">Traffic</p>
                    <div className="mt-3 grid grid-cols-4 gap-3">
                      {TRAFFIC_FIELDS.map(({ key, label }) => (
                        <div key={key} className="space-y-1.5">
                          <Label className="text-muted-foreground text-xs font-normal">
                            {label}
                          </Label>
                          <Input
                            type="number"
                            value={manualFields[key]}
                            onChange={(e) =>
                              updateManualField(key, e.target.value)
                            }
                            className="h-9"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="border-border rounded-[16px] border bg-[#141925] p-4">
                    <p className="text-sm font-semibold">Latency</p>
                    <div className="mt-3 grid grid-cols-4 gap-3">
                      {LATENCY_FIELDS.map(({ key, label }) => (
                        <div key={key} className="space-y-1.5">
                          <Label className="text-muted-foreground text-xs font-normal">
                            {label}
                          </Label>
                          <Input
                            type="number"
                            value={manualFields[key]}
                            onChange={(e) =>
                              updateManualField(key, e.target.value)
                            }
                            className="h-9"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </>
          )}

          {manualError && <p className="text-sm text-red-500">{manualError}</p>}

          <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen}>
            <CollapsibleTrigger className="text-muted-foreground hover:text-foreground flex items-center gap-1.5 text-sm">
              <ChevronDown
                className={cn(
                  'h-4 w-4 transition-transform',
                  advancedOpen && 'rotate-180'
                )}
              />
              Advanced
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-3 space-y-4">
              <CustomMetricsField
                rows={customMetrics}
                onChange={setCustomMetrics}
              />
            </CollapsibleContent>
          </Collapsible>
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes" className="text-sm font-normal">
            Notes <span className="text-muted-foreground">(optional)</span>
          </Label>
          <Textarea
            id="notes"
            placeholder="Anything worth noting about this run — what changed, what you observed, follow-ups…"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="h-20"
          />
        </div>

        <ScreenshotUploader files={screenshots} onChange={setScreenshots} />
      </div>
    </BetterDialogContent>
  )
}
