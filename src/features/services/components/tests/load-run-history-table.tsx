'use client'

import { SectionLoader } from '@/components/section-loader'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useCurrentOrganization } from '@/store/auth-store'
import { useQuery } from '@apollo/client'
import { format, isValid } from 'date-fns'
import { Star } from 'lucide-react'
import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { TEST_RUNS } from '../../api/tests'
import { useServiceContext } from '../../contexts/service-context'
import { RunAttributionCell, runStatusBadgeClass } from './load-run-shared'

function formatDurationShort(seconds: number): string {
  if (seconds < 60) return `${Math.round(seconds)}s`
  const m = Math.floor(seconds / 60)
  const s = Math.round(seconds % 60)
  return s > 0 ? `${m}m ${s}s` : `${m}m`
}

type LoadRunHistoryTableProps = {
  testPackId: string
  baselineRunId?: string | null
}

export function LoadRunHistoryTable({
  testPackId,
  baselineRunId,
}: LoadRunHistoryTableProps) {
  const navigate = useNavigate()
  const { serviceId } = useServiceContext()
  const orgId = useCurrentOrganization().id

  const { data, loading } = useQuery(TEST_RUNS, {
    fetchPolicy: 'cache-first',
    variables: { orgId: orgId!, serviceId, testPackId },
    skip: !orgId || !serviceId || !testPackId,
  })

  const runs = useMemo(() => {
    const list = data?.testRuns ?? []
    return [...list]
      .filter((r) => !!r)
      .sort((a, b) => {
        const aTime = a?.executedAt ? new Date(a.executedAt).getTime() : 0
        const bTime = b?.executedAt ? new Date(b.executedAt).getTime() : 0
        return bTime - aTime
      })
  }, [data?.testRuns])

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <SectionLoader label="Loading test runs..." />
      </div>
    )
  }

  if (runs.length === 0) {
    return (
      <div className="border-border flex h-full flex-col items-center justify-center gap-2 rounded-lg border bg-[#141925] px-6 py-16 text-center">
        <p className="text-foreground text-sm font-semibold">
          No load test runs yet
        </p>
        <p className="text-muted-foreground max-w-sm text-sm">
          Import a results file or enter metrics manually to see the results
          dashboard.
        </p>
      </div>
    )
  }

  return (
    <div className="border-border rounded-lg border bg-[#141925]">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="pl-4">Run Date</TableHead>
            <TableHead>Environment</TableHead>
            <TableHead>Release</TableHead>
            <TableHead className="text-center">RPS</TableHead>
            <TableHead className="text-center">P95</TableHead>
            <TableHead className="text-center">Error Rate</TableHead>
            <TableHead className="text-center">Duration</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Endpoints</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {runs.map((run) => {
            if (!run?.testRunId) return null
            const metrics = run.loadMetrics
            const isAttributed = (metrics?.perEndpoint ?? []).some(
              (row) => !!row?.apiEndpointId
            )
            return (
              <TableRow
                key={run.testRunId}
                className="hover:bg-accent/50 h-12 cursor-pointer"
                onClick={() =>
                  navigate(`/services/${serviceId}/tests/runs/${run.testRunId}`)
                }
              >
                <TableCell className="pl-4">
                  <div className="flex items-center gap-1.5">
                    {run.testRunId === baselineRunId && (
                      <Star className="h-3.5 w-3.5 shrink-0 fill-amber-400 text-amber-400" />
                    )}
                    {run.executedAt
                      ? (() => {
                          const d = new Date(run.executedAt)
                          return isValid(d)
                            ? format(d, 'MMM d, yyyy h:mm a')
                            : '—'
                        })()
                      : '—'}
                  </div>
                </TableCell>
                <TableCell>{run.environment || '—'}</TableCell>
                <TableCell>{run.releaseLabel || '—'}</TableCell>
                <TableCell className="text-center font-mono">
                  {metrics ? metrics.requestsPerSec.toFixed(1) : '—'}
                </TableCell>
                <TableCell className="text-center font-mono">
                  {metrics ? `${Math.round(metrics.p95LatencyMs)}ms` : '—'}
                </TableCell>
                <TableCell className="text-center font-mono">
                  {metrics ? (
                    <span
                      className={
                        metrics.errorRate > 0.01
                          ? 'text-destructive'
                          : 'text-green-600'
                      }
                    >
                      {(metrics.errorRate * 100).toFixed(2)}%
                    </span>
                  ) : (
                    '—'
                  )}
                </TableCell>
                <TableCell className="text-center font-mono">
                  {metrics ? formatDurationShort(metrics.durationSec) : '—'}
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={runStatusBadgeClass(
                      run.overallStatus ?? 'imported'
                    )}
                  >
                    {(run.overallStatus ?? 'imported').toUpperCase()}
                  </Badge>
                </TableCell>
                <TableCell>
                  <RunAttributionCell attributed={isAttributed} />
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
