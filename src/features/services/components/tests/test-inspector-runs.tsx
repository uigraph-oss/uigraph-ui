'use client'

import { GT } from '@/api'
import { SectionLoader } from '@/components/section-loader'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { useQuery } from '@apollo/client'
import { arrayNonNullable } from 'daily-code'
import { format } from 'date-fns'
import { ChevronRight } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { GET_TEST_RUN_RESULTS_QUERY } from '../../api/test-run-results'
import { GET_TEST_RUNS_QUERY } from '../../api/test-runs'
import { RunDetailsView } from './run-details-view'

type TestInspectorRunsProps = {
  testCase: GT.TestCase
}

type ViewState = 'list' | 'details'

export function TestInspectorRuns({ testCase }: TestInspectorRunsProps) {
  const [view, setView] = useState<ViewState>('list')
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null)
  // Reset state when test case changes
  useEffect(() => {
    setView('list')
    setSelectedRunId(null)
  }, [testCase.testCaseId])

  // Query all test runs for the test pack
  const { data: runsData, loading: runsLoading } = useQuery(
    GET_TEST_RUNS_QUERY,
    {
      fetchPolicy: 'cache-first',
      variables: { testPackId: testCase.testPackId ?? '' },
      skip: !testCase.testPackId,
    }
  )

  const testRuns = useMemo(
    () => arrayNonNullable(runsData?.v1GetTestRuns),
    [runsData?.v1GetTestRuns]
  )

  // For each run, query results to find if this test case has a result
  const runsWithResults = useMemo(() => {
    return testRuns.filter((run: GT.TestRun) => run.testRunId)
  }, [testRuns])

  // Sort runs by executedAt descending (most recent first)
  const sortedRuns = useMemo(() => {
    return [...runsWithResults].sort((a: GT.TestRun, b: GT.TestRun) => {
      const dateA = a.executedAt ? new Date(a.executedAt).getTime() : 0
      const dateB = b.executedAt ? new Date(b.executedAt).getTime() : 0
      return dateB - dateA
    })
  }, [runsWithResults])

  function getStatusBadgeVariant(status: string | null) {
    switch (status?.toLowerCase()) {
      case 'passed':
        return 'default'
      case 'failed':
        return 'destructive'
      case 'skipped':
        return 'secondary'
      case 'blocked':
        return 'secondary'
      default:
        return 'secondary'
    }
  }

  if (runsLoading) {
    return (
      <div className="flex h-full items-center justify-center py-12">
        <SectionLoader label="Loading test runs..." />
      </div>
    )
  }

  function handleRunClick(runId: string) {
    setSelectedRunId(runId)
    setView('details')
  }

  if (view === 'details' && selectedRunId) {
    return (
      <RunDetailsView
        testRunId={selectedRunId}
        testPackId={testCase.testPackId ?? null}
      />
    )
  }

  if (sortedRuns.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 px-6 py-12 text-center">
        <p className="text-sm font-semibold text-gray-900">No test runs yet</p>
        <p className="text-sm text-gray-600">
          Test runs will appear here once you execute a test pack.
        </p>
      </div>
    )
  }

  return (
    <div className="px-6 py-4 transition-opacity duration-150">
      <div className="space-y-0">
        {sortedRuns.map((run: GT.TestRun) => (
          <TestRunRow
            key={run.testRunId}
            run={run}
            testCaseId={testCase.testCaseId ?? null}
            onClick={() => run.testRunId && handleRunClick(run.testRunId)}
            getStatusBadgeVariant={getStatusBadgeVariant}
          />
        ))}
      </div>
    </div>
  )
}

type TestRunRowProps = {
  run: GT.TestRun
  testCaseId?: string | null
  onClick: () => void
  getStatusBadgeVariant: (status: string | null) => string
}

function TestRunRow({
  run,
  testCaseId,
  onClick,
  getStatusBadgeVariant: _getStatusBadgeVariant,
}: TestRunRowProps) {
  const { data: resultsData } = useQuery(GET_TEST_RUN_RESULTS_QUERY, {
    fetchPolicy: 'cache-first',
    variables: { testRunId: run.testRunId ?? '' },
    skip: !run.testRunId,
  })

  const results = useMemo(
    () => arrayNonNullable(resultsData?.v1GetTestRunResults),
    [resultsData?.v1GetTestRunResults]
  )

  // Find result for this specific test case
  const testCaseResult = useMemo(() => {
    return results.find(
      (r: GT.TestRunResult) => r.testCaseId === testCaseId
    ) as GT.TestRunResult | undefined
  }, [results, testCaseId])

  const status = testCaseResult?.status ?? null

  function getStatusColor(status: string | null) {
    switch (status?.toLowerCase()) {
      case 'passed':
        return { dot: 'bg-green-500', text: 'text-green-600', label: 'Passed' }
      case 'failed':
        return { dot: 'bg-red-500', text: 'text-red-600', label: 'Failed' }
      case 'skipped':
        return { dot: 'bg-gray-400', text: 'text-gray-600', label: 'Skipped' }
      case 'blocked':
        return { dot: 'bg-amber-500', text: 'text-amber-600', label: 'Blocked' }
      default:
        return { dot: 'bg-gray-400', text: 'text-gray-600', label: 'Unknown' }
    }
  }

  const statusInfo = status ? getStatusColor(status) : null

  return (
    <div className="border-b border-gray-100 py-3">
      <button
        onClick={onClick}
        className="-mx-2 flex w-full items-center justify-between rounded px-2 py-1.5 text-left transition-colors hover:bg-gray-50"
      >
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <div className="min-w-0 flex-1">
            <div className="mb-1 flex items-center gap-2">
              <span className="truncate font-mono text-xs text-gray-500">
                {run.testRunId?.slice(-8) ?? '—'}
              </span>
              {statusInfo && (
                <div className="flex items-center gap-1.5">
                  <div className={`h-2 w-2 rounded-full ${statusInfo.dot}`} />
                  <span className={`text-xs font-medium ${statusInfo.text}`}>
                    {statusInfo.label}
                  </span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-4 text-xs text-gray-600">
              {run.executedBy && (
                <span className="flex items-center gap-1.5 truncate">
                  <span>By:</span>
                  <div className="flex items-center gap-1">
                    <Avatar className="size-3">
                      <AvatarImage
                        src={run.executedByProfileImgUrl || ''}
                        className="object-cover"
                      />
                      <AvatarFallback className="text-[8px]">
                        {run.executedBy.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span>{run.executedBy}</span>
                  </div>
                </span>
              )}
              {run.executedAt && (
                <span>
                  {format(new Date(run.executedAt), 'MMM d, yyyy h:mm a')}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {run.environment && (
            <Badge variant="outline" className="text-xs">
              {run.environment}
            </Badge>
          )}
          <ChevronRight className="h-4 w-4 text-gray-400" />
        </div>
      </button>
    </div>
  )
}
