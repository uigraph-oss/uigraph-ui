'use client'

import type { TestCase, TestRunResult } from '@/api/.gql/graphql'
import { BetterDialogProvider } from '@/components/better-dialog'
import { FunctionalPagination } from '@/components/common/functional-pagination'
import { CrossButton } from '@/components/cross-button'
import { DynamicScrollArea } from '@/components/dynamic-scroll-area'
import { SectionLoader } from '@/components/section-loader'
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
import { cn } from '@/lib/utils'
import { useCurrentOrganization } from '@/store/auth-store'
import { useQuery } from '@apollo/client'
import { arrayNonNullable } from 'daily-code'
import { AnimatePresence, motion } from 'framer-motion'
import { Play } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { TEST_CASES, TEST_RUN, TEST_RUN_RESULTS } from '../../api/tests'
import { useServiceContext } from '../../contexts/service-context'
import { normalizeTestCaseIdForMatch } from '../../utils/normalize-test-case-id'
import type { StatusFilter } from './run-details-header'
import { RunDetailsHeader } from './run-details-header'
import {
  RunStepResultExpandedContent,
  RunStepResultTableRowCells,
} from './run-step-result-row'
import { TestRunReportDialog } from './test-run-report-dialog'
import type { TestTypeKey } from './test-type-config'
import {
  getTestTypeConfig,
  normalizeTestTypeKey,
  TYPE_FILTER_OPTIONS,
} from './test-type-config'

type RunDetailsViewProps = {
  testRunId: string
  testPackId: string | null
  serviceId?: string
}

