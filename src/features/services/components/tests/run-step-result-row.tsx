'use client'

import { GT } from '@/api'
import { CodeMirrorRaw } from '@/components/code-mirror'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { TableCell } from '@/components/ui/table'
import { RichTextEditor } from '@/features/component-meta'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ChevronRight,
  MessageSquare,
  Paperclip,
  ShieldAlert,
} from 'lucide-react'
import { Delta } from 'quill'
import { useState } from 'react'
import { TestRunExecutionDefinitionPanel } from './test-run-execution-definition-panel'
import { getTestTypeConfig } from './test-type-config'

/** Grid columns for table layout: ID, TEST CASE, TYPE, PRIORITY, STATUS */
export const RUN_DETAILS_TABLE_GRID = 'grid-cols-[80px_1fr_82px_90px_108px]'

function toDelta(v: string | null | undefined): Delta | string {
  if (!v) return ''
  try {
    const ops = JSON.parse(v)
    return Array.isArray(ops) ? new Delta(ops) : v
  } catch {
    return v
  }
}

type RunStepResultRowProps = {
  testCase: GT.TestCase
  result: GT.TestRunResult | null
  expanded: boolean
  onToggleExpand: () => void
  onImageClick: (url: string) => void
  stepNumber?: number
  totalSteps?: number
  isLast?: boolean
  /** When 'table', renders as a table row (grid cells) + same expanded content */
  variant?: 'card' | 'table'
}

function getStatusBadge(status: string): {
  label: string
  className: string
  dotClass: string
} {
  switch (status) {
    case 'passed':
      return {
        label: 'Passed',
        className:
          'border-green-500/30 bg-green-50 text-green-700 text-xs dark:bg-green-950/30 dark:text-green-300',
        dotClass: 'bg-green-500',
      }
    case 'failed':
      return {
        label: 'Failed',
        className:
          'border-red-500/30 bg-red-50 text-red-700 text-xs dark:bg-red-950/30 dark:text-red-300',
        dotClass: 'bg-red-500',
      }
    case 'blocked':
      return {
        label: 'Blocked',
        className:
          'border-amber-500/30 bg-amber-50 text-amber-700 text-xs dark:bg-amber-950/30 dark:text-amber-300',
        dotClass: 'bg-amber-500',
      }
    case 'not_recorded':
      return {
        label: 'Not recorded',
        className:
          'border-transparent bg-muted/50 text-muted-foreground text-xs',
        dotClass: 'bg-muted-foreground',
      }
    case 'skipped':
    default:
      return {
        label: 'Skipped',
        className:
          'text-muted-foreground border-transparent bg-muted/50 text-xs',
        dotClass: 'bg-muted-foreground',
      }
  }
}

function getStatusCodeBadge(statusCode: number): {
  label: string
  className: string
} {
  if (statusCode >= 200 && statusCode < 300) {
    return {
      label: 'Success',
      className:
        'border-green-500/50 bg-green-50 text-green-700 text-sm px-3 py-1',
    }
  } else if (statusCode >= 300 && statusCode < 400) {
    return {
      label: 'Redirect',
      className:
        'border-blue-500/50 bg-blue-50 text-blue-700 text-sm px-3 py-1',
    }
  } else if (statusCode >= 400 && statusCode < 500) {
    return {
      label: 'Client Error',
      className:
        'border-amber-500/50 bg-amber-50 text-amber-700 text-sm px-3 py-1',
    }
  } else if (statusCode >= 500) {
    return {
      label: 'Server Error',
      className: 'border-red-500/50 bg-red-50 text-red-700 text-sm px-3 py-1',
    }
  } else {
    return {
      label: 'Informational',
      className:
        'border-gray-500/50 bg-gray-50 text-gray-700 text-sm px-3 py-1',
    }
  }
}

