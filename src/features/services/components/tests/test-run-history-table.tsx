'use client'

import { clientV2 } from '@/api-v2/client'
import { FunctionalPagination } from '@/components/common/functional-pagination'
import { SectionLoader } from '@/components/section-loader'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
import { useCurrentOrganization } from '@/store/auth-store'
import { useQuery } from '@apollo/client'
import { arrayNonNullable } from 'daily-code'
import { format, isValid } from 'date-fns'
import { Filter, X } from 'lucide-react'

import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { TEST_RUNS_SUMMARY_V2 } from '../../api/tests-v2'
import { useServiceContext } from '../../contexts/service-context'

type TestRunSummary = {
  testRunId?: string | null
  testPackId?: string | null
  serviceId?: string | null
  environment?: string | null
  releaseLabel?: string | null
  startedAt?: string | null
  completedAt?: string | null
  status?: string | null
  startedBy?: string | null
  executedBy?: string | null
  executedByProfileImgUrl?: string | null
  executedAt?: string | null
  overallStatus?: string | null
  passedCount?: number | null
  failedCount?: number | null
  skippedCount?: number | null
  blockedCount?: number | null
}

type TestRunHistoryTableProps = {
  testPackId: string | null
}

const STATUS_OPTIONS = ['running', 'completed', 'aborted', 'cancelled'] as const

export function TestRunHistoryTable({ testPackId }: TestRunHistoryTableProps) {
  const navigate = useNavigate()
  const { serviceId } = useServiceContext()
  const orgId = useCurrentOrganization().id
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [executedBy, setExecutedBy] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const { data: runsData, loading: runsLoading } = useQuery(
    TEST_RUNS_SUMMARY_V2,
    {
      client: clientV2,
      fetchPolicy: 'cache-first',
      variables: {
        orgId: orgId!,
        serviceId,
        testPackId: testPackId!,
      },
      skip: !orgId || !serviceId || !testPackId,
    }
  )

  const testRuns = useMemo(
    () => arrayNonNullable(runsData?.testRunsSummary),
    [runsData?.testRunsSummary]
  )

  const filteredAndSortedRuns = useMemo(() => {
    let list = testRuns
    if (statusFilter && statusFilter !== 'all') {
      const filterValue = statusFilter.toLowerCase()
      list = list.filter((run) => {
        const s = run.status?.toLowerCase()
        return s != null && s === filterValue
      })
    }
    if (executedBy.trim()) {
      const q = executedBy.trim().toLowerCase()
      list = list.filter((run) =>
        (run.executedBy?.toLowerCase() ?? '').includes(q)
      )
    }
    return [...list].sort((a, b) => {
      const dateA = a.executedAt ? new Date(a.executedAt).getTime() : 0
      const dateB = b.executedAt ? new Date(b.executedAt).getTime() : 0
      return dateB - dateA
    })
  }, [testRuns, statusFilter, executedBy])

  const totalPages = Math.max(
    1,
    Math.ceil(filteredAndSortedRuns.length / pageSize)
  )
  const paginatedRuns = useMemo(() => {
    const start = (page - 1) * pageSize
    return filteredAndSortedRuns.slice(start, start + pageSize)
  }, [filteredAndSortedRuns, page, pageSize])

  useEffect(() => {
    setPage((p) => Math.min(p, totalPages))
  }, [totalPages])

  useEffect(() => {
    setPage(1)
  }, [statusFilter, executedBy])

  const hasActiveFilters = statusFilter !== 'all' || !!executedBy.trim()
  function clearFilters() {
    setStatusFilter('all')
    setExecutedBy('')
  }

  if (!testPackId) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
        <p className="text-muted-foreground text-sm">
          Select a test pack to view run history.
        </p>
      </div>
    )
  }

  function handleRowClick(testRun: TestRunSummary) {
    if (!testRun.testRunId || !serviceId) return
    const isRunning = (testRun.status ?? '').toLowerCase() === 'running'
    if (isRunning) {
      navigate(`/services/${serviceId}/tests/run/${testRun.testRunId}`)
    } else {
      navigate(`/services/${serviceId}/tests/runs/${testRun.testRunId}`)
    }
  }

  if (runsLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <SectionLoader label="Loading test runs..." />
      </div>
    )
  }

  return (
    <div className="border-border rounded-lg border bg-white">
      <div className="border-border bg-muted/30 flex flex-wrap items-center justify-between gap-3 border-b px-3 py-2">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowFilters((s) => !s)}
            className="gap-1.5"
          >
            <Filter className="size-4" />
            Filters
            {hasActiveFilters && (
              <span className="bg-primary text-primary-foreground rounded-full px-1.5 text-xs">
                {(statusFilter ? 1 : 0) + (executedBy.trim() ? 1 : 0)}
              </span>
            )}
          </Button>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="gap-1"
            >
              <X className="size-4" />
              Clear
            </Button>
          )}
        </div>
        {showFilters && (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-muted-foreground shrink-0 text-xs font-medium">
                Status
              </label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-8 w-[120px]">
                  <SelectValue placeholder="Any" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any</SelectItem>
                  {STATUS_OPTIONS.map((opt) => (
                    <SelectItem key={opt} value={opt}>
                      {opt.charAt(0).toUpperCase() + opt.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-muted-foreground shrink-0 text-xs font-medium">
                Executor
              </label>
              <Input
                placeholder="Search by name"
                value={executedBy}
                onChange={(e) => setExecutedBy(e.target.value)}
                className="h-8 w-[140px]"
              />
            </div>
          </div>
        )}
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="pl-4">Run Date</TableHead>
            <TableHead>Environment</TableHead>
            <TableHead>Release</TableHead>
            <TableHead className="text-center">Passed</TableHead>
            <TableHead className="text-center">Failed</TableHead>
            <TableHead className="text-center">Skipped</TableHead>
            <TableHead className="text-center">Blocked</TableHead>
            <TableHead>Executed By</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredAndSortedRuns.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={9}
                className="text-muted-foreground py-12 text-center"
              >
                {testRuns.length === 0 ? (
                  <>
                    <p className="text-foreground font-semibold">
                      No test runs yet
                    </p>
                    <p className="mt-1 text-sm">
                      Test runs will appear here once you execute a test pack.
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-foreground font-semibold">
                      No runs match your filters
                    </p>
                    <p className="mt-1 text-sm">
                      Try clearing or adjusting your filters.
                    </p>
                  </>
                )}
              </TableCell>
            </TableRow>
          ) : (
            paginatedRuns.map((run, index) => (
              <TestRunRow
                key={run.testRunId ?? `run-${index}`}
                summary={run}
                onClick={() => handleRowClick(run)}
              />
            ))
          )}
        </TableBody>
      </Table>
      {filteredAndSortedRuns.length > 0 && (
        <div className="border-border flex flex-wrap items-center justify-between gap-3 border-t px-3 py-2">
          <p className="text-muted-foreground text-sm">
            Showing {(page - 1) * pageSize + 1}–
            {Math.min(page * pageSize, filteredAndSortedRuns.length)} of{' '}
            {filteredAndSortedRuns.length} runs
          </p>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground text-xs">Per page</span>
              <Select
                value={String(pageSize)}
                onValueChange={(v) => {
                  setPageSize(Number(v))
                  setPage(1)
                }}
              >
                <SelectTrigger className="h-8 w-[70px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[10, 20, 50].map((n) => (
                    <SelectItem key={n} value={String(n)}>
                      {n}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <FunctionalPagination
              currentPage={page}
              totalPages={totalPages}
              setCurrentPage={setPage}
            />
          </div>
        </div>
      )}
    </div>
  )
}

