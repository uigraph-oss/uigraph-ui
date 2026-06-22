'use client'

import { GT } from '@/api'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { ArrowLeft, Download, FileText, Play } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'

export type DisplayRunStatus =
  | 'running'
  | 'passed'
  | 'failed'
  | 'issues'
  | 'aborted'
  | 'none'

export type StatusFilter = 'all' | 'passed' | 'failed' | 'blocked' | 'skipped'

type RunStats = {
  total: number
  passed: number
  failed: number
  blocked: number
  skipped: number
  criticalFailures?: number
}

type RunDetailsHeaderProps = {
  testRun: GT.TestRun
  displayRunStatus?: DisplayRunStatus
  stats?: RunStats | null
  onReRunFailed?: () => void
  onExportResults?: () => void
  onReport?: () => void
}

function getStatusPillProps(displayRunStatus: DisplayRunStatus): {
  label: string
  className: string
} {
  switch (displayRunStatus) {
    case 'running':
      return {
        label: 'RUNNING',
        className:
          'border-blue-500/50 bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-300',
      }
    case 'passed':
      return {
        label: 'PASSED',
        className:
          'border-green-500/50 bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-300',
      }
    case 'failed':
      return {
        label: 'FAILED',
        className:
          'border-red-500/50 bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-300',
      }
    case 'issues':
    case 'aborted':
      return {
        label: displayRunStatus === 'aborted' ? 'ABORTED' : 'ISSUES',
        className:
          'border-amber-500/50 bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-300',
      }
    case 'none':
    default:
      return {
        label: '—',
        className: 'border-border bg-muted/50 text-muted-foreground',
      }
  }
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return s > 0 ? `${m}m ${s}s` : `${m}m`
}

