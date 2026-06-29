'use client'

import type { TestCase } from '@/api/.gql/graphql'
import { BetterDeleteConfirmationModal } from '@/components/better-delete-confirmation-modal'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CodeMirrorWrapped, RichTextEditor } from '@/features/component-meta'
import { useAssetUrls } from '@/features/uploads/api/uploads'
import { cn } from '@/lib/utils'
import { useCurrentOrganization } from '@/store/auth-store'
import { openFileExplorer } from 'daily-code/browser'
import { Delta } from 'quill'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import {
  FiCheckCircle,
  FiPauseCircle,
  FiUpload,
  FiX,
  FiXCircle,
} from 'react-icons/fi'
import { MdOutlineFormatListNumbered } from 'react-icons/md'
import { PiSkipForwardCircle } from 'react-icons/pi'

const RUN_STATUSES = ['passed', 'failed', 'skipped', 'blocked'] as const
function toDelta(v: string | null | undefined): Delta | string {
  if (!v) return ''
  try {
    const ops = JSON.parse(v)
    return Array.isArray(ops) ? new Delta(ops) : v
  } catch {
    return v
  }
}
function normalizeStatusForUI(
  status: string | null | undefined
): 'passed' | 'failed' | 'skipped' | 'blocked' | null {
  const s = (status ?? '').trim().toLowerCase()
  if (RUN_STATUSES.includes(s as (typeof RUN_STATUSES)[number])) {
    return s as (typeof RUN_STATUSES)[number]
  }
  return null
}

function getInitialScreenshots(
  existingResult?: TestRunResult | null,
  draft?: TestRunResultDraft | null
) {
  return (
    draft?.screenshots ??
    (existingResult?.screenshotUrls ?? []).map((assetId) => ({
      kind: 'uploaded' as const,
      assetId,
    }))
  )
}

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

export type DraftScreenshot =
  | { kind: 'uploaded'; assetId: string }
  | { kind: 'local'; file: File }

export type TestRunResultDraft = {
  status?: 'passed' | 'failed' | 'skipped' | 'blocked'
  blockedReason?: string
  responseStatus?: number
  responseBody?: string
  notes?: string
  screenshots?: DraftScreenshot[]
}

type TestCaseExecutionCardProps = {
  testCase: TestCase
  existingResult?: TestRunResult | null
  draft?: TestRunResultDraft | null
  status?: 'passed' | 'failed' | 'skipped' | 'blocked' | null
  onStatusChange: (
    status: 'passed' | 'failed' | 'skipped' | 'blocked',
    data: {
      notes?: string
      blockedReason?: string
      responseStatus?: number
      responseBody?: string
      screenshots?: DraftScreenshot[]
    }
  ) => Promise<void>
  onStatusSelect?: (status: 'passed' | 'failed' | 'skipped' | 'blocked') => void
  onDraftChange?: (draft: TestRunResultDraft) => void
  organizationId?: string
  projectId?: string
  readOnly?: boolean
  /** When true, hide title/definition and show only the record form + single save button (e.g. for two-panel execution layout). */
  recordOnly?: boolean
  /** Called after a successful save when recordOnly (e.g. to advance to next case). */
  onSaveSuccess?: () => void
  /** Label for the primary save button when recordOnly (e.g. "Save & Next" or "Save Result"). */
  saveButtonLabel?: string
}