type TestRunRowProps = {
  summary: TestRunSummary
  onClick: () => void
}

function TestRunRow({ summary, onClick }: TestRunRowProps) {
  const passed = summary.passedCount ?? 0
  const failed = summary.failedCount ?? 0
  const skipped = summary.skippedCount ?? 0
  const blocked = summary.blockedCount ?? 0
  const isDisabled = !summary.testRunId

  return (
    <TableRow
      onClick={isDisabled ? undefined : onClick}
      className={
        isDisabled
          ? 'text-muted-foreground h-12 cursor-not-allowed opacity-60'
          : 'hover:bg-accent/50 h-12 cursor-pointer'
      }
    >
      <TableCell className="pl-4">
        {summary.executedAt
          ? (() => {
              const d = new Date(summary.executedAt)
              return isValid(d) ? format(d, 'MMM d, yyyy h:mm a') : '—'
            })()
          : '—'}
      </TableCell>
      <TableCell>{summary.environment || '—'}</TableCell>
      <TableCell>{summary.releaseLabel || '—'}</TableCell>
      <TableCell className="text-center">
        <span className="text-green-600">{passed}</span>
      </TableCell>
      <TableCell className="text-center">
        <span className="text-destructive">{failed}</span>
      </TableCell>
      <TableCell className="text-center">
        <span className="text-muted-foreground">{skipped}</span>
      </TableCell>
      <TableCell className="text-center">
        <span className="text-amber-600">{blocked}</span>
      </TableCell>
      <TableCell>
        {summary.executedBy ? (
          <div className="flex items-center gap-2">
            <Avatar className="size-5">
              <AvatarImage
                src={summary.executedByProfileImgUrl || ''}
                className="object-cover"
              />
              <AvatarFallback className="text-xs">
                {summary.executedBy.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span>{summary.executedBy}</span>
          </div>
        ) : (
          '—'
        )}
      </TableCell>
      <TableCell>
        {(summary.status || summary.overallStatus) &&
          (() => {
            const runStatus = (
              summary.status ??
              summary.overallStatus ??
              ''
            ).toLowerCase()
            const isCompleted =
              runStatus === 'completed' || !!summary.completedAt
            const overall = (summary.overallStatus ?? '').toLowerCase()

            if (runStatus === 'running') {
              return (
                <Badge
                  variant="outline"
                  className="border-blue-500/50 bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-300"
                >
                  RUNNING
                </Badge>
              )
            }
            if (isCompleted && overall) {
              const label = (summary.overallStatus ?? '').toUpperCase()
              if (overall === 'passed') {
                return (
                  <Badge
                    variant="outline"
                    className="border-green-500/50 bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-300"
                  >
                    {label}
                  </Badge>
                )
              }
              if (overall === 'failed') {
                return <Badge variant="destructive">{label}</Badge>
              }
              return (
                <Badge
                  variant="outline"
                  className="border-amber-500/50 bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-300"
                >
                  {label}
                </Badge>
              )
            }
            if (runStatus === 'aborted' || runStatus === 'cancelled') {
              return (
                <Badge
                  variant="outline"
                  className="border-amber-500/50 bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-300"
                >
                  ABORTED
                </Badge>
              )
            }
            return (
              <Badge variant="secondary">
                {(summary.status ?? summary.overallStatus ?? '').toUpperCase()}
              </Badge>
            )
          })()}
      </TableCell>
    </TableRow>
  )
}
