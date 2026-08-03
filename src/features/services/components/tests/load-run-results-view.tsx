'use client'

import { GT } from '@/api'
import { BetterDialogProvider } from '@/components/better-dialog'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { MetricTrendChart } from '@/features/ml-studio/components/metric-chart'
import { useAssetUrls } from '@/features/uploads/api/uploads'
import { cn } from '@/lib/utils'
import { useCurrentOrganization } from '@/store/auth-store'
import { useApolloClient, useMutation, useQuery } from '@apollo/client'
import { format } from 'date-fns'
import { ArrowLeft, FileText, Star } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { ACTOR } from '../../api/actor'
import { API_ENDPOINT_SLA_BY_ID } from '../../api/api-endpoints'
import { TEST_PACKS, TEST_RUN, UPDATE_TEST_RUN } from '../../api/tests'
import { LoadRunReportDialog } from './load-run-report-dialog'
import { runStatusBadgeClass, SlaCell } from './load-run-shared'

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${Math.round(seconds)}s`
  const m = Math.floor(seconds / 60)
  const s = Math.round(seconds % 60)
  return s > 0 ? `${m}m ${s}s` : `${m}m`
}

const OVERALL_STATUS_OPTIONS = [
  { value: 'passed', label: 'Passed' },
  { value: 'partial', label: 'Partial' },
  { value: 'failed', label: 'Failed' },
] as const

function StatusSelect({
  value,
  onChange,
  disabled,
}: {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
}) {
  const normalized = value.toLowerCase()
  return (
    <Select value={normalized || undefined} onValueChange={onChange}>
      <SelectTrigger
        size="sm"
        disabled={disabled}
        className={cn(
          'h-auto w-fit gap-1 rounded-md border px-2 py-0.5 text-xs font-medium shadow-none',
          value
            ? runStatusBadgeClass(value)
            : 'border-border text-muted-foreground bg-transparent'
        )}
      >
        <SelectValue placeholder="Set status">
          {value ? value.toUpperCase() : undefined}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {OVERALL_STATUS_OPTIONS.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-muted-foreground text-[11px] font-semibold tracking-wider uppercase">
      {children}
    </p>
  )
}

function StatCard({
  label,
  value,
  hint,
  delta,
}: {
  label: string
  value: string
  hint?: string
  delta?: { deltaPct: number; lowerIsBetter: boolean }
}) {
  return (
    <div className="border-border rounded-xl border bg-[#141925] px-4 py-4">
      <p className="text-muted-foreground mb-2 text-[10px] font-semibold tracking-wider uppercase">
        {label}
      </p>
      <p className="text-foreground text-2xl font-bold tabular-nums">{value}</p>
      {delta ? (
        <div className="mt-1">
          <DeltaBadge {...delta} />
        </div>
      ) : (
        hint && <p className="text-muted-foreground mt-1 text-[11px]">{hint}</p>
      )}
    </div>
  )
}

function DeltaBadge({
  deltaPct,
  lowerIsBetter,
}: {
  deltaPct: number
  lowerIsBetter: boolean
}) {
  const isFlat = Math.abs(deltaPct) < 0.5
  const isImprovement = isFlat
    ? true
    : lowerIsBetter
      ? deltaPct < 0
      : deltaPct > 0

  return (
    <span
      className={
        isFlat
          ? 'text-muted-foreground text-xs'
          : isImprovement
            ? 'text-xs text-green-400'
            : 'text-xs text-red-400'
      }
    >
      {isFlat ? '±0%' : `${deltaPct > 0 ? '+' : ''}${deltaPct.toFixed(1)}%`}
      {' vs baseline'}
    </span>
  )
}

function evaluateThreshold(threshold: GT.LoadTestThreshold, actual: number) {
  switch (threshold.comparator) {
    case '<':
      return actual < threshold.value
    case '<=':
      return actual <= threshold.value
    case '>':
      return actual > threshold.value
    case '>=':
      return actual >= threshold.value
    default:
      return true
  }
}

/**
 * Fetches SLA thresholds for a set of API endpoint ids and keys them by id.
 * apiEndpointById is a single-id query, so this fans out one apollo client
 * call per id (cache-first, so repeat views of the same run are free).
 */
function useEndpointSlaMap(
  orgId: string | undefined,
  apiEndpointIds: string[]
): Record<string, GT.LoadTestThreshold[]> {
  const client = useApolloClient()
  const [map, setMap] = useState<Record<string, GT.LoadTestThreshold[]>>({})
  const key = apiEndpointIds.slice().sort().join(',')

  useEffect(() => {
    if (!orgId || apiEndpointIds.length === 0) {
      setMap({})
      return
    }
    let cancelled = false
    void Promise.all(
      apiEndpointIds.map((id) =>
        client
          .query({
            query: API_ENDPOINT_SLA_BY_ID,
            variables: { orgId, id },
            fetchPolicy: 'cache-first',
          })
          .then(
            (res) =>
              [id, res.data?.apiEndpointById?.sla?.thresholds ?? []] as const
          )
          .catch(() => [id, []] as const)
      )
    ).then((entries) => {
      if (cancelled) return
      setMap(
        Object.fromEntries(
          entries.map(([id, thresholds]) => [
            id,
            thresholds.filter((t): t is GT.LoadTestThreshold => !!t),
          ])
        )
      )
    })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orgId, key])

  return map
}

function evaluateEndpointRow(
  thresholds: GT.LoadTestThreshold[],
  row: { errorRate: number; p95LatencyMs: number }
): boolean | null {
  if (thresholds.length === 0) return null
  const actuals: Record<string, number> = {
    errorRate: row.errorRate,
    p95LatencyMs: row.p95LatencyMs,
  }
  return thresholds.every((t) => {
    const actual = actuals[t.metric]
    return typeof actual === 'number' ? evaluateThreshold(t, actual) : true
  })
}

type LoadRunResultsViewProps = {
  testRun: NonNullable<GT.TestRunQuery['testRun']>
  serviceId: string
  onPinBaseline: (testPackId: string, testRunId: string) => Promise<void>
}

export function LoadRunResultsView({
  testRun,
  serviceId,
  onPinBaseline,
}: LoadRunResultsViewProps) {
  const navigate = useNavigate()
  const orgId = useCurrentOrganization().id
  const testRunId = testRun.testRunId ?? ''
  const testPackId = testRun.testPackId ?? ''
  const metrics = testRun.loadMetrics

  const { data: packsData } = useQuery(TEST_PACKS, {
    fetchPolicy: 'cache-first',
    variables: { orgId: orgId!, serviceId },
    skip: !orgId || !serviceId,
  })
  const pack = packsData?.testPacks?.find((p) => p?.testPackId === testPackId)
  const baselineRunId = pack?.baselineRunId ?? null
  const isBaseline = !!baselineRunId && baselineRunId === testRunId

  const { data: baselineRunData } = useQuery(TEST_RUN, {
    fetchPolicy: 'cache-first',
    variables: { orgId: orgId!, serviceId, id: baselineRunId ?? '' },
    skip: !orgId || !serviceId || !baselineRunId || baselineRunId === testRunId,
  })
  const baselineMetrics =
    baselineRunId && baselineRunId !== testRunId
      ? baselineRunData?.testRun?.loadMetrics
      : null

  const triggeredById = testRun.executedBy ?? testRun.startedBy ?? undefined
  const { data: triggeredByData } = useQuery(ACTOR, {
    variables: { orgId: orgId!, id: triggeredById! },
    skip: !orgId || !triggeredById,
    fetchPolicy: 'cache-first',
  })
  const triggeredBy =
    triggeredByData?.actor?.name?.trim() || triggeredById || '—'
  const triggeredByAvatar = triggeredByData?.actor?.avatarUrl || ''

  const runIdShort = testRunId.slice(-8) || '—'

  const screenshotAssetIds = testRun.loadMetrics?.screenshotUrls ?? []
  const screenshotUrlMap = useAssetUrls(orgId, screenshotAssetIds)

  const endpointIds = [
    ...new Set(
      (metrics?.perEndpoint ?? [])
        .map((row) => row.apiEndpointId)
        .filter((id): id is string => !!id)
    ),
  ]
  const slaMap = useEndpointSlaMap(orgId, endpointIds)

  const [isReportOpen, setIsReportOpen] = useState(false)
  const [updateTestRunStatus, { loading: isUpdatingStatus }] =
    useMutation(UPDATE_TEST_RUN)

  async function handlePinBaseline() {
    if (!testPackId || !testRunId) return
    await onPinBaseline(testPackId, testRunId)
  }

  async function handleStatusChange(overallStatus: string) {
    if (!orgId || !testRunId) return
    try {
      // Only ever send overallStatus here — sending status/completedAt
      // triggers a backend "completion" path that recomputes overallStatus
      // from test-case results, which load runs don't have, silently
      // discarding whatever value we set.
      await updateTestRunStatus({
        variables: {
          orgId,
          serviceId,
          id: testRunId,
          input: { overallStatus },
        },
        refetchQueries: [
          {
            query: TEST_RUN,
            variables: { orgId, serviceId, id: testRunId },
          },
        ],
        awaitRefetchQueries: true,
      })
      toast.success('Status updated')
    } catch (error) {
      toast.error('Failed to update status')
      console.error(error)
    }
  }

  if (!metrics) {
    return (
      <div className="w-full space-y-4 px-6 pt-4 pb-6">
        <div className="flex justify-end">
          <BackButton
            serviceId={serviceId}
            testPackId={testPackId}
            navigate={navigate}
          />
        </div>
        <div className="border-border flex flex-col items-center justify-center gap-2 rounded-xl border bg-[#141925] px-5 py-16 text-center">
          <p className="text-foreground text-sm font-semibold">
            No load metrics found for this run
          </p>
        </div>
      </div>
    )
  }

  const latencyChartData = (metrics.timeSeries ?? []).map((point) => ({
    label: `${point.tSec}s`,
    p95LatencyMs: point.p95LatencyMs,
  }))
  const throughputChartData = (metrics.timeSeries ?? []).map((point) => ({
    label: `${point.tSec}s`,
    rps: point.rps,
    errorRate: point.errorRate,
  }))
  const perEndpoint = metrics.perEndpoint ?? []
  const customMetrics = metrics.customMetrics ?? []

  const endpointVerdicts = perEndpoint.map((row) =>
    row.apiEndpointId
      ? evaluateEndpointRow(slaMap[row.apiEndpointId] ?? [], row)
      : null
  )
  const evaluatedVerdicts = endpointVerdicts.filter(
    (v): v is boolean => v !== null
  )
  const slaRollup =
    evaluatedVerdicts.length > 0
      ? `${evaluatedVerdicts.filter(Boolean).length}/${evaluatedVerdicts.length} endpoints passing`
      : null

  // Distinguishes "not matched to a catalog endpoint" from "matched, but
  // that endpoint has no SLA thresholds set" — both previously rendered as
  // an identical blank dash, making it impossible to tell whether an
  // endpoint was already a configured target.
  const endpointSlaStates = perEndpoint.map((row, index) => {
    if (!row.apiEndpointId) return 'not-linked' as const
    if ((slaMap[row.apiEndpointId] ?? []).length === 0) return 'no-sla' as const
    return endpointVerdicts[index] ? ('pass' as const) : ('fail' as const)
  })

  function deltaVs(
    current: number,
    baseline: number | undefined,
    lowerIsBetter: boolean
  ) {
    if (!baselineMetrics || baseline === undefined) return undefined
    return {
      deltaPct: ((current - baseline) / (baseline || 0.0001)) * 100,
      lowerIsBetter,
    }
  }

  return (
    <div className="w-full space-y-4 px-6 pt-4 pb-6">
      <div className="border-border flex flex-wrap items-center justify-between gap-4 rounded-xl border bg-[#141925] px-5 py-3.5">
        <div className="flex flex-wrap gap-8">
          <MetaItem label="RUN ID" value={runIdShort} />
          <MetaItem
            label="STATUS"
            node={
              <StatusSelect
                value={testRun.overallStatus ?? ''}
                onChange={handleStatusChange}
                disabled={isUpdatingStatus}
              />
            }
          />
          <MetaItem
            label="SLA"
            node={
              slaRollup ? (
                <Badge
                  variant="outline"
                  className={
                    evaluatedVerdicts.every(Boolean)
                      ? 'border-green-500/50 bg-green-500/10 text-green-300'
                      : 'border-red-500/50 bg-red-500/10 text-red-300'
                  }
                >
                  {slaRollup}
                </Badge>
              ) : (
                <Badge
                  variant="outline"
                  className="border-border text-muted-foreground bg-transparent"
                >
                  {perEndpoint.length === 0
                    ? 'Not attributed — not evaluated'
                    : 'No thresholds set — not evaluated'}
                </Badge>
              )
            }
          />
          <MetaItem label="ENVIRONMENT" value={testRun.environment ?? '—'} />
          <MetaItem label="RELEASE" value={testRun.releaseLabel ?? '—'} />
          <MetaItem
            label="IMPORTED"
            value={
              testRun.executedAt
                ? format(new Date(testRun.executedAt), 'MMM d, yyyy')
                : '—'
            }
          />
          <MetaItem
            label="TRIGGERED BY"
            node={
              <div className="text-foreground flex items-center gap-2 text-sm font-medium">
                <Avatar className="size-5">
                  <AvatarImage
                    src={triggeredByAvatar}
                    className="object-cover"
                  />
                  <AvatarFallback className="text-[10px]">
                    {triggeredBy.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span>{triggeredBy}</span>
              </div>
            }
          />
        </div>
        <div className="flex items-center gap-2">
          <Button
            preset="outline"
            size="sm"
            onClick={() => setIsReportOpen(true)}
          >
            <FileText className="mr-1 h-3.5 w-3.5" />
            View Report
          </Button>
          <Button
            preset={isBaseline ? 'primary' : 'outline'}
            size="sm"
            onClick={handlePinBaseline}
            disabled={isBaseline}
          >
            <Star className="mr-1 h-3.5 w-3.5" />
            {isBaseline ? 'Baseline' : 'Pin as Baseline'}
          </Button>
          <BackButton
            serviceId={serviceId}
            testPackId={testPackId}
            navigate={navigate}
          />
        </div>
      </div>

      <div className="space-y-2">
        <SectionLabel>Throughput &amp; errors</SectionLabel>
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Requests/sec"
            value={metrics.requestsPerSec.toFixed(1)}
            delta={deltaVs(
              metrics.requestsPerSec,
              baselineMetrics?.requestsPerSec,
              false
            )}
          />
          <StatCard
            label="Total Requests"
            value={String(metrics.totalRequests)}
          />
          <StatCard
            label="Duration"
            value={formatDuration(metrics.durationSec)}
          />
          <StatCard
            label="Error Rate"
            value={`${(metrics.errorRate * 100).toFixed(2)}%`}
            delta={deltaVs(metrics.errorRate, baselineMetrics?.errorRate, true)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <SectionLabel>Latency percentiles</SectionLabel>
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="P50"
            value={`${Math.round(metrics.p50LatencyMs)}ms`}
          />
          <StatCard
            label="P90"
            value={`${Math.round(metrics.p90LatencyMs)}ms`}
          />
          <StatCard
            label="P95"
            value={`${Math.round(metrics.p95LatencyMs)}ms`}
            delta={deltaVs(
              metrics.p95LatencyMs,
              baselineMetrics?.p95LatencyMs,
              true
            )}
          />
          <StatCard
            label="P99"
            value={`${Math.round(metrics.p99LatencyMs)}ms`}
            delta={deltaVs(
              metrics.p99LatencyMs,
              baselineMetrics?.p99LatencyMs,
              true
            )}
          />
        </div>
      </div>

      {latencyChartData.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="border-border rounded-xl border bg-[#141925] p-4">
            <h4 className="mb-3 text-sm font-semibold">
              P95 latency over time
            </h4>
            <MetricTrendChart
              data={latencyChartData}
              metricKeys={['p95LatencyMs']}
              className="h-[220px] w-full"
            />
          </div>
          <div className="border-border rounded-xl border bg-[#141925] p-4">
            <h4 className="mb-3 text-sm font-semibold">
              Requests/sec &amp; error rate over time
            </h4>
            <MetricTrendChart
              data={throughputChartData}
              metricKeys={['rps', 'errorRate']}
              className="h-[220px] w-full"
            />
          </div>
        </div>
      ) : (
        <div className="border-border text-muted-foreground rounded-xl border bg-[#141925] px-5 py-6 text-center text-sm">
          No time-series data in this import — showing summary metrics only.
        </div>
      )}

      {perEndpoint.length > 0 && (
        <div className="border-border rounded-xl border bg-[#141925]">
          <div className="border-border border-b px-4 py-3">
            <h4 className="text-sm font-semibold">Per-endpoint breakdown</h4>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-4">Endpoint</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead className="text-center">Requests</TableHead>
                  <TableHead className="text-center">Req/s</TableHead>
                  <TableHead className="text-center">Error Rate</TableHead>
                  <TableHead className="text-center">Avg</TableHead>
                  <TableHead className="text-center">P50</TableHead>
                  <TableHead className="text-center">P90</TableHead>
                  <TableHead className="text-center">P95</TableHead>
                  <TableHead className="text-center">P99</TableHead>
                  <TableHead className="text-center">SLA</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {perEndpoint.map((row, index) => (
                  <TableRow key={`${row.endpoint}-${index}`}>
                    <TableCell className="pl-4 font-mono text-xs">
                      {row.endpoint}
                    </TableCell>
                    <TableCell>{row.method}</TableCell>
                    <TableCell className="text-center">
                      {row.requestCount}
                    </TableCell>
                    <TableCell className="text-center">
                      {row.requestsPerSec.toFixed(1)}
                    </TableCell>
                    <TableCell className="text-center">
                      {(row.errorRate * 100).toFixed(2)}%
                    </TableCell>
                    <TableCell className="text-center">
                      {Math.round(row.avgLatencyMs)}ms
                    </TableCell>
                    <TableCell className="text-center">
                      {Math.round(row.p50LatencyMs)}ms
                    </TableCell>
                    <TableCell className="text-center">
                      {Math.round(row.p90LatencyMs)}ms
                    </TableCell>
                    <TableCell className="text-center">
                      {Math.round(row.p95LatencyMs)}ms
                    </TableCell>
                    <TableCell className="text-center">
                      {Math.round(row.p99LatencyMs)}ms
                    </TableCell>
                    <TableCell className="text-center">
                      <SlaCell state={endpointSlaStates[index]} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {customMetrics.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-semibold">Custom Metrics</h4>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {customMetrics.map((metric, index) => {
              const points = metric.timeSeries ?? []
              if (points.length === 0) {
                return (
                  <StatCard
                    key={`${metric.name}-${index}`}
                    label={metric.name}
                    value={
                      typeof metric.value === 'number'
                        ? `${metric.value}${metric.unit ? ` ${metric.unit}` : ''}`
                        : '—'
                    }
                  />
                )
              }
              return (
                <div
                  key={`${metric.name}-${index}`}
                  className="border-border rounded-xl border bg-[#141925] p-4"
                >
                  <h5 className="mb-3 text-sm font-semibold">
                    {metric.name}
                    {metric.unit ? ` (${metric.unit})` : ''}
                  </h5>
                  <MetricTrendChart
                    data={points.map((point) => ({
                      label: `${point.t}s`,
                      value: point.v,
                    }))}
                    metricKeys={['value']}
                    className="h-[220px] w-full"
                  />
                </div>
              )
            })}
          </div>
        </div>
      )}

      {metrics.notes && (
        <div className="border-border rounded-xl border bg-[#141925] px-5 py-4">
          <h4 className="text-sm font-semibold">Notes</h4>
          <p className="text-muted-foreground mt-2 text-sm whitespace-pre-wrap">
            {metrics.notes}
          </p>
        </div>
      )}

      {screenshotAssetIds.length > 0 && (
        <div className="border-border rounded-xl border bg-[#141925] px-5 py-4">
          <h4 className="mb-3 text-sm font-semibold">Screenshots</h4>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {screenshotAssetIds.map((assetId) => {
              const url = screenshotUrlMap[assetId]
              return url ? (
                <a key={assetId} href={url} target="_blank" rel="noreferrer">
                  <img
                    src={url}
                    alt="Load test screenshot"
                    className="h-28 w-full rounded-[12px] border border-[#2A3242] object-cover"
                  />
                </a>
              ) : null
            })}
          </div>
        </div>
      )}

      <BetterDialogProvider
        open={isReportOpen}
        onOpenChange={setIsReportOpen}
        className="h-[92vh] max-w-none sm:[--width:1100px]"
      >
        <LoadRunReportDialog
          testRun={testRun}
          perEndpoint={perEndpoint}
          endpointSlaStates={endpointSlaStates}
          slaRollup={slaRollup}
        />
      </BetterDialogProvider>
    </div>
  )
}

function MetaItem({
  label,
  value,
  node,
}: {
  label: string
  value?: string
  node?: React.ReactNode
}) {
  return (
    <div>
      <p className="text-muted-foreground mb-0.5 text-[10px] font-semibold tracking-wider uppercase">
        {label}
      </p>
      {node ?? <p className="text-foreground font-mono text-sm">{value}</p>}
    </div>
  )
}

function BackButton({
  serviceId,
  testPackId,
  navigate,
}: {
  serviceId: string
  testPackId: string
  navigate: ReturnType<typeof useNavigate>
}) {
  return (
    <Button
      preset="outline"
      size="sm"
      onClick={() =>
        navigate(`/services/${serviceId}/tests?packId=${testPackId}&tab=runs`)
      }
    >
      <ArrowLeft className="mr-1 h-4 w-4" />
      Back to Runs
    </Button>
  )
}