function getStepStatusColor(status: string): string {
  switch (status) {
    case 'passed':
      return 'bg-green-500 border-green-500'
    case 'failed':
      return 'bg-red-500 border-red-500'
    case 'blocked':
      return 'bg-amber-500 border-amber-500'
    default:
      return 'bg-gray-300 border-gray-300'
  }
}

/** P0→Critical, P1→High, P2→Medium, P3→Low; theme classes only */
export function getPriorityDisplay(priority: string | null | undefined): {
  label: string
  className: string
} {
  const p = (priority ?? '').toString().toUpperCase()
  switch (p) {
    case 'P0':
      return {
        label: 'Critical',
        className:
          'bg-destructive/10 text-destructive border border-destructive/30',
      }
    case 'P1':
      return {
        label: 'High',
        className:
          'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-300 dark:border-amber-800',
      }
    case 'P2':
      return {
        label: 'Medium',
        className: 'bg-primary/10 text-primary border border-primary/30',
      }
    case 'P3':
    default:
      return {
        label: 'Low',
        className: 'bg-muted text-muted-foreground border-border',
      }
  }
}

function EvidenceSection({
  result,
  onImageClick,
}: {
  result: GT.TestRunResult
  onImageClick: (url: string) => void
}) {
  if (!result.screenshotUrls?.length) return null
  return (
    <div className="space-y-2">
      <Label className="text-foreground text-sm font-normal">Evidence</Label>
      <div className="grid grid-cols-3 gap-2">
        {result.screenshotUrls.map((url, index) => (
          <button
            key={index}
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onImageClick(url)
            }}
            className="relative aspect-video overflow-hidden rounded border transition-opacity hover:opacity-80"
          >
            <img
              src={url}
              alt={`Screenshot ${index + 1}`}
              className="h-full w-full object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  )
}

function BlockedReasonSection({ reason }: { reason: string }) {
  return (
    <div className="space-y-2">
      <Label className="text-foreground text-sm font-normal">
        Blocked reason
      </Label>
      <p className="text-sm text-amber-800">{reason}</p>
    </div>
  )
}

function ResultTabContent({
  testCase,
  result,
  onImageClick,
  getStatusCodeBadge,
}: {
  testCase: GT.TestCase
  result: GT.TestRunResult
  onImageClick: (url: string) => void
  getStatusCodeBadge: (statusCode: number) => {
    label: string
    className: string
  }
}) {
  const type = (testCase.type ?? '').toLowerCase()
  const api = testCase.api
  const graphql = testCase.graphql

  if (type === 'api') {
    return (
      <div className="space-y-4">
        {api && (
          <div className="space-y-2">
            <Label className="text-foreground text-sm font-normal">
              Expected
            </Label>
            <div className="border-border bg-muted/20 flex flex-wrap items-center gap-2 rounded border px-3 py-2 text-xs">
              <span className="font-mono font-semibold">
                {(api.httpMethod ?? 'GET').toUpperCase()}
              </span>
              <span className="text-muted-foreground">
                {api.operationId ?? '—'}
              </span>
              {api.expectedStatusCode != null && (
                <span className="text-muted-foreground">
                  Expected status: {api.expectedStatusCode}
                </span>
              )}
            </div>
          </div>
        )}
        {result.responseStatus != null && (
          <div className="space-y-2">
            <Label className="text-foreground text-sm font-normal">
              Actual status
            </Label>
            <Badge
              variant="outline"
              className={getStatusCodeBadge(result.responseStatus).className}
            >
              {getStatusCodeBadge(result.responseStatus).label} (
              {result.responseStatus})
            </Badge>
          </div>
        )}
        {result.responseBody && (
          <div className="space-y-2">
            <Label className="text-foreground text-sm font-normal">
              Response
            </Label>
            <div className="border-border overflow-hidden rounded border">
              <CodeMirrorRaw
                readOnly
                editable={false}
                value={result.responseBody}
                minHeight="80px"
                maxHeight="10rem"
              />
            </div>
          </div>
        )}
        {!result.responseStatus && !result.responseBody && (
          <p className="text-muted-foreground text-sm">No outcome recorded</p>
        )}
        {result.blockedReason && (
          <BlockedReasonSection reason={result.blockedReason} />
        )}
        <EvidenceSection result={result} onImageClick={onImageClick} />
      </div>
    )
  }

  if (type === 'graphql') {
    return (
      <div className="space-y-4">
        {graphql?.query && (
          <div className="space-y-2">
            <Label className="text-foreground text-sm font-normal">Query</Label>
            <div className="border-border overflow-hidden rounded border">
              <CodeMirrorRaw
                readOnly
                editable={false}
                value={graphql.query}
                minHeight="60px"
                maxHeight="8rem"
              />
            </div>
          </div>
        )}
        {graphql?.variables && (
          <div className="space-y-2">
            <Label className="text-foreground text-sm font-normal">
              Variables
            </Label>
            <div className="border-border overflow-hidden rounded border">
              <CodeMirrorRaw
                readOnly
                editable={false}
                value={graphql.variables}
                minHeight="40px"
                maxHeight="6rem"
              />
            </div>
          </div>
        )}
        {result.responseBody && (
          <div className="space-y-2">
            <Label className="text-foreground text-sm font-normal">
              Response
            </Label>
            <div className="border-border overflow-hidden rounded border">
              <CodeMirrorRaw
                readOnly
                editable={false}
                value={result.responseBody}
                minHeight="80px"
                maxHeight="10rem"
              />
            </div>
          </div>
        )}
        {!result.responseBody && (
          <p className="text-muted-foreground text-sm">No response recorded</p>
        )}
        {result.blockedReason && (
          <BlockedReasonSection reason={result.blockedReason} />
        )}
        <EvidenceSection result={result} onImageClick={onImageClick} />
      </div>
    )
  }

  if (type === 'manual') {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="text-foreground text-sm font-normal">Notes</Label>
          {result.notes ? (
            <RichTextEditor
              value={toDelta(result.notes)}
              setValue={() => {}}
              noOverflow
              readonly
            />
          ) : (
            <p className="text-muted-foreground text-sm">No notes recorded</p>
          )}
        </div>
        {result.blockedReason && (
          <BlockedReasonSection reason={result.blockedReason} />
        )}
        <EvidenceSection result={result} onImageClick={onImageClick} />
      </div>
    )
  }

  if (type === 'database' || type === 'grpc') {
    const body = result.responseBody ?? result.notes
    return (
      <div className="space-y-4">
        {body && (
          <div className="space-y-2">
            <Label className="text-foreground text-sm font-normal">
              {type === 'database' ? 'Result' : 'Response'}
            </Label>
            <div className="border-border overflow-hidden rounded border">
              <CodeMirrorRaw
                readOnly
                editable={false}
                value={body}
                minHeight="60px"
                maxHeight="10rem"
              />
            </div>
          </div>
        )}
        {!body && (
          <p className="text-muted-foreground text-sm">No outcome recorded</p>
        )}
        {result.blockedReason && (
          <BlockedReasonSection reason={result.blockedReason} />
        )}
        <EvidenceSection result={result} onImageClick={onImageClick} />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {result.notes && (
        <div className="space-y-2">
          <Label className="text-foreground text-sm font-normal">Notes</Label>
          <RichTextEditor
            value={toDelta(result.notes)}
            setValue={() => {}}
            noOverflow
            readonly
          />
        </div>
      )}
      {result.responseBody && (
        <div className="space-y-2">
          <Label className="text-foreground text-sm font-normal">
            Response
          </Label>
          <div className="border-border overflow-hidden rounded border">
            <CodeMirrorRaw
              readOnly
              editable={false}
              value={result.responseBody}
              minHeight="80px"
              maxHeight="10rem"
            />
          </div>
        </div>
      )}
      {!result.notes && !result.responseBody && (
        <p className="text-muted-foreground text-sm">No outcome recorded</p>
      )}
      {result.blockedReason && (
        <BlockedReasonSection reason={result.blockedReason} />
      )}
      <EvidenceSection result={result} onImageClick={onImageClick} />
    </div>
  )
}

function expandedPanelContent(
  testCase: GT.TestCase,
  result: GT.TestRunResult | null,
  expandedTab: 'result' | 'details',
  setExpandedTab: (t: 'result' | 'details') => void,
  onImageClick: (url: string) => void
) {
  return (
    <div className="bg-white">
      <div className="flex items-center justify-start gap-2.5 border-b border-gray-200 px-4 py-2">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            setExpandedTab('result')
          }}
          className={cn(
            'flex h-9 items-center rounded-md border px-3.5 text-sm font-medium transition-colors',
            expandedTab === 'result'
              ? 'border-primary/20 bg-primary/10 text-primary'
              : 'border-border text-muted-foreground hover:bg-muted/50 hover:text-foreground bg-white'
          )}
        >
          Result
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            setExpandedTab('details')
          }}
          className={cn(
            'flex h-9 items-center rounded-md border px-3.5 text-sm font-medium transition-colors',
            expandedTab === 'details'
              ? 'border-primary/20 bg-primary/10 text-primary'
              : 'border-border text-muted-foreground hover:bg-muted/50 hover:text-foreground bg-white'
          )}
        >
          Steps &amp; Details
        </button>
      </div>
      <div className="p-5">
        {expandedTab === 'details' ? (
          <TestRunExecutionDefinitionPanel testCase={testCase} />
        ) : !result ? (
          <p className="text-muted-foreground text-sm">No execution recorded</p>
        ) : (
          <ResultTabContent
            testCase={testCase}
            result={result}
            onImageClick={onImageClick}
            getStatusCodeBadge={getStatusCodeBadge}
          />
        )}
      </div>
    </div>
  )
}