export function RunDetailsHeader({
  testRun,
  displayRunStatus = 'none',
  stats,
  onReRunFailed,
  onExportResults,
  onReport,
}: RunDetailsHeaderProps) {
  const navigate = useNavigate()
  const params = useParams() as { serviceId?: string }
  const statusPill = getStatusPillProps(displayRunStatus)
  const hasStats = stats && stats.total > 0
  const executed = hasStats ? stats.total - stats.skipped : 0
  const successRatePct =
    executed > 0 && hasStats ? Math.round((stats.passed / executed) * 100) : 0

  const runIdShort = testRun.testRunId?.slice(-8) ?? '—'

  const durationSec =
    testRun.startedAt && testRun.completedAt
      ? Math.round(
          (new Date(testRun.completedAt).getTime() -
            new Date(testRun.startedAt).getTime()) /
            1000
        )
      : null
  const triggeredBy =
    (testRun as { executedBy?: string; startedBy?: string }).executedBy ??
    (testRun as { startedBy?: string }).startedBy ??
    '—'

  const metaItems = [
    { label: 'RUN ID', value: runIdShort },
    {
      label: 'STATUS',
      value: statusPill.label,
      valueClassName: statusPill.className,
    },
    { label: 'ENVIRONMENT', value: testRun.environment ?? '—' },
    { label: 'BRANCH', value: testRun.releaseLabel ?? '—' },
    {
      label: 'TRIGGERED',
      value: testRun.executedAt
        ? format(new Date(testRun.executedAt), 'MMM d, yyyy')
        : '—',
    },
    {
      label: 'DURATION',
      value: durationSec != null ? formatDuration(durationSec) : '—',
    },
    { label: 'TRIGGERED BY', value: triggeredBy },
  ]

  return (
    <div className="w-full space-y-4">
      {/* Meta strip: run id, status, context + actions */}
      <div className="border-border flex flex-wrap items-center justify-between gap-4 rounded-xl border bg-[#141925] px-5 py-3.5">
        <div className="flex flex-wrap gap-8">
          {metaItems.map(({ label, value, valueClassName }) => (
            <div key={label}>
              <p className="text-muted-foreground mb-0.5 text-[10px] font-semibold tracking-wider uppercase">
                {label}
              </p>
              <p
                className={cn(
                  'text-sm font-medium',
                  valueClassName
                    ? cn(
                        'rounded border px-1.5 py-0.5 text-[11px] font-bold tracking-wide',
                        valueClassName
                      )
                    : 'text-foreground font-mono'
                )}
              >
                {value}
              </p>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {onReRunFailed && (
            <Button preset="outline" size="sm" onClick={onReRunFailed}>
              <Play className="mr-1 h-3.5 w-3.5" />
              Re-run Failed
            </Button>
          )}
          {onExportResults && (
            <Button preset="primary" size="sm" onClick={onExportResults}>
              <Download className="mr-1 h-3.5 w-3.5" />
              Export
            </Button>
          )}
          {onReport && (
            <Button preset="outline" size="sm" onClick={onReport}>
              <FileText className="mr-1 h-3.5 w-3.5" />
              Report
            </Button>
          )}
          <Button
            preset="outline"
            size="sm"
            onClick={() =>
              navigate(
                `/services/${params.serviceId}/tests?packId=${testRun.testPackId ?? ''}&tab=runs`
              )
            }
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to Runs
          </Button>
        </div>
      </div>

      {/* Stat cards grid: Total, Passed, Failed, Blocked, Skipped */}
      {hasStats && (
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-5">
          <div className="border-border rounded-xl border bg-[#141925] px-4 py-4">
            <p className="text-muted-foreground mb-2 text-[10px] font-semibold tracking-wider uppercase">
              TOTAL TESTS
            </p>
            <p className="text-foreground text-2xl font-bold tabular-nums">
              {stats.total}
            </p>
            <p className="text-muted-foreground mt-1 text-[11px]">
              {executed} executed · {stats.skipped} skipped
            </p>
          </div>
          <div className="border-border rounded-xl border bg-[#141925] px-4 py-4">
            <p className="text-muted-foreground mb-2 text-[10px] font-semibold tracking-wider uppercase">
              PASSED
            </p>
            <p className="text-2xl font-bold text-green-600 tabular-nums dark:text-green-400">
              {stats.passed}
            </p>
            <p className="text-muted-foreground mt-1 text-[11px]">
              {successRatePct}% pass rate
            </p>
          </div>
          <div className="border-border rounded-xl border bg-[#141925] px-4 py-4">
            <p className="text-muted-foreground mb-2 text-[10px] font-semibold tracking-wider uppercase">
              FAILED
            </p>
            <p className="text-2xl font-bold text-red-600 tabular-nums dark:text-red-400">
              {stats.failed}
            </p>
            <p className="text-muted-foreground mt-1 text-[11px]">
              {(stats.criticalFailures ?? 0) > 0
                ? `${stats.criticalFailures} critical`
                : 'need attention'}
            </p>
          </div>
          <div className="border-border rounded-xl border bg-[#141925] px-4 py-4">
            <p className="text-muted-foreground mb-2 text-[10px] font-semibold tracking-wider uppercase">
              BLOCKED
            </p>
            <p className="text-2xl font-bold text-amber-600 tabular-nums dark:text-amber-400">
              {stats.blocked}
            </p>
            <p className="text-muted-foreground mt-1 text-[11px]">
              {stats.blocked === 1 ? '1 dependency' : 'dependencies'}
            </p>
          </div>
          <div className="border-border rounded-xl border bg-[#141925] px-4 py-4">
            <p className="text-muted-foreground mb-2 text-[10px] font-semibold tracking-wider uppercase">
              SKIPPED
            </p>
            <p className="text-2xl font-bold text-[#828DA3] tabular-nums dark:text-[#586378]">
              {stats.skipped}
            </p>
            <p className="text-muted-foreground mt-1 text-[11px]">
              {stats.skipped === 1 ? '1 test skipped' : 'tests skipped'}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
