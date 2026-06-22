'use client'

import type { TestCase } from '@/api/.gql/graphql'
import { BetterDeleteConfirmationModal } from '@/components/better-delete-confirmation-modal'
import { SectionLoader } from '@/components/section-loader'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { assetUrl, uploadFile } from '@/features/uploads/api/uploads'
import { cn } from '@/lib/utils'
import { useCurrentOrganization } from '@/store/auth-store'
import { useMutation, useQuery } from '@apollo/client'
import { arrayNonNullable } from 'daily-code'
import { format } from 'date-fns'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  FiArrowLeft,
  FiArrowRight,
  FiCheck,
  FiStopCircle,
  FiX,
} from 'react-icons/fi'
import { IoPause, IoPlaySkipForwardOutline } from 'react-icons/io5'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import {
  CREATE_TEST_RUN_RESULT,
  TEST_CASES,
  TEST_RUN,
  TEST_RUN_RESULTS,
  TEST_RUNS_SUMMARY,
  UPDATE_TEST_RUN,
  UPDATE_TEST_RUN_RESULT,
} from '../../api/tests'
import { useServiceContext } from '../../contexts/service-context'
import { normalizeTestCaseIdForMatch } from '../../utils/normalize-test-case-id'
import {
  TestCaseExecutionCard,
  type DraftScreenshot,
  type TestRunResultDraft,
} from './test-case-execution-card'
import { TestRunExecutionDefinitionPanel } from './test-run-execution-definition-panel'

type TestRunResult = {
  testRunResultId?: string | null
  testRunId?: string | null
  testCaseId?: string | null
  status?: string | null
  blockedReason?: string | null
  responseStatus?: number | null
  responseBody?: string | null
  notes?: string | null
  screenshotUrls?: string[] | null
  executedAt?: string | null
  executedBy?: string | null
}

const RUN_STATUSES = ['passed', 'failed', 'skipped', 'blocked'] as const

function normalizeExecutionStatus(
  status: string | null | undefined
): 'passed' | 'failed' | 'skipped' | 'blocked' | 'NOT_RUN' {
  const normalizedStatus = (status ?? '').toLowerCase()
  if (
    RUN_STATUSES.includes(normalizedStatus as (typeof RUN_STATUSES)[number])
  ) {
    return normalizedStatus as (typeof RUN_STATUSES)[number]
  }
  return 'NOT_RUN'
}

function getSavedScreenshots(result?: TestRunResult | null): DraftScreenshot[] {
  return (result?.screenshotUrls ?? []).map((url) => ({
    kind: 'uploaded' as const,
    url,
  }))
}

function areScreenshotsEqual(
  left: DraftScreenshot[] | undefined,
  right: DraftScreenshot[] | undefined
) {
  const normalizedLeft = left ?? []
  const normalizedRight = right ?? []

  if (normalizedLeft.length !== normalizedRight.length) {
    return false
  }

  return normalizedLeft.every((screenshot, index) => {
    const other = normalizedRight[index]
    if (!other || screenshot.kind !== other.kind) {
      return false
    }

    if (screenshot.kind === 'uploaded' && other.kind === 'uploaded') {
      return screenshot.url === other.url
    }

    return (
      screenshot.kind === 'local' &&
      other.kind === 'local' &&
      screenshot.file === other.file
    )
  })
}

function isDraftEqualToSavedResult(
  draft: TestRunResultDraft,
  result?: TestRunResult | null
) {
  const savedStatus = normalizeExecutionStatus(result?.status)

  return (
    (draft.status ?? null) ===
      (savedStatus === 'NOT_RUN' ? null : savedStatus) &&
    (draft.blockedReason ?? '') === (result?.blockedReason ?? '') &&
    (draft.notes ?? '') === (result?.notes ?? '') &&
    (draft.responseBody ?? '') === (result?.responseBody ?? '') &&
    (draft.responseStatus ?? undefined) ===
      (result?.responseStatus ?? undefined) &&
    areScreenshotsEqual(draft.screenshots, getSavedScreenshots(result))
  )
}