export function RunDetailsView({
  testRunId,
  testPackId,
  serviceId,
}: RunDetailsViewProps) {
  const navigate = useNavigate()
  const orgId = useCurrentOrganization().id
  const { serviceId: contextServiceId } = useServiceContext()
  const resolvedServiceId = serviceId ?? contextServiceId
  const [selectedPanelStep, setSelectedPanelStep] = useState<{
    testCase: TestCase
    result: TestRunResult | null
  } | null>(null)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [stepResultsPage, setStepResultsPage] = useState(1)
  const [stepResultsPageSize, setStepResultsPageSize] = useState(25)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [typeFilter, setTypeFilter] = useState<TestTypeKey>('all')
  const [showReportDialog, setShowReportDialog] = useState(false)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setStepResultsPage(1)
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0
    }
  }, [testRunId])

  useEffect(() => {
    setStepResultsPage(1)
  }, [statusFilter, typeFilter])

  const runVars = {
    orgId: orgId!,
    serviceId: resolvedServiceId,
    id: testRunId,
  }
  const resultsVars = {
    orgId: orgId!,
    serviceId: resolvedServiceId,
    testRunId,
  }
  const casesVars = {
    orgId: orgId!,
    serviceId: resolvedServiceId,
    testPackId: testPackId ?? '',
  }

  const { data: runData, loading: runLoading } = useQuery(TEST_RUN, {
    fetchPolicy: 'cache-first',
    variables: runVars,
    skip: !orgId || !resolvedServiceId || !testRunId,
  })

  const { data: resultsData, loading: resultsLoading } = useQuery(
    TEST_RUN_RESULTS,
    {
      fetchPolicy: 'cache-first',
      variables: resultsVars,
      skip: !orgId || !resolvedServiceId || !testRunId,
    }
  )

  const { data: casesData, loading: casesLoading } = useQuery(TEST_CASES, {
    fetchPolicy: 'cache-first',
    variables: casesVars,
    skip: !orgId || !resolvedServiceId || !testPackId,
  })

  const testRun = runData?.testRun
  const results = useMemo(
    () => arrayNonNullable(resultsData?.testRunResults),
    [resultsData?.testRunResults]
  )
  const testCases = useMemo(
    () => arrayNonNullable(casesData?.testCases),
    [casesData?.testCases]
  )

  const STATUS_PRIORITY: Record<string, number> = {
    failed: 0,
    blocked: 1,
    passed: 2,
    skipped: 3,
  }

  function normalizeResultStatus(
    status: string | null | undefined
  ): 'passed' | 'failed' | 'blocked' | 'skipped' {
    const raw = (status ?? '').trim().toLowerCase()
    if (raw === 'passed' || raw === 'pass') return 'passed'
    if (raw === 'failed' || raw === 'fail') return 'failed'
    if (raw === 'blocked') return 'blocked'
    if (raw === 'skipped' || raw === 'skip') return 'skipped'
    return 'skipped'
  }

  const stepResults = useMemo(() => {
    return testCases
      .map((testCase) => {
        const tcId = testCase.testCaseId ?? ''
        const tcNorm = normalizeTestCaseIdForMatch(tcId)
        const candidates = results.filter(
          (r) =>
            (r.testCaseId ?? '') === tcId ||
            normalizeTestCaseIdForMatch(r.testCaseId) === tcNorm
        )
        const result =
          candidates.length === 0
            ? null
            : candidates.length === 1
              ? candidates[0]
              : candidates.reduce((best, r) => {
                  const s = normalizeResultStatus(r.status)
                  const b = normalizeResultStatus(best.status)
                  return (STATUS_PRIORITY[s] ?? 4) < (STATUS_PRIORITY[b] ?? 4)
                    ? r
                    : best
                })
        return {
          testCase,
          result,
        }
      })
      .sort((a, b) => (a.testCase.order || 0) - (b.testCase.order || 0))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [testCases, results])

  const stats = useMemo(() => {
    let passed = 0
    let failed = 0
    let skipped = 0
    let blocked = 0
    let criticalFailures = 0
    for (const { testCase, result } of stepResults) {
      const status = normalizeResultStatus(result?.status)
      if (status === 'passed') passed++
      else if (status === 'failed') {
        failed++
        if (testCase?.isCritical === true) criticalFailures++
      } else if (status === 'blocked') blocked++
      else skipped++
    }
    return {
      passed,
      failed,
      skipped,
      blocked,
      total: stepResults.length,
      criticalFailures,
    }
  }, [stepResults])

  const filteredStepResults = useMemo(() => {
    let list = stepResults
    if (statusFilter !== 'all') {
      list = list.filter(({ result }) => {
        const status = normalizeResultStatus(result?.status)
        return status === statusFilter
      })
    }
    if (typeFilter !== 'all') {
      list = list.filter(({ testCase }) => {
        const t = normalizeTestTypeKey(testCase.type)
        return t === typeFilter
      })
    }
    return list
  }, [stepResults, statusFilter, typeFilter])

  const displayRunStatus = useMemo(():
    | 'running'
    | 'passed'
    | 'failed'
    | 'issues'
    | 'aborted'
    | 'none' => {
    if (!testRun) return 'none'
    const runStatus = testRun.status?.toLowerCase()
    if (runStatus === 'running') return 'running'
    if (runStatus === 'aborted' || runStatus === 'cancelled') return 'aborted'
    if (stepResults.length === 0) return 'none'
    if (stats.failed > 0) return 'failed'
    if (stats.blocked > 0) return 'issues'
    return 'passed'
  }, [testRun, stepResults.length, stats.failed, stats.blocked])

  const isRunning = testRun?.status?.toLowerCase() === 'running'

  const totalCases = testCases.length
  const totalPages = Math.max(
    1,
    Math.ceil(filteredStepResults.length / stepResultsPageSize)
  )
  const paginatedStepResults = filteredStepResults.slice(
    (stepResultsPage - 1) * stepResultsPageSize,
    stepResultsPage * stepResultsPageSize
  )

  useEffect(() => {
    setStepResultsPage((page) => Math.min(page, totalPages))
  }, [totalPages])

  const typeCountsFromAll = useMemo(() => {
    const counts = new Map<string, number>()
    for (const { testCase } of stepResults) {
      const t = normalizeTestTypeKey(testCase.type)
      counts.set(t, (counts.get(t) ?? 0) + 1)
    }
    return counts
  }, [stepResults])

  const firstFailedId = useMemo(() => {
    const found = stepResults.find(
      ({ result }) => normalizeResultStatus(result?.status) === 'failed'
    )
    return found?.testCase.testCaseId ?? null
  }, [stepResults])

  const isLoading = runLoading || resultsLoading || casesLoading

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center py-12">
        <SectionLoader label="Loading run details..." />
      </div>
    )
  }

  if (!testRun) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 px-6 py-12 text-center">
        <p className="text-foreground text-sm font-semibold">Run not found</p>
      </div>
    )
  }

  return (
    <>
      <div className="px-6 pt-4 pb-4">
        <RunDetailsHeader
          testRun={testRun}
          displayRunStatus={displayRunStatus}
          onReport={() => setShowReportDialog(true)}
          stats={
            stepResults.length > 0
              ? {
                  total: totalCases,
                  passed: stats.passed,
                  failed: stats.failed,
                  blocked: stats.blocked,
                  skipped: stats.skipped,
                  criticalFailures: stats.criticalFailures,
                }
              : null
          }
        />
      </div>

      <div className="flex flex-row">
        <div
          ref={scrollContainerRef}
          className="flex min-h-0 flex-1 flex-col overflow-hidden"
        >
          {stepResults.length > 0 ? (
            <div className="flex w-full flex-col px-6 pb-4">
              <div className="border-border flex flex-col overflow-hidden rounded-lg border bg-[#141925]">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b bg-[#141925] px-4 py-3.5">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                      Type
                    </span>
                    <div className="flex flex-wrap items-center gap-1.5">
                      {TYPE_FILTER_OPTIONS.map((key) => {
                        const count =
                          key === 'all'
                            ? stepResults.length
                            : (typeCountsFromAll.get(key) ?? 0)
                        const isActive = typeFilter === key
                        const config =
                          key === 'all' ? null : getTestTypeConfig(key)
                        const Icon = config?.icon
                        return (
                          <button
                            key={key}
                            type="button"
                            onClick={() => setTypeFilter(key)}
                            className={cn(
                              'inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors',
                              isActive
                                ? 'bg-primary text-background shadow-sm'
                                : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
                            )}
                          >
                            {key !== 'all' && Icon && (
                              <Icon
                                className={cn(
                                  'h-3.5 w-3.5 shrink-0',
                                  isActive
                                    ? 'text-background'
                                    : 'text-muted-foreground'
                                )}
                              />
                            )}
                            <span>
                              {key === 'all' ? 'All' : (config?.label ?? key)}
                            </span>
                            <span className="text-[10px] tabular-nums opacity-80">
                              ({count})
                            </span>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                      Status
                    </span>
                    {[
                      { key: 'all' as const, label: 'All' },
                      { key: 'passed' as const, label: 'Passed' },
                      { key: 'failed' as const, label: 'Failed' },
                      { key: 'blocked' as const, label: 'Blocked' },
                      { key: 'skipped' as const, label: 'Skipped' },
                    ].map(({ key, label }) => {
                      const statusActive =
                        (key === 'all' && statusFilter === 'all') ||
                        statusFilter === key
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() =>
                            setStatusFilter(key === 'all' ? 'all' : key)
                          }
                          className={cn(
                            'rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors',
                            statusActive
                              ? 'bg-primary text-primary-foreground shadow-sm'
                              : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
                          )}
                        >
                          {label}
                        </button>
                      )
                    })}
                  </div>
                </div>

                <Table>
                  <TableHeader className="bg-[#141925]">
                    <TableRow className="border-b hover:bg-transparent">
                      <TableHead className="text-muted-foreground h-10 pl-4 font-medium">
                        ID
                      </TableHead>
                      <TableHead className="text-muted-foreground font-medium">
                        TEST CASE
                      </TableHead>
                      <TableHead className="text-muted-foreground font-medium">
                        TYPE
                      </TableHead>
                      <TableHead className="text-muted-foreground font-medium">
                        PRIORITY
                      </TableHead>
                      <TableHead className="text-muted-foreground pr-8 text-right font-medium">
                        STATUS
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStepResults.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          className="text-muted-foreground py-12 text-center text-sm"
                        >
                          {stepResults.length === 0
                            ? 'No test cases found'
                            : 'No steps match the current filter'}
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedStepResults.map(({ testCase, result }) => {
                        const isFirstFailed =
                          firstFailedId !== null &&
                          testCase.testCaseId === firstFailedId
                        const isSelected =
                          selectedPanelStep?.testCase.testCaseId ===
                          testCase.testCaseId
                        return (
                          <TableRow
                            key={testCase.testCaseId}
                            data-first-failed-row={
                              isFirstFailed ? true : undefined
                            }
                            className={cn(
                              'h-12 cursor-pointer transition-colors',
                              isSelected
                                ? 'bg-accent/50 hover:bg-accent/50'
                                : 'hover:bg-accent/50'
                            )}
                            onClick={() =>
                              setSelectedPanelStep(
                                isSelected ? null : { testCase, result }
                              )
                            }
                          >
                            <RunStepResultTableRowCells
                              testCase={testCase}
                              result={result}
                              expanded={isSelected}
                            />
                          </TableRow>
                        )
                      })
                    )}
                  </TableBody>
                </Table>

                {filteredStepResults.length > 0 && (
                  <div className="border-border flex flex-wrap items-center justify-between gap-3 border-t px-4 py-3">
                    <p className="text-muted-foreground text-sm">
                      Showing {(stepResultsPage - 1) * stepResultsPageSize + 1}–
                      {Math.min(
                        stepResultsPage * stepResultsPageSize,
                        filteredStepResults.length
                      )}{' '}
                      of {filteredStepResults.length} test cases
                    </p>
                    <div className="flex flex-wrap items-center gap-4">
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground text-xs">
                          Per page
                        </span>
                        <Select
                          value={String(stepResultsPageSize)}
                          onValueChange={(value) => {
                            setStepResultsPageSize(Number(value))
                            setStepResultsPage(1)
                          }}
                        >
                          <SelectTrigger className="h-8 w-[74px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {[5, 10, 25, 50].map((size) => (
                              <SelectItem key={size} value={String(size)}>
                                {size}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      {totalPages > 1 && (
                        <FunctionalPagination
                          currentPage={stepResultsPage}
                          totalPages={totalPages}
                          setCurrentPage={setStepResultsPage}
                        />
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-1 flex-col px-6 pt-6">
              <div className="border-border rounded-xl border bg-[#141925] px-6 py-8">
                <p className="text-muted-foreground text-center text-sm">
                  No test cases found for this run
                </p>
              </div>
            </div>
          )}
        </div>

        <AnimatePresence mode="wait">
          {selectedPanelStep && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: '480px' }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.15 }}
              className="sticky top-0 shrink-0 pr-6"
            >
              <DynamicScrollArea
                topOffset={200}
                bottomOffset={16}
                className="border-border flex h-full min-w-[calc(480px-1.5rem)] shrink-0 flex-col overflow-hidden rounded-lg border bg-[#141925]"
              >
                <TestCaseDetailsPanel
                  testCase={selectedPanelStep.testCase}
                  result={selectedPanelStep.result}
                  onClose={() => setSelectedPanelStep(null)}
                  onImageClick={setSelectedImage}
                />
              </DynamicScrollArea>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {isRunning && resolvedServiceId && (
        <div className="border-border bg-background sticky bottom-0 flex items-center justify-end gap-2 border-t px-6 py-4">
          <Button
            preset="primary"
            onClick={() =>
              navigate(`/services/${resolvedServiceId}/tests/run/${testRunId}`)
            }
          >
            <Play className="h-4 w-4" />
            Resume run
          </Button>
        </div>
      )}

      {selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setSelectedImage(null)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Escape' && setSelectedImage(null)}
        >
          <button
            type="button"
            onClick={(e) => e.stopPropagation()}
            className="bg-transparent"
          >
            <img
              src={selectedImage ?? ''}
              alt="Screenshot"
              className="max-h-full max-w-full object-contain"
            />
          </button>
        </div>
      )}

      <BetterDialogProvider
        open={showReportDialog}
        onOpenChange={setShowReportDialog}
        className="h-[92vh] max-w-none sm:[--width:1100px]"
      >
        <TestRunReportDialog
          stats={stats}
          testRun={testRun}
          stepResults={stepResults}
        />
      </BetterDialogProvider>
    </>
  )
}

function TestCaseDetailsPanel({
  testCase,
  result,
  onClose,
  onImageClick,
}: {
  testCase: TestCase
  result: TestRunResult | null
  onClose: () => void
  onImageClick: (url: string) => void
}) {
  function normalizeResultStatus(
    status: string | null | undefined
  ): 'passed' | 'failed' | 'blocked' | 'skipped' {
    const raw = (status ?? '').trim().toLowerCase()
    if (raw === 'passed' || raw === 'pass') return 'passed'
    if (raw === 'failed' || raw === 'fail') return 'failed'
    if (raw === 'blocked') return 'blocked'
    if (raw === 'skipped' || raw === 'skip') return 'skipped'
    return 'skipped'
  }

  const displayStatus = normalizeResultStatus(result?.status)

  return (
    <div className="flex h-full min-h-0 flex-col bg-[#141925]">
      <div className="border-border flex shrink-0 items-center justify-between gap-3 border-b px-5 py-3.5">
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center gap-2">
            <h3 className="text-foreground truncate text-sm font-semibold">
              {testCase.title || 'Untitled test case'}
            </h3>
            {result && (
              <span
                className={cn(
                  'rounded border px-1.5 py-0.5 text-[10px] font-bold tracking-wide uppercase',
                  displayStatus === 'passed' &&
                    'border-green-500/50 bg-green-50 text-green-700',
                  displayStatus === 'failed' &&
                    'border-red-500/50 bg-red-50 text-red-700',
                  displayStatus === 'blocked' &&
                    'border-amber-500/50 bg-amber-50 text-amber-700',
                  displayStatus === 'skipped' &&
                    'border-border bg-muted/50 text-muted-foreground'
                )}
              >
                {displayStatus}
              </span>
            )}
          </div>
          <p className="text-muted-foreground text-xs">
            {testCase.testCaseId?.slice(-12) ?? '—'}
          </p>
        </div>

        <CrossButton onClick={onClose} />
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <RunStepResultExpandedContent
          testCase={testCase}
          result={result}
          onImageClick={onImageClick}
        />
      </div>
    </div>
  )
}