export function TestCaseExecutionCard({
  testCase,
  existingResult,
  draft,
  status: statusFromParent,
  onStatusChange,
  onStatusSelect,
  onDraftChange,
  readOnly = false,
  recordOnly = false,
  onSaveSuccess,
  saveButtonLabel = 'Save Result',
}: TestCaseExecutionCardProps) {
  const isLocked = !!readOnly
  const initialStatus =
    draft?.status ?? normalizeStatusForUI(existingResult?.status) ?? null

  const [selectedStatus, setSelectedStatus] = useState<
    'passed' | 'failed' | 'skipped' | 'blocked' | null
  >(() => initialStatus)
  const displayStatus = recordOnly
    ? (selectedStatus ?? statusFromParent ?? null)
    : (statusFromParent ?? selectedStatus)
  const [isSaving, setIsSaving] = useState(false)
  const [showCriticalConfirmDialog, setShowCriticalConfirmDialog] =
    useState(false)
  const [showBlockedReason, setShowBlockedReason] = useState(
    initialStatus === 'blocked'
  )
  const [pendingStatus, setPendingStatus] = useState<{
    status: 'passed' | 'failed' | 'skipped' | 'blocked'
    shouldAdvance: boolean
  } | null>(null)
  const submitStatusRef = useRef<'passed' | 'failed' | 'skipped' | 'blocked'>(
    'passed'
  )

  const isApi = testCase.type?.toLowerCase() === 'api'
  const isManual = testCase.type?.toLowerCase() === 'manual'
  const showScreenshots = isManual || testCase.evidenceRequired
  const hasResult = displayStatus !== null

  const {
    register,
    control,
    watch,
    setValue,
    trigger,
    setFocus,
    getValues,
    clearErrors,
    setError,
    formState: { errors },
  } = useForm({
    defaultValues: {
      blockedReason:
        draft?.blockedReason ?? existingResult?.blockedReason ?? '',
      notes: draft?.notes ?? existingResult?.notes ?? '',
      responseStatus:
        draft?.responseStatus ?? existingResult?.responseStatus ?? undefined,
      responseBody: draft?.responseBody ?? existingResult?.responseBody ?? '',
      screenshots: getInitialScreenshots(existingResult, draft),
    },
  })

  const blockedReason = watch('blockedReason')
  const notes = watch('notes')
  const responseStatus = watch('responseStatus')
  const responseBody = watch('responseBody')
  const watchedScreenshots = watch('screenshots')
  const blockedReasonForDisplay = blockedReason ?? ''
  const screenshots = useMemo(
    () => watchedScreenshots ?? [],
    [watchedScreenshots]
  )

  useEffect(() => {
    onDraftChange?.({
      status: selectedStatus ?? undefined,
      blockedReason: blockedReason ?? '',
      notes: notes ?? '',
      responseStatus:
        typeof responseStatus === 'number' && Number.isFinite(responseStatus)
          ? responseStatus
          : undefined,
      responseBody: responseBody ?? '',
      screenshots,
    })
  }, [
    blockedReason,
    notes,
    onDraftChange,
    responseBody,
    responseStatus,
    screenshots,
    selectedStatus,
  ])

  const orgId = useCurrentOrganization()?.id
  const uploadedAssetIds = screenshots
    .filter(
      (
        screenshot
      ): screenshot is Extract<DraftScreenshot, { kind: 'uploaded' }> =>
        screenshot.kind === 'uploaded'
    )
    .map((screenshot) => screenshot.assetId)
  const assetUrlMap = useAssetUrls(orgId, uploadedAssetIds)

  const localScreenshotPreviews = screenshots
    .filter(
      (screenshot): screenshot is Extract<DraftScreenshot, { kind: 'local' }> =>
        screenshot.kind === 'local'
    )
    .map((screenshot) => ({
      file: screenshot.file,
      url: URL.createObjectURL(screenshot.file),
    }))

  useEffect(() => {
    return () => {
      localScreenshotPreviews.forEach((preview) => {
        URL.revokeObjectURL(preview.url)
      })
    }
  }, [localScreenshotPreviews])

  async function proceedWithStatusChange(
    status: 'passed' | 'failed' | 'skipped' | 'blocked',
    formData: {
      blockedReason?: string
      notes?: string
      responseStatus?: number
      responseBody?: string
      screenshots?: DraftScreenshot[]
    }
  ) {
    if (isLocked || isSaving) return
    setIsSaving(true)
    try {
      const reasonToSend =
        status === 'blocked'
          ? formData.blockedReason?.trim() || 'Blocked'
          : undefined
      await onStatusChange(status, {
        notes: formData.notes ?? '',
        blockedReason: reasonToSend,
        responseStatus:
          typeof formData.responseStatus === 'number' &&
          Number.isFinite(formData.responseStatus)
            ? formData.responseStatus
            : undefined,
        responseBody: formData.responseBody ?? '',
        screenshots: formData.screenshots ?? [],
      })
      setShowCriticalConfirmDialog(false)
      setPendingStatus(null)
      if (status === 'blocked') setShowBlockedReason(false)
    } catch (error) {
      console.error('Failed to save test result:', error)
      setSelectedStatus(normalizeStatusForUI(existingResult?.status) ?? null)
      throw error
    } finally {
      setIsSaving(false)
    }
  }

  async function saveStatus(
    status: 'passed' | 'failed' | 'skipped' | 'blocked',
    shouldAdvance = false
  ) {
    await proceedWithStatusChange(status, getValues())
    if (recordOnly && shouldAdvance) {
      onSaveSuccess?.()
    }
  }

  async function handleValidatedSave(
    status: 'passed' | 'failed' | 'skipped' | 'blocked',
    shouldAdvance = false
  ) {
    if (isLocked || isSaving) return

    submitStatusRef.current = status

    if (status === 'blocked') {
      setShowBlockedReason(true)
      await new Promise<void>((resolve) => {
        requestAnimationFrame(() => resolve())
      })
    } else {
      setShowBlockedReason(false)
    }

    const valid = await trigger()
    if (!valid) {
      if (status === 'blocked') {
        setError('blockedReason', {
          type: 'required',
          message: 'Reason is required for blocked tests',
        })
        setFocus('blockedReason')
      } else if (status === 'failed' && notesEmpty) {
        setError('notes', {
          type: 'required',
          message: 'Notes are required for failed tests',
        })
        setFocus('notes')
      }
      return
    }

    if (status === 'failed' && testCase.isCritical) {
      setPendingStatus({ status, shouldAdvance })
      setShowCriticalConfirmDialog(true)
      return
    }

    setSelectedStatus(status)
    onStatusSelect?.(status)
    await saveStatus(status, shouldAdvance)
  }

  function handleFormSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    if (!displayStatus) {
      return
    }

    void handleValidatedSave(displayStatus)
  }

  function handleStatusClick(s: 'passed' | 'failed' | 'skipped' | 'blocked') {
    setSelectedStatus(s)
    onStatusSelect?.(s)
    setShowBlockedReason(s === 'blocked')

    if (s !== 'failed') {
      clearErrors('notes')
    }

    if (s !== 'blocked') {
      clearErrors('blockedReason')
    }
  }

  function handleSaveAndNext() {
    if (!displayStatus) {
      return
    }

    void handleValidatedSave(displayStatus, true)
  }

  async function handleConfirmCriticalFailure() {
    if (!pendingStatus) return Promise.resolve()
    const valid = await trigger()
    if (valid) {
      setSelectedStatus(pendingStatus.status)
      onStatusSelect?.(pendingStatus.status)
      return saveStatus(pendingStatus.status, pendingStatus.shouldAdvance)
    }
    setShowCriticalConfirmDialog(false)
    setPendingStatus(null)
    if (notesEmpty) setFocus('notes')
    return Promise.resolve()
  }

  async function handleFileSelect() {
    if (isLocked) return

    const files = await openFileExplorer({ accept: 'image/*', multiple: true })
    if (files.length === 0) return

    setValue('screenshots', [
      ...screenshots,
      ...Array.from(files).map((file) => ({ kind: 'local' as const, file })),
    ])
    clearErrors('screenshots')
  }

  function handleRemoveScreenshot(index: number) {
    if (isLocked || isSaving) return
    setValue(
      'screenshots',
      screenshots.filter((_, i) => i !== index)
    )
  }

  const notesRaw = notes
  let notesValue: Delta | string = ''
  if (notesRaw && notesRaw.trim()) {
    try {
      const ops = JSON.parse(notesRaw)
      notesValue = Array.isArray(ops) ? new Delta(ops) : notesRaw
    } catch {
      notesValue = notesRaw
    }
  }

  let notesEmpty = true
  if (notesRaw && notesRaw.trim()) {
    try {
      const ops = JSON.parse(notesRaw)
      if (!Array.isArray(ops)) {
        notesEmpty = !notesRaw.trim()
      } else {
        const text = ops
          .filter(
            (o: { insert?: unknown }) =>
              typeof (o as { insert?: string })?.insert === 'string'
          )
          .reduce((acc: string, o: { insert: string }) => acc + o.insert, '')
        notesEmpty = !text.trim()
      }
    } catch {
      notesEmpty = !notesRaw.trim()
    }
  }

  const structuredSteps = testCase.manual?.steps ?? null
  const hasStructuredSteps = !!structuredSteps && structuredSteps.length > 0

  const screenshotField = showScreenshots ? (
    <div className="space-y-2">
      <Label className="text-sm font-medium">
        Screenshots
        {testCase.evidenceRequired && (
          <span className="text-destructive"> *</span>
        )}
      </Label>
      <div className="mt-2 space-y-2">
        <Controller
          name="screenshots"
          control={control}
          rules={{
            validate: (v) =>
              testCase.evidenceRequired &&
              (displayStatus !== null || submitStatusRef.current !== null) &&
              (!v || v.length === 0)
                ? 'Screenshot required when evidence is enabled'
                : true,
          }}
          render={() => <></>}
        />
        <Button
          type="button"
          preset="outline"
          className="h-11 rounded-[12px]"
          onClick={handleFileSelect}
          disabled={isLocked}
        >
          <FiUpload className="h-4 w-4" />
          Upload Screenshots
        </Button>
        {errors.screenshots?.message && (
          <p className="text-destructive mt-1 text-xs">
            {errors.screenshots.message}
          </p>
        )}
        {screenshots.length > 0 && (
          <div className="mt-2 grid grid-cols-3 gap-3">
            {screenshots.map((screenshot, index) => (
              <div key={index} className="relative">
                <img
                  src={
                    screenshot.kind === 'uploaded'
                      ? (assetUrlMap[screenshot.assetId] ?? '')
                      : (localScreenshotPreviews.find(
                          (preview) => preview.file === screenshot.file
                        )?.url ?? '')
                  }
                  alt={`Screenshot ${index + 1}`}
                  className="h-24 w-full rounded-[12px] border border-[#2A3242] object-cover"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveScreenshot(index)}
                  disabled={isLocked}
                  className="bg-destructive hover:bg-destructive/90 absolute -top-2 -right-2 rounded-full p-1 text-white disabled:pointer-events-none disabled:opacity-50"
                >
                  <FiX className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  ) : null

  const formContent = (
    <form
      key={`${testCase.testCaseId}-${existingResult?.testRunResultId ?? 'new'}`}
      onSubmit={handleFormSubmit}
    >
      <div className="mb-4 grid grid-cols-4 gap-2">
        <Button
          type="button"
          data-status="passed"
          preset="outline"
          onClick={() => handleStatusClick('passed')}
          disabled={isLocked || isSaving}
          className={cn(
            'text-foreground/80 h-12 flex-1 rounded-[12px] border-[#2A3242] bg-[#141925] hover:bg-[#141925]',
            displayStatus === 'passed' &&
              'border-emerald-500/40 bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/15'
          )}
        >
          <FiCheckCircle className="size-4!" />
          Pass
        </Button>
        <Button
          type="button"
          data-status="failed"
          preset="outline"
          onClick={() => handleStatusClick('failed')}
          disabled={isLocked || isSaving}
          className={cn(
            'text-foreground/80 h-12 flex-1 rounded-[12px] border-[#2A3242] bg-[#141925] hover:bg-[#141925]',
            displayStatus === 'failed' &&
              'border-red-500/40 bg-red-500/15 text-red-300 hover:bg-red-500/15'
          )}
        >
          <FiXCircle className="size-4!" />
          Fail
        </Button>
        <Button
          type="button"
          data-status="skipped"
          preset="outline"
          onClick={() => handleStatusClick('skipped')}
          disabled={isLocked || isSaving}
          className={cn(
            'text-foreground/80 h-12 flex-1 rounded-[12px] border-[#2A3242] bg-[#141925] hover:bg-[#141925]',
            displayStatus === 'skipped' &&
              'border-[#2A3242] bg-[#1E2533] text-[#D2D9E6] hover:bg-[#1E2533]'
          )}
        >
          <PiSkipForwardCircle className="size-5!" />
          Skip
        </Button>
        <Button
          type="button"
          data-status="blocked"
          preset="outline"
          onClick={() => handleStatusClick('blocked')}
          disabled={isLocked || isSaving}
          className={cn(
            'text-foreground/80 h-12 flex-1 rounded-[12px] border-[#2A3242] bg-[#141925] hover:bg-[#141925]',
            displayStatus === 'blocked' &&
              'border-amber-500/40 bg-amber-500/15 text-amber-300 hover:bg-amber-500/15'
          )}
        >
          <FiPauseCircle className="size-4!" />
          Blocked
        </Button>
      </div>

      {isManual ? (
        <div
          className={
            recordOnly ? 'space-y-4' : 'grid grid-cols-1 gap-6 md:grid-cols-2'
          }
        >
          {!recordOnly && (
            <div className="rounded-[12px] border border-[#2A3242] bg-[#141925] p-4">
              <p className="text-muted-foreground mb-3 flex items-center gap-2 text-xs font-medium tracking-wide uppercase">
                <MdOutlineFormatListNumbered className="h-4 w-4" />
                Steps & Expected
              </p>
              {hasStructuredSteps || testCase.manual?.testData ? (
                <div className="text-muted-foreground text-sm">
                  {hasStructuredSteps ? (
                    <div className="space-y-3">
                      {[...structuredSteps!]
                        .sort((a, b) => a.order - b.order)
                        .map((step, idx) => (
                          <div key={idx} className="space-y-2">
                            <Label className="text-foreground text-sm font-medium">
                              Step {(step.order ?? idx) + 1}
                            </Label>

                            <RichTextEditor
                              value={toDelta(step.action)}
                              setValue={() => {}}
                              noOverflow
                              readonly
                            />
                            <div className="space-y-2">
                              <Label className="text-foreground text-sm font-medium">
                                Expected
                              </Label>
                              <div className="mt-0.5">
                                <RichTextEditor
                                  value={toDelta(step.expectedResult)}
                                  setValue={() => {}}
                                  readonly
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <RichTextEditor
                      value={toDelta(testCase.manual?.testData)}
                      setValue={() => {}}
                      readonly
                    />
                  )}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">
                  No steps defined
                </p>
              )}
            </div>
          )}
          <div
            className={cn(
              'rounded-[12px] border border-[#2A3242] p-4',
              !recordOnly && 'bg-[#141925]'
            )}
          >
            <p className="text-muted-foreground mb-3 flex items-center gap-2 text-xs font-medium tracking-wide uppercase">
              <FiCheckCircle className="h-4 w-4" />
              Outcome
            </p>
            <div className="space-y-4">
              {(showBlockedReason || displayStatus === 'blocked') && (
                <div className="space-y-2">
                  <Label
                    htmlFor={`blockedReason-${testCase.testCaseId}`}
                    className="text-sm font-medium"
                  >
                    Reason <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id={`blockedReason-${testCase.testCaseId}`}
                    placeholder="Short reason (e.g. dependency down, env issue)"
                    readOnly={isLocked}
                    {...register('blockedReason', {
                      required:
                        showBlockedReason || displayStatus === 'blocked'
                          ? 'Reason is required for blocked tests'
                          : false,
                      validate: (v) =>
                        (showBlockedReason || displayStatus === 'blocked') &&
                        (!v || !v.trim())
                          ? 'Reason is required for blocked tests'
                          : true,
                    })}
                    className="h-11 rounded-[12px] border-[#2A3242] bg-[#141925] px-4"
                  />
                  {errors.blockedReason?.message && (
                    <p className="text-destructive mt-1 text-xs">
                      {errors.blockedReason.message}
                    </p>
                  )}
                </div>
              )}
              {screenshotField}
              <div className="space-y-2">
                <Label
                  htmlFor={`notes-${testCase.testCaseId}`}
                  className="text-sm font-medium"
                >
                  Notes{' '}
                  {displayStatus === 'failed' && (
                    <span className="text-destructive">*</span>
                  )}
                </Label>
                <div
                  className={cn(
                    'w-full',
                    isLocked && 'pointer-events-none opacity-70'
                  )}
                >
                  <Controller
                    name="notes"
                    control={control}
                    rules={{
                      validate: () =>
                        (displayStatus === 'failed' ||
                          submitStatusRef.current === 'failed') &&
                        notesEmpty
                          ? 'Notes are required for failed tests'
                          : true,
                    }}
                    render={({ field, fieldState }) => (
                      <div ref={field.ref} tabIndex={-1}>
                        <RichTextEditor
                          value={notesValue}
                          setValue={(delta) =>
                            field.onChange(JSON.stringify(delta.ops))
                          }
                        />
                        {fieldState.error?.message && (
                          <p className="text-destructive mt-1 text-xs">
                            {fieldState.error.message}
                          </p>
                        )}
                      </div>
                    )}
                  />
                </div>
              </div>
              {hasResult && !recordOnly && (
                <div className="text-muted-foreground flex flex-wrap items-center gap-2 text-sm">
                  <span className="font-medium">Status:</span>
                  <Badge
                    variant="outline"
                    className={
                      displayStatus === 'passed'
                        ? 'rounded-full border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-400'
                        : displayStatus === 'failed'
                          ? 'rounded-full border-red-500/30 bg-red-500/10 px-2.5 py-0.5 text-xs font-medium text-red-400'
                          : displayStatus === 'blocked'
                            ? 'rounded-full border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-xs font-medium text-amber-400'
                            : 'rounded-full border-[#2A3242] bg-[#1E2533] px-2.5 py-0.5 text-xs font-medium text-[#D2D9E6]'
                    }
                  >
                    {displayStatus?.toUpperCase()}
                  </Badge>
                  {displayStatus === 'blocked' && blockedReasonForDisplay && (
                    <span className="text-muted-foreground italic">
                      — {blockedReasonForDisplay}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <>
          {(showBlockedReason || displayStatus === 'blocked') && (
            <div className="mb-4 space-y-2">
              <Label
                htmlFor={`blockedReason-${testCase.testCaseId}`}
                className="text-sm font-medium"
              >
                Reason <span className="text-destructive">*</span>
              </Label>
              <Input
                id={`blockedReason-${testCase.testCaseId}`}
                placeholder="Short reason (e.g. dependency down, env issue)"
                readOnly={isLocked}
                {...register('blockedReason', {
                  required:
                    showBlockedReason || displayStatus === 'blocked'
                      ? 'Reason is required for blocked tests'
                      : false,
                  validate: (v) =>
                    (showBlockedReason || displayStatus === 'blocked') &&
                    (!v || !v.trim())
                      ? 'Reason is required for blocked tests'
                      : true,
                })}
                className="h-11 rounded-[12px] border-[#2A3242] bg-[#141925] px-4"
              />
              {errors.blockedReason?.message && (
                <p className="text-destructive mt-1 text-xs">
                  {errors.blockedReason.message}
                </p>
              )}
            </div>
          )}

          {isApi && (
            <div className="mb-4 space-y-4">
              <div className="space-y-2">
                <Label
                  htmlFor={`responseStatus-${testCase.testCaseId}`}
                  className="text-sm font-medium"
                >
                  Actual Status Code (optional)
                </Label>
                <Input
                  id={`responseStatus-${testCase.testCaseId}`}
                  type="number"
                  placeholder="e.g. 200, 404, 500"
                  readOnly={isLocked}
                  {...register('responseStatus', { valueAsNumber: true })}
                  className="h-11 rounded-[12px] border-[#2A3242] bg-[#141925] px-4"
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor={`responseBody-${testCase.testCaseId}`}
                  className="text-sm font-medium"
                >
                  Response Snippet (optional)
                </Label>
                <div className="w-full overflow-hidden rounded-[12px] border border-[#2A3242] bg-[#141925]">
                  <Controller
                    name="responseBody"
                    control={control}
                    render={({ field }) => (
                      <CodeMirrorWrapped
                        height="6.25rem"
                        value={field.value ?? ''}
                        setValue={(v) => field.onChange(v)}
                        readonly={isLocked}
                      />
                    )}
                  />
                </div>
              </div>
            </div>
          )}

          {screenshotField && <div className="mb-4">{screenshotField}</div>}

          <div className="mb-4 space-y-2">
            <Label
              htmlFor={`notes-${testCase.testCaseId}`}
              className="text-sm font-medium"
            >
              Notes{' '}
              {displayStatus === 'failed' && (
                <span className="text-destructive">*</span>
              )}
            </Label>
            <div
              className={cn(
                'w-full',
                isLocked && 'pointer-events-none opacity-70'
              )}
            >
              <Controller
                name="notes"
                control={control}
                rules={{
                  validate: () =>
                    (displayStatus === 'failed' ||
                      submitStatusRef.current === 'failed') &&
                    notesEmpty
                      ? 'Notes are required for failed tests'
                      : true,
                }}
                render={({ field, fieldState }) => (
                  <div ref={field.ref} tabIndex={-1}>
                    <RichTextEditor
                      value={notesValue}
                      setValue={(delta) =>
                        field.onChange(JSON.stringify(delta.ops))
                      }
                    />
                    {fieldState.error?.message && (
                      <p className="text-destructive mt-1 text-xs">
                        {fieldState.error.message}
                      </p>
                    )}
                  </div>
                )}
              />
            </div>
          </div>
        </>
      )}

      {recordOnly && displayStatus && (
        <div className="border-border mt-5 border-t pt-4">
          <Button
            type="button"
            preset="primary"
            className="h-11 w-full rounded-[12px]"
            disabled={isLocked || isSaving}
            onClick={handleSaveAndNext}
          >
            {saveButtonLabel}
          </Button>
        </div>
      )}
    </form>
  )

  return (
    <>
      {recordOnly ? (
        <div>{formContent}</div>
      ) : (
        <div className="rounded-[12px] border border-[#2A3242] bg-[#141925] p-6">
          <div className="mb-4 flex items-start justify-between">
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-lg font-semibold">
                  {testCase.title ?? 'Untitled'}
                </h3>
                {testCase.type && (
                  <Badge
                    variant={isApi ? 'default' : 'secondary'}
                    className="rounded-full px-2.5 py-0.5 text-xs font-medium"
                  >
                    {testCase.type.toUpperCase()}
                  </Badge>
                )}
                {testCase.isCritical && (
                  <Badge
                    variant="destructive"
                    className="rounded-full px-2.5 py-0.5 text-xs font-medium"
                  >
                    Critical
                  </Badge>
                )}
                {testCase.evidenceRequired && (
                  <Badge
                    variant="outline"
                    className="rounded-full px-2.5 py-0.5 text-xs font-medium"
                  >
                    Requires Evidence
                  </Badge>
                )}
              </div>

              {isApi && (
                <div className="text-muted-foreground mt-2 space-y-1 text-sm">
                  {testCase.api?.operationId && (
                    <p>
                      <span className="font-medium">Operation:</span>{' '}
                      {testCase.api.operationId}
                    </p>
                  )}
                  {typeof testCase.api?.expectedStatusCode === 'number' && (
                    <p>
                      <span className="font-medium">Expected Status:</span>{' '}
                      {testCase.api.expectedStatusCode}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
          {formContent}
          {!isManual && hasResult && !recordOnly && (
            <div className="text-muted-foreground mt-4 flex flex-wrap items-center gap-2 text-sm">
              <span className="font-medium">Status:</span>
              <Badge
                variant="outline"
                className={
                  displayStatus === 'passed'
                    ? 'rounded-full border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-400'
                    : displayStatus === 'failed'
                      ? 'rounded-full border-red-500/30 bg-red-500/10 px-2.5 py-0.5 text-xs font-medium text-red-400'
                      : displayStatus === 'blocked'
                        ? 'rounded-full border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-xs font-medium text-amber-400'
                        : 'rounded-full border-[#2A3242] bg-[#1E2533] px-2.5 py-0.5 text-xs font-medium text-[#D2D9E6]'
                }
              >
                {displayStatus?.toUpperCase()}
              </Badge>
              {displayStatus === 'blocked' && blockedReasonForDisplay && (
                <span className="text-muted-foreground italic">
                  — {blockedReasonForDisplay}
                </span>
              )}
            </div>
          )}

          {isManual && hasResult && !recordOnly && (
            <div className="text-muted-foreground mt-4 flex flex-wrap items-center gap-2 text-sm">
              <span className="font-medium">Status:</span>
              <Badge
                variant="outline"
                className={
                  displayStatus === 'passed'
                    ? 'rounded-full border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-400'
                    : displayStatus === 'failed'
                      ? 'rounded-full border-red-500/30 bg-red-500/10 px-2.5 py-0.5 text-xs font-medium text-red-400'
                      : displayStatus === 'blocked'
                        ? 'rounded-full border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-xs font-medium text-amber-400'
                        : 'rounded-full border-[#2A3242] bg-[#1E2533] px-2.5 py-0.5 text-xs font-medium text-[#D2D9E6]'
                }
              >
                {displayStatus?.toUpperCase()}
              </Badge>
              {displayStatus === 'blocked' && blockedReasonForDisplay && (
                <span className="text-muted-foreground italic">
                  — {blockedReasonForDisplay}
                </span>
              )}
            </div>
          )}
        </div>
      )}
      <BetterDeleteConfirmationModal
        open={showCriticalConfirmDialog}
        onOpenChange={(open) => {
          setShowCriticalConfirmDialog(open)
          if (!open) setPendingStatus(null)
        }}
        onConfirm={handleConfirmCriticalFailure}
        title="Critical Test Failure"
        description="This is a critical test case. Are you sure you want to mark it as failed? This action should be taken only after careful consideration."
        deleteButtonText="Confirm Failure"
      />
    </>
  )
}