function areDraftsEqual(
  left: TestRunResultDraft | undefined,
  right: TestRunResultDraft | undefined
) {
  if (!left && !right) return true
  if (!left || !right) return false

  return (
    (left.status ?? undefined) === (right.status ?? undefined) &&
    (left.blockedReason ?? '') === (right.blockedReason ?? '') &&
    (left.notes ?? '') === (right.notes ?? '') &&
    (left.responseBody ?? '') === (right.responseBody ?? '') &&
    (left.responseStatus ?? undefined) ===
      (right.responseStatus ?? undefined) &&
    areScreenshotsEqual(left.screenshots, right.screenshots)
  )
}

export function TestRunExecutionPage() {
  const params = useParams() as {
    serviceId: string
    testRunId: string
  }
  const navigate = useNavigate()
  const testRunId = params.testRunId
  const { serviceId } = useServiceContext()
  const orgId = useCurrentOrganization().id

  const runVars = { orgId: orgId!, serviceId, id: testRunId }

  const { data: runData, loading: runLoading } = useQuery(TEST_RUN, {
    variables: runVars,
    skip: !orgId || !serviceId || !testRunId,
  })

  const testRun = runData?.testRun

  const runStatus = (testRun?.status ?? '').toLowerCase()
  const isRunning = runStatus === 'running'
  const isAborted = runStatus === 'aborted'
  const isRunLocked = isAborted

  const testPackId = testRun?.testPackId

  const casesVars = {
    orgId: orgId!,
    serviceId,
    testPackId: testPackId!,
  }
  const resultsVars = { orgId: orgId!, serviceId, testRunId }
  const summaryVars = {
    orgId: orgId!,
    serviceId,
    testPackId: testPackId ?? undefined,
  }

  const { data: casesData, loading: casesLoading } = useQuery(TEST_CASES, {
    variables: casesVars,
    skip: !orgId || !serviceId || !testPackId,
  })

  const {
    data: resultsData,
    loading: resultsLoading,
    refetch: refetchResults,
  } = useQuery(TEST_RUN_RESULTS, {
    variables: resultsVars,
    skip: !orgId || !serviceId || !testRunId,
  })

  const refetchQueries = useMemo(
    () => [
      ...(testRunId ? [{ query: TEST_RUN, variables: runVars }] : []),
      ...(testPackId
        ? [{ query: TEST_RUNS_SUMMARY, variables: summaryVars }]
        : []),
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [testRunId, testPackId, orgId, serviceId]
  )

  const [createTestRunResult] = useMutation(CREATE_TEST_RUN_RESULT, {
    refetchQueries,
  })

  const [updateTestRunResult] = useMutation(UPDATE_TEST_RUN_RESULT, {
    refetchQueries,
  })

  const [updateTestRun, { loading: isCompleting }] = useMutation(
    UPDATE_TEST_RUN,
    { refetchQueries }
  )

  const [isAbortDialogOpen, setIsAbortDialogOpen] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const definitionPanelRef = useRef<HTMLDivElement>(null)
  const recordPanelRef = useRef<HTMLDivElement>(null)
  const [draftMap, setDraftMap] = useState<Map<string, TestRunResultDraft>>(
    new Map()
  )

  const testCases = useMemo<TestCase[]>(() => {
    const cases = arrayNonNullable(casesData?.testCases)
    return [...cases].sort((a, b) => {
      const aOrder = a.order ?? 0
      const bOrder = b.order ?? 0
      return aOrder - bOrder
    })
  }, [casesData?.testCases])

  useEffect(() => {
    if (testCases.length === 0) return
    setSelectedIndex((i) => Math.min(i, testCases.length - 1))
  }, [testCases.length])

  const testRunResults = useMemo(() => {
    return arrayNonNullable(resultsData?.testRunResults)
  }, [resultsData?.testRunResults])

  const resultsMap = useMemo(() => {
    const map = new Map<string, TestRunResult>()
    testRunResults.forEach((result) => {
      const key = normalizeTestCaseIdForMatch(result.testCaseId)
      if (key) map.set(key, result)
    })
    return map
  }, [testRunResults])

  const executions = useMemo(() => {
    return testCases.map((tc) => {
      const testCaseId = tc.testCaseId ?? ''
      const result = resultsMap.get(normalizeTestCaseIdForMatch(tc.testCaseId))
      return {
        testCaseId,
        status: normalizeExecutionStatus(result?.status),
      }
    })
  }, [testCases, resultsMap])

  const summary = useMemo(() => {
    const passed = executions.filter((e) => e.status === 'passed').length
    const failed = executions.filter((e) => e.status === 'failed').length
    const skipped = executions.filter((e) => e.status === 'skipped').length
    const blocked = executions.filter((e) => e.status === 'blocked').length
    const remaining = executions.filter((e) => e.status === 'NOT_RUN').length
    return { passed, failed, skipped, blocked, remaining }
  }, [executions])

  const progress = useMemo(() => {
    const total = testCases.length
    const remaining = summary.remaining
    return total > 0 ? ((total - remaining) / total) * 100 : 0
  }, [testCases.length, summary.remaining])

  const allCompleted = testCases.length > 0 && summary.remaining === 0

  const completionValidationErrors = useMemo(() => {
    const errors: { testCaseId: string; title: string; reason: string }[] = []
    for (const exec of executions) {
      if (exec.status === 'NOT_RUN') continue
      const tc = testCases.find((c) => (c.testCaseId ?? '') === exec.testCaseId)
      const result = resultsMap.get(
        normalizeTestCaseIdForMatch(exec.testCaseId)
      )
      const title = tc?.title ?? exec.testCaseId ?? 'Unknown'

      if (exec.status === 'failed') {
        const notes = (result?.notes ?? '').trim()
        if (!notes) {
          errors.push({
            testCaseId: exec.testCaseId,
            title,
            reason: 'Notes required for failed tests',
          })
        }
      }
      if (exec.status === 'blocked') {
        const reason = (result?.blockedReason ?? '').trim()
        if (!reason) {
          errors.push({
            testCaseId: exec.testCaseId,
            title,
            reason: 'Reason required when blocked',
          })
        }
      }
    }
    return errors
  }, [executions, testCases, resultsMap])

  const hasUnsavedChanges = draftMap.size > 0
  const canCompleteRun =
    allCompleted &&
    completionValidationErrors.length === 0 &&
    !hasUnsavedChanges

  function getTypeBadgeVariant(type: string | null) {
    switch (type?.toLowerCase()) {
      case 'smoke':
        return 'default'
      case 'regression':
        return 'secondary'
      case 'manual':
        return 'outline'
      default:
        return 'secondary'
    }
  }

  function getStatusBadgeVariant(status: string | null) {
    switch (status?.toLowerCase()) {
      case 'passed':
        return 'default'
      case 'failed':
        return 'destructive'
      case 'partial':
        return 'secondary'
      case 'blocked':
        return 'secondary'
      default:
        return 'secondary'
    }
  }

  const updateDraft = useCallback(
    (testCaseId: string, draft: TestRunResultDraft) => {
      const savedResult = resultsMap.get(
        normalizeTestCaseIdForMatch(testCaseId)
      )

      setDraftMap((prev) => {
        const currentDraft = prev.get(testCaseId)
        if (areDraftsEqual(currentDraft, draft)) {
          return prev
        }

        const matchesSavedResult = isDraftEqualToSavedResult(draft, savedResult)
        if (matchesSavedResult && !currentDraft) {
          return prev
        }

        const next = new Map(prev)

        if (matchesSavedResult) {
          next.delete(testCaseId)
          return next
        }

        next.set(testCaseId, draft)
        return next
      })
    },
    [resultsMap]
  )

  const handleStatusSelect = useCallback(
    (
      testCaseId: string,
      status: 'passed' | 'failed' | 'skipped' | 'blocked'
    ) => {
      const currentDraft = draftMap.get(testCaseId)
      const savedResult = resultsMap.get(
        normalizeTestCaseIdForMatch(testCaseId)
      )

      updateDraft(testCaseId, {
        status,
        blockedReason:
          currentDraft?.blockedReason ?? savedResult?.blockedReason ?? '',
        notes: currentDraft?.notes ?? savedResult?.notes ?? '',
        responseStatus:
          currentDraft?.responseStatus ??
          savedResult?.responseStatus ??
          undefined,
        responseBody:
          currentDraft?.responseBody ?? savedResult?.responseBody ?? '',
        screenshots:
          currentDraft?.screenshots ?? getSavedScreenshots(savedResult),
      })
    },
    [draftMap, resultsMap, updateDraft]
  )

  async function saveTestRunResult(
    testCaseId: string,
    status: 'passed' | 'failed' | 'skipped' | 'blocked',
    data: {
      notes?: string
      blockedReason?: string
      responseStatus?: number
      responseBody?: string
      screenshots?: DraftScreenshot[]
    }
  ) {
    const existingResult = resultsMap.get(
      normalizeTestCaseIdForMatch(testCaseId)
    )

    const uploadedScreenshots = data.screenshots ?? []
    const uploadedUrls = uploadedScreenshots
      .filter(
        (
          screenshot
        ): screenshot is Extract<DraftScreenshot, { kind: 'uploaded' }> =>
          screenshot.kind === 'uploaded'
      )
      .map((screenshot) => screenshot.url)
    const localFiles = uploadedScreenshots
      .filter(
        (
          screenshot
        ): screenshot is Extract<DraftScreenshot, { kind: 'local' }> =>
          screenshot.kind === 'local'
      )
      .map((screenshot) => screenshot.file)
    const newUrls =
      localFiles.length > 0 ? await handleScreenshotUpload(localFiles) : []

    const input = {
      testRunId: testRunId!,
      testCaseId,
      status,
      blockedReason: data.blockedReason,
      notes: data.notes,
      responseStatus: data.responseStatus,
      responseBody: data.responseBody,
      screenshotUrls: [...uploadedUrls, ...newUrls],
    }

    if (existingResult?.testRunResultId) {
      await updateTestRunResult({
        variables: {
          orgId: orgId!,
          serviceId,
          id: existingResult.testRunResultId,
          input,
        },
      })
    } else {
      await createTestRunResult({
        variables: {
          orgId: orgId!,
          serviceId,
          input,
        },
      })
    }

    const refetchResult = await refetchResults()
    const freshResults = refetchResult?.data?.testRunResults ?? []
    const freshResult = Array.isArray(freshResults)
      ? (freshResults.find(
          (r) =>
            r != null &&
            normalizeTestCaseIdForMatch(r.testCaseId) ===
              normalizeTestCaseIdForMatch(testCaseId)
        ) ?? undefined)
      : undefined
    const serverStatus = normalizeExecutionStatus(freshResult?.status)
    if (serverStatus === status) {
      setDraftMap((prev) => {
        const next = new Map(prev)
        next.delete(testCaseId)
        return next
      })
    }
  }

  async function handleStatusChange(
    testCaseId: string,
    status: 'passed' | 'failed' | 'skipped' | 'blocked',
    data: {
      notes?: string
      blockedReason?: string
      responseStatus?: number
      responseBody?: string
      screenshots?: DraftScreenshot[]
    }
  ) {
    try {
      await saveTestRunResult(testCaseId, status, data)
      toast.success('Test result saved')
    } catch (error: unknown) {
      console.error('Failed to save test result:', error)
      const message =
        error instanceof Error ? error.message : 'Failed to save test result'
      toast.error(message)
      throw error
    }
  }

  async function handleScreenshotUpload(files: File[]): Promise<string[]> {
    if (!orgId || !serviceId) {
      throw new Error(
        'Organization ID and Service ID are required for file upload'
      )
    }

    const urls: string[] = []
    for (const file of files) {
      try {
        const assetId = await uploadFile(orgId, file)
        const url = assetUrl(assetId)
        urls.push(url)
      } catch (error) {
        console.error('Failed to upload file:', error)
        throw error
      }
    }
    return urls
  }

  async function handleCompleteRun() {
    if (!canCompleteRun) return

    try {
      let overallStatus = 'partial'
      const hasFailed = summary.failed > 0
      const allPassed =
        summary.passed === testCases.length &&
        summary.failed === 0 &&
        summary.blocked === 0
      const anyBlocked = summary.blocked > 0

      if (hasFailed) {
        overallStatus = 'failed'
      } else if (allPassed && !anyBlocked) {
        overallStatus = 'passed'
      }

      const completedAt = new Date().toISOString()
      await updateTestRun({
        variables: {
          orgId: orgId!,
          serviceId,
          id: testRunId!,
          input: {
            overallStatus,
            status: 'completed',
            completedAt,
          },
        },
      })

      toast.success('Test run completed')
      void navigate(`/services/${serviceId}/tests/runs/${testRunId!}`)
    } catch (error: unknown) {
      console.error('Failed to complete test run:', error)
      const message =
        error instanceof Error ? error.message : 'Failed to complete test run'
      toast.error(message)
    }
  }

  async function handleAbortRun() {
    if (!isRunning) return
    const result = await updateTestRun({
      variables: {
        orgId: orgId!,
        serviceId,
        id: testRunId!,
        input: { status: 'aborted' },
      },
    })
    if (result.errors?.length) {
      throw new Error(result.errors[0]?.message ?? 'Failed to abort test run')
    }
    toast.success('Test run aborted')
  }

  const selectedTestCase = testCases[selectedIndex]
  const selectedTestCaseId = selectedTestCase?.testCaseId ?? ''
  const selectedResult = selectedTestCaseId
    ? resultsMap.get(normalizeTestCaseIdForMatch(selectedTestCaseId))
    : null
  const selectedDraft = selectedTestCaseId
    ? (draftMap.get(selectedTestCaseId) ?? null)
    : null
  const selectedSavedStatus = normalizeExecutionStatus(selectedResult?.status)
  const selectedDisplayStatus =
    selectedDraft?.status ??
    (selectedSavedStatus !== 'NOT_RUN' ? selectedSavedStatus : null)

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      const tag = target?.tagName?.toLowerCase()
      if (tag === 'input' || tag === 'textarea' || target?.isContentEditable) {
        return
      }
      const key = e.key.toLowerCase()
      if (testCases.length === 0 || !selectedTestCaseId) return
      if (key === 'p') {
        e.preventDefault()
        handleStatusSelect(selectedTestCaseId, 'passed')
      } else if (key === 'f') {
        e.preventDefault()
        handleStatusSelect(selectedTestCaseId, 'failed')
      } else if (key === 's') {
        e.preventDefault()
        handleStatusSelect(selectedTestCaseId, 'skipped')
      } else if (key === 'b') {
        e.preventDefault()
        handleStatusSelect(selectedTestCaseId, 'blocked')
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        setSelectedIndex((i) => Math.min(i + 1, testCases.length - 1))
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        setSelectedIndex((i) => Math.max(0, i - 1))
      }
    },
    [testCases.length, selectedTestCaseId, handleStatusSelect]
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  useEffect(() => {
    definitionPanelRef.current?.scrollTo(0, 0)
    recordPanelRef.current?.scrollTo(0, 0)
  }, [selectedIndex])

  if (runLoading || casesLoading || resultsLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <SectionLoader label="Loading test run..." />
      </div>
    )
  }

  if (!testRun) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <p className="text-foreground text-sm font-semibold">
            Test run not found
          </p>
          <p className="text-muted-foreground mt-1 text-sm">
            The test run you&apos;re looking for doesn&apos;t exist or has been
            deleted.
          </p>
          <Button
            variant="secondary"
            className="mt-4"
            onClick={() => navigate(-1)}
          >
            Go Back
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-shading-gray flex h-full flex-col gap-3 p-3">
      <div className="border-stock rounded-[12px] border bg-[#141925]">
        <div className="flex flex-wrap items-start justify-between gap-4 px-6 py-5">
          <div className="flex flex-1 flex-col gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-foreground text-lg font-semibold">
                Test Run Execution
              </h1>
              {testRun.environment && (
                <Badge
                  variant={getTypeBadgeVariant(null)}
                  className="rounded-full px-2.5 py-0.5 text-xs font-medium"
                >
                  {testRun.environment}
                </Badge>
              )}
              {isAborted && (
                <Badge
                  variant="outline"
                  className="rounded-full border-amber-200 bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700"
                >
                  Aborted
                </Badge>
              )}
            </div>
            <div className="flex flex-wrap gap-6">
              {testRun.releaseLabel && (
                <div>
                  <p className="text-muted-foreground mb-1 text-xs font-medium tracking-wide uppercase">
                    Release
                  </p>
                  <p className="text-foreground text-sm font-medium">
                    {testRun.releaseLabel}
                  </p>
                </div>
              )}
              {testRun.executedBy && (
                <div>
                  <p className="text-muted-foreground mb-1 text-xs font-medium tracking-wide uppercase">
                    Executed By
                  </p>
                  <div className="text-foreground flex items-center gap-2 text-sm font-medium">
                    <Avatar className="size-5">
                      <AvatarImage src="" className="object-cover" />
                      <AvatarFallback className="text-[10px]">
                        {testRun.executedBy.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span>{testRun.executedBy}</span>
                  </div>
                </div>
              )}
              {testRun.executedAt && (
                <div>
                  <p className="text-muted-foreground mb-1 text-xs font-medium tracking-wide uppercase">
                    Started At
                  </p>
                  <p className="text-foreground text-sm font-medium">
                    {format(new Date(testRun.executedAt), 'PPpp')}
                  </p>
                </div>
              )}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {isRunning && (
              <Button
                preset="primary"
                onClick={() => setIsAbortDialogOpen(true)}
                className="border border-amber-500/40 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20"
              >
                <FiStopCircle className="h-4 w-4" />
                Abort Run
              </Button>
            )}
            {isRunning && (
              <Button
                preset="primary"
                onClick={handleCompleteRun}
                disabled={!canCompleteRun || isCompleting}
              >
                <FiCheck className="h-4 w-4" />
                {isCompleting ? 'Completing...' : 'Complete Run'}
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-hidden rounded-[12px] border border-[#2A3242] bg-[#141925]">
        {testCases.length === 0 ? (
          <div className="flex h-full items-center justify-center p-6">
            <div className="text-center">
              <p className="text-foreground text-sm font-semibold">
                No test cases found
              </p>
              <p className="text-muted-foreground mt-1 text-sm">
                This test pack doesn&apos;t have any test cases yet.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex h-full min-h-0">
            <div className="bg-shading-gray/45 border-r border-[#2A3242]">
              <div className="flex h-full w-72 shrink-0 flex-col">
                <div className="border-b border-[#2A3242] px-5 py-4">
                  <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                    Test Cases
                  </p>
                </div>
                <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3">
                  {testCases.map((testCase, index) => {
                    const testCaseId = testCase.testCaseId ?? ''
                    const execution = executions.find(
                      (e) => e.testCaseId === testCaseId
                    )
                    const status =
                      execution?.status !== 'NOT_RUN'
                        ? (execution?.status ?? null)
                        : null
                    const isActive = index === selectedIndex
                    const typeLabel = (testCase.type ?? '').toUpperCase()
                    const stepNum = index + 1

                    return (
                      <button
                        key={testCaseId}
                        type="button"
                        onClick={() => setSelectedIndex(index)}
                        className={
                          isActive
                            ? 'relative mb-2 flex w-full items-start gap-3 rounded-[12px] bg-[#1E2533] px-3 py-3 text-left ring-1 ring-[#8DB4FF] transition-all duration-200 ease-out'
                            : 'relative mb-2 flex w-full items-start gap-3 rounded-[12px] bg-transparent px-3 py-3 text-left transition-all duration-200 ease-out hover:bg-[#141925] hover:ring-1 hover:ring-[#2A3242]'
                        }
                      >
                        <div
                          className={cn(
                            'relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold',
                            status === 'passed'
                              ? 'bg-emerald-100 text-emerald-700'
                              : status === 'failed'
                                ? 'bg-red-100 text-red-700'
                                : status === 'blocked'
                                  ? 'bg-amber-100 text-amber-700'
                                  : status === 'skipped'
                                    ? 'bg-[#2A3242] text-[#D2D9E6]'
                                    : isActive
                                      ? 'bg-primary/12 text-primary'
                                      : 'text-muted-foreground border border-[#2A3242] bg-[#141925]'
                          )}
                        >
                          {stepNum}
                          {status && (
                            <span
                              className={cn(
                                'absolute -top-0.5 -right-0.5 flex size-3.5 items-center justify-center rounded-full border border-white',
                                status === 'passed'
                                  ? 'bg-emerald-600/80 text-white'
                                  : status === 'failed'
                                    ? 'bg-red-600/80 text-white'
                                    : status === 'blocked'
                                      ? 'bg-amber-500 text-white'
                                      : 'bg-slate-500 text-white'
                              )}
                            >
                              {status === 'passed' ? (
                                <FiCheck className="size-2" />
                              ) : status === 'failed' ? (
                                <FiX className="size-2" />
                              ) : status === 'blocked' ? (
                                <IoPause className="size-2" />
                              ) : (
                                <IoPlaySkipForwardOutline className="size-2" />
                              )}
                            </span>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p
                            className={`truncate text-sm font-medium ${
                              isActive ? 'text-foreground' : 'text-foreground'
                            }`}
                          >
                            {testCase.title ?? 'Untitled'}
                          </p>
                          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-medium">
                            <span className="text-[#4B587C] uppercase">
                              {typeLabel || 'N/A'}
                            </span>
                            {testCase.isCritical && (
                              <span className="text-[#C0392B]">Critical</span>
                            )}
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            <div className="flex min-w-0 flex-1 flex-col">
              <div className="border-b border-[#2A3242] bg-[#141925] px-6 py-4">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex min-w-0 flex-1 flex-wrap items-center gap-3">
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
                        selectedDisplayStatus === 'passed'
                          ? 'bg-emerald-100 text-emerald-700'
                          : selectedDisplayStatus === 'failed'
                            ? 'bg-red-100 text-red-700'
                            : selectedDisplayStatus === 'skipped'
                              ? 'bg-[#2A3242] text-[#D2D9E6]'
                              : selectedDisplayStatus === 'blocked'
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-primary/12 text-primary'
                      }`}
                    >
                      {selectedIndex + 1}
                    </div>
                    <div className="min-w-0">
                      <div className="flex min-w-0 items-center gap-2">
                        <h2 className="text-foreground truncate text-base font-semibold">
                          {selectedTestCase?.title ?? 'Untitled'}
                        </h2>
                        {selectedDraft && (
                          <Badge
                            variant="outline"
                            className="shrink-0 rounded-full border-sky-200 bg-sky-50 px-2.5 py-0.5 text-xs font-medium text-sky-700"
                          >
                            Modified
                          </Badge>
                        )}
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-1.5">
                        <span className="text-muted-foreground text-xs font-medium">
                          Test case {selectedIndex + 1}
                        </span>
                        {selectedTestCase?.type && (
                          <Badge
                            variant="secondary"
                            className="rounded-full px-2.5 py-0.5 text-xs font-medium"
                          >
                            {selectedTestCase.type.toUpperCase()}
                          </Badge>
                        )}
                        {selectedTestCase?.isCritical && (
                          <Badge
                            variant="destructive"
                            className="rounded-full px-2.5 py-0.5 text-xs font-medium"
                          >
                            Critical
                          </Badge>
                        )}
                        {selectedDisplayStatus && (
                          <Badge
                            variant="outline"
                            className={
                              selectedDisplayStatus === 'passed'
                                ? 'rounded-full border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700'
                                : selectedDisplayStatus === 'failed'
                                  ? 'rounded-full border-red-200 bg-red-50 px-2.5 py-0.5 text-xs font-medium text-red-700'
                                  : selectedDisplayStatus === 'blocked'
                                    ? 'rounded-full border-amber-200 bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700'
                                    : 'rounded-full border-[#2A3242] bg-[#1E2533] px-2.5 py-0.5 text-xs font-medium text-[#D2D9E6]'
                            }
                          >
                            {selectedDisplayStatus.toUpperCase()}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      preset="outline"
                      size="sm"
                      disabled={selectedIndex === 0}
                      onClick={() =>
                        setSelectedIndex((i) => Math.max(0, i - 1))
                      }
                    >
                      <FiArrowLeft className="h-4 w-4" />
                      Prev
                    </Button>
                    <Button
                      preset="primary"
                      size="sm"
                      disabled={selectedIndex === testCases.length - 1}
                      onClick={() =>
                        setSelectedIndex((i) =>
                          Math.min(i + 1, testCases.length - 1)
                        )
                      }
                    >
                      Next
                      <FiArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="bg-shading-gray/45 flex min-h-0 flex-1 gap-3 p-3">
                <div
                  ref={definitionPanelRef}
                  className="min-h-0 w-[47%] shrink-0 overflow-y-auto rounded-[12px] border border-[#2A3242] bg-[#141925] p-5"
                >
                  {selectedTestCase && (
                    <TestRunExecutionDefinitionPanel
                      testCase={selectedTestCase}
                    />
                  )}
                </div>

                <div
                  ref={recordPanelRef}
                  className="min-h-0 min-w-0 flex-1 overflow-y-auto rounded-[12px] border border-[#2A3242] bg-[#141925] p-5"
                >
                  <p className="text-muted-foreground mb-4 text-xs font-medium tracking-wide uppercase">
                    Record Result
                  </p>
                  {selectedTestCase && (
                    <TestCaseExecutionCard
                      key={selectedTestCaseId}
                      testCase={selectedTestCase}
                      existingResult={selectedResult}
                      draft={selectedDraft}
                      status={selectedDisplayStatus}
                      onStatusChange={(status, data) =>
                        handleStatusChange(selectedTestCaseId, status, data)
                      }
                      onStatusSelect={(status) =>
                        handleStatusSelect(selectedTestCaseId, status)
                      }
                      onDraftChange={(draft) =>
                        updateDraft(selectedTestCaseId, draft)
                      }
                      organizationId={orgId}
                      projectId={serviceId}
                      readOnly={isRunLocked}
                      recordOnly
                      onSaveSuccess={() => {
                        if (selectedIndex < testCases.length - 1) {
                          setSelectedIndex((i) => i + 1)
                        }
                      }}
                      saveButtonLabel={
                        selectedIndex < testCases.length - 1
                          ? 'Save & Next'
                          : allCompleted
                            ? 'Save'
                            : 'Save Result'
                      }
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {testCases.length > 0 && (
        <div className="border-stock sticky bottom-0 rounded-[12px] border bg-[#141925] px-5 py-4 shadow-[0_8px_24px_rgba(15,23,42,0.06)]">
          <div className="flex flex-wrap items-center justify-between gap-4 text-sm">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-muted-foreground font-medium">
                {testCases.length - summary.remaining} / {testCases.length}{' '}
                completed
                <span className="text-foreground ml-1 font-medium">
                  ({Math.round(progress)}%)
                </span>
              </span>
              <span className="text-muted-foreground">Summary</span>
              <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                Passed: {summary.passed}
              </span>
              <span className="rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700">
                Failed: {summary.failed}
              </span>
              <span className="rounded-full bg-[#1E2533] px-2.5 py-1 text-xs font-medium text-[#D2D9E6]">
                Skipped: {summary.skipped}
              </span>
              <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">
                Blocked: {summary.blocked}
              </span>
              {summary.remaining > 0 && (
                <span className="rounded-full bg-[#141925] px-2.5 py-1 text-xs font-medium text-[#828DA3] ring-1 ring-[#2A3242]">
                  Remaining: {summary.remaining}
                </span>
              )}
            </div>
            {allCompleted && (
              <>
                {completionValidationErrors.length > 0 ? (
                  <span className="text-muted-foreground text-xs font-medium">
                    Add required notes for failed tests and reasons for blocked
                    tests
                  </span>
                ) : (
                  <Badge
                    variant={getStatusBadgeVariant(
                      testRun?.overallStatus ?? null
                    )}
                    className="rounded-full px-2.5 py-1 text-xs font-medium"
                  >
                    Ready to Complete
                  </Badge>
                )}
              </>
            )}
          </div>
        </div>
      )}

      <BetterDeleteConfirmationModal
        open={isAbortDialogOpen}
        onOpenChange={setIsAbortDialogOpen}
        onConfirm={handleAbortRun}
        title="Abort Run"
        description="Are you sure you want to abort this run?"
        cancelButtonText="Cancel"
        deleteButtonText="Abort"
        errorMessage="Failed to abort test run. Please try again later."
      />
    </div>
  )
}