/** Expanded row content for use inside Table (with internal tab state) */
export function RunStepResultExpandedContent({
  testCase,
  result,
  onImageClick,
}: {
  testCase: GT.TestCase
  result: GT.TestRunResult | null
  onImageClick: (url: string) => void
}) {
  const [expandedTab, setExpandedTab] = useState<'result' | 'details'>('result')
  return expandedPanelContent(
    testCase,
    result,
    expandedTab,
    setExpandedTab,
    onImageClick
  )
}

/** Renders the six table cells for a test result row (for use with TableRow) */
export function RunStepResultTableRowCells({
  testCase,
  result,
  expanded,
}: {
  testCase: GT.TestCase
  result: GT.TestRunResult | null
  expanded: boolean
}) {
  const rawStatus = (result?.status ?? '').trim().toLowerCase()
  const normalizedStatus =
    rawStatus === 'passed' || rawStatus === 'pass'
      ? 'passed'
      : rawStatus === 'failed' || rawStatus === 'fail'
        ? 'failed'
        : rawStatus === 'blocked'
          ? 'blocked'
          : rawStatus === 'skipped' || rawStatus === 'skip'
            ? 'skipped'
            : 'skipped'
  const statusBadge = getStatusBadge(result ? normalizedStatus : 'not_recorded')
  const typeConfig = getTestTypeConfig(testCase.type)
  const TypeIcon = typeConfig.icon
  const priorityDisplay = getPriorityDisplay(testCase.priority)
  const shortId = (testCase.testCaseId ?? '').slice(-8) || '—'
  const labels = Array.isArray(testCase.labels)
    ? (testCase.labels as string[])
    : []
  const owner = (testCase as { testOwner?: string | null }).testOwner

  return (
    <>
      <TableCell className="text-muted-foreground pl-4 font-mono text-xs">
        {shortId}
      </TableCell>
      <TableCell className="min-w-0">
        <div className="space-y-0.5">
          <span className="text-foreground text-sm font-medium">
            {testCase.title || 'Untitled'}
          </span>
          {labels.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              {labels.map((l) => (
                <span
                  key={l}
                  className="text-muted-foreground border-border bg-muted/50 rounded-md border px-1.5 py-0.5 text-[10px] font-medium"
                >
                  #{l.replace(/^#/, '')}
                </span>
              ))}
            </div>
          )}
          {owner && (
            <span className="text-muted-foreground block text-xs">{owner}</span>
          )}
        </div>
      </TableCell>
      <TableCell>
        <span
          className={cn(
            'inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium',
            typeConfig.pillClass
          )}
        >
          <TypeIcon className="h-3 w-3 shrink-0" />
          {typeConfig.label}
        </span>
      </TableCell>
      <TableCell>
        <span
          className={cn(
            'inline-flex rounded-md border px-2 py-0.5 text-xs font-medium',
            priorityDisplay.className
          )}
        >
          {priorityDisplay.label}
        </span>
      </TableCell>
      <TableCell className="pr-4 text-right">
        <div className="flex items-center justify-end gap-1.5">
          <span
            className={cn(
              'inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-medium',
              statusBadge.className
            )}
          >
            <span
              className={cn(
                'size-1.5 shrink-0 rounded-full',
                statusBadge.dotClass
              )}
            />
            {statusBadge.label}
          </span>
          <motion.div
            animate={{ rotate: expanded ? 90 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronRight className="text-muted-foreground h-4 w-4" />
          </motion.div>
        </div>
      </TableCell>
    </>
  )
}

export function RunStepResultRow({
  testCase,
  result,
  expanded,
  onToggleExpand,
  onImageClick,
  stepNumber,
  isLast = false,
  variant = 'card',
}: RunStepResultRowProps) {
  const hasResult = !!result
  const rawStatus = (result?.status ?? '').trim().toLowerCase()
  const normalizedStatus =
    rawStatus === 'passed' || rawStatus === 'pass'
      ? 'passed'
      : rawStatus === 'failed' || rawStatus === 'fail'
        ? 'failed'
        : rawStatus === 'blocked'
          ? 'blocked'
          : rawStatus === 'skipped' || rawStatus === 'skip'
            ? 'skipped'
            : 'skipped'
  const statusBadge = getStatusBadge(
    hasResult ? normalizedStatus : 'not_recorded'
  )
  const hasComment = !!result?.notes?.trim()
  const evidenceCount = result?.screenshotUrls?.length ?? 0
  const showStepIndicator = variant === 'card' && stepNumber !== undefined
  const stepStatusColor = getStepStatusColor(normalizedStatus)
  const [expandedTab, setExpandedTab] = useState<'result' | 'details'>('result')

  if (variant === 'table') {
    const typeConfig = getTestTypeConfig(testCase.type)
    const TypeIcon = typeConfig.icon
    const priorityDisplay = getPriorityDisplay(testCase.priority)
    const shortId = (testCase.testCaseId ?? '').slice(-8) || '—'
    const labels = Array.isArray(testCase.labels)
      ? (testCase.labels as string[])
      : []
    const owner = (testCase as { testOwner?: string | null }).testOwner

    return (
      <div className="border-border border-b last:border-b-0">
        <button
          type="button"
          onClick={onToggleExpand}
          className={cn(
            'grid w-full min-w-[640px] items-center gap-x-2 px-4 py-3 text-left transition-colors',
            RUN_DETAILS_TABLE_GRID,
            'hover:bg-muted/50'
          )}
        >
          <div className="text-muted-foreground font-mono text-xs">
            {shortId}
          </div>
          <div className="min-w-0">
            <span className="text-foreground text-sm font-medium">
              {testCase.title || 'Untitled'}
            </span>
            {labels.length > 0 && (
              <div className="mt-1 flex flex-wrap gap-1">
                {labels.map((l) => (
                  <span
                    key={l}
                    className="border-border bg-muted rounded border px-1.5 py-0.5 font-mono text-[10px]"
                  >
                    {l}
                  </span>
                ))}
              </div>
            )}
            {owner && (
              <p className="text-muted-foreground mt-0.5 text-xs">{owner}</p>
            )}
          </div>
          <div>
            <span
              className={cn(
                'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-bold',
                typeConfig.pillClass
              )}
            >
              <TypeIcon className="h-3 w-3 shrink-0" />
              {typeConfig.label}
            </span>
          </div>
          <div>
            <span
              className={cn(
                'inline-flex rounded border px-2 py-0.5 text-xs font-medium',
                priorityDisplay.className
              )}
            >
              {priorityDisplay.label}
            </span>
          </div>
          <div className="flex items-center justify-end gap-1">
            <Badge variant="outline" className={statusBadge.className}>
              {statusBadge.label}
            </Badge>
            <motion.div
              animate={{ rotate: expanded ? 90 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronRight className="text-muted-foreground h-4 w-4" />
            </motion.div>
          </div>
        </button>
        <AnimatePresence initial={false}>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0.5 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0.5 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="border-border border-t">
                {expandedPanelContent(
                  testCase,
                  result,
                  expandedTab,
                  setExpandedTab,
                  onImageClick
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  }

  return (
    <div className="flex">
      {showStepIndicator && (
        <div className="mr-4 flex flex-col items-center">
          <div
            className={cn(
              'flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-xs font-semibold text-white shadow-sm',
              stepStatusColor
            )}
          >
            {stepNumber}
          </div>
          {!isLast && <div className="bg-border mt-2 w-0.5 flex-1" />}
        </div>
      )}
      <div className="mb-4 flex-1">
        <div className="border-border overflow-hidden rounded-lg border shadow-sm">
          <button
            onClick={onToggleExpand}
            className="hover:bg-muted/50 flex w-full items-center justify-between gap-2 p-3 text-left transition-colors"
          >
            <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
              <span className="text-foreground text-sm font-medium">
                {testCase.title || 'Untitled'}
              </span>
              {testCase.type &&
                (() => {
                  const typeConfig = getTestTypeConfig(testCase.type)
                  const TypeIcon = typeConfig.icon
                  return (
                    <span
                      className={cn(
                        'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-bold',
                        typeConfig.pillClass
                      )}
                    >
                      <TypeIcon className="h-3 w-3 shrink-0" />
                      {typeConfig.label.toUpperCase()}
                    </span>
                  )
                })()}
              <Badge variant="outline" className={statusBadge.className}>
                {statusBadge.label}
              </Badge>
              {testCase.isCritical && (
                <span className="inline-flex items-center gap-1 rounded bg-red-50 px-1.5 py-0.5 text-xs font-medium text-red-700">
                  <ShieldAlert className="h-3 w-3" />
                  Critical
                </span>
              )}
              {result?.executedAt && (
                <span className="text-muted-foreground text-xs">
                  {format(new Date(result.executedAt), 'MMM d, HH:mm')}
                </span>
              )}
              {hasComment && (
                <span className="text-muted-foreground" title="Has comment">
                  <MessageSquare className="h-4 w-4" />
                </span>
              )}
              {evidenceCount > 0 && (
                <span
                  className="text-muted-foreground inline-flex items-center gap-1 text-xs"
                  title={`${evidenceCount} attachment(s)`}
                >
                  <Paperclip className="h-3.5 w-3.5" />
                  {evidenceCount}
                </span>
              )}
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <motion.div
                animate={{ rotate: expanded ? 90 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronRight className="text-muted-foreground h-4 w-4" />
              </motion.div>
            </div>
          </button>

          <AnimatePresence initial={false}>
            {expanded && (
              <motion.div
                initial={{ height: 0, opacity: 0.5 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0.5 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                {expandedPanelContent(
                  testCase,
                  result,
                  expandedTab,
                  setExpandedTab,
                  onImageClick
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
