'use client'

import { GT } from '@/api'
import {
  BetterDialogCloseButton,
  BetterDialogContent,
} from '@/components/better-dialog'
import { Button } from '@/components/ui/button'
import { DialogTitle } from '@/components/ui/dialog'
import { useOrganizationContext } from '@/contexts'
import { BetterTabController, useBetterTabs } from '@/hooks/use-better-tabs'
import { cn } from '@/lib/utils'
import { useQuery } from '@apollo/client'
import { arrayNonNullable } from 'daily-code'
import { format } from 'date-fns'
import { AnimatePresence, motion } from 'framer-motion'
import {
  AlertTriangle,
  CheckCircle2,
  Copy,
  ExternalLink,
  FileText,
  XCircle,
} from 'lucide-react'
import { Fragment } from 'react'
import { toast } from 'sonner'
import { GET_SERVICES_QUERY } from '../../api/services'
import {
  getTestTypeConfig,
  normalizeTestTypeKey,
  TEST_TYPE_ORDER,
} from './test-type-config'

// ─── Types ────────────────────────────────────────────────────────────────────

type ReportStats = {
  total: number
  passed: number
  failed: number
  blocked: number
  skipped: number
  criticalFailures: number
}

type StepResult = {
  testCase: GT.TestCase
  result: GT.TestRunResult | null
}

export type TestRunReportDialogProps = {
  testRun: GT.TestRun
  stepResults: StepResult[]
  stats: ReportStats
}

type TypeStats = {
  suite: number
  exec: number
  passed: number
  failed: number
  blocked: number
  skipped: number
}

type VerdictVariant = 'go' | 'conditional' | 'nogo'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function normalizeStatus(
  status: string | null | undefined
): 'passed' | 'failed' | 'blocked' | 'skipped' {
  const s = (status ?? '').trim().toLowerCase()
  if (s === 'passed' || s === 'pass') return 'passed'
  if (s === 'failed' || s === 'fail') return 'failed'
  if (s === 'blocked') return 'blocked'
  return 'skipped'
}

function computeVerdict(
  failed: number,
  blocked: number
): { label: string; cleared: string; variant: VerdictVariant } {
  if (failed > 0)
    return { label: 'NO-GO', cleared: 'not cleared', variant: 'nogo' }
  if (blocked > 0)
    return {
      label: 'CONDITIONAL',
      cleared: 'conditionally cleared',
      variant: 'conditional',
    }
  return { label: 'GO', cleared: 'cleared', variant: 'go' }
}

function pct(passed: number, exec: number) {
  return exec === 0 ? 0 : Math.round((passed / exec) * 100)
}

function extractPlainText(notes: string | null | undefined): string {
  if (!notes) return ''
  try {
    const ops = JSON.parse(notes)
    if (Array.isArray(ops))
      return ops
        .filter((op: { insert?: unknown }) => typeof op.insert === 'string')
        .map((op: { insert: string }) => op.insert)
        .join('')
        .replace(/\n+$/, '')
        .trim()
  } catch {
    /* not JSON */
  }
  return notes.trim()
}

function buildTypeMap(stepResults: StepResult[]): Map<string, TypeStats> {
  const map = new Map<string, TypeStats>()
  for (const { testCase, result } of stepResults) {
    const key = normalizeTestTypeKey(testCase.type)
    if (!map.has(key))
      map.set(key, {
        suite: 0,
        exec: 0,
        passed: 0,
        failed: 0,
        blocked: 0,
        skipped: 0,
      })
    const d = map.get(key)!
    d.suite++
    const s = normalizeStatus(result?.status)
    if (s === 'skipped') {
      d.skipped++
    } else {
      d.exec++
      if (s === 'passed') d.passed++
      else if (s === 'failed') d.failed++
      else if (s === 'blocked') d.blocked++
    }
  }
  return map
}

function iconColorFromPill(pillClass: string) {
  return pillClass.match(/\btext-[\w]+-\d+\b/)?.[0] ?? 'text-muted-foreground'
}

// ─── Design tokens per verdict ────────────────────────────────────────────────

const V = {
  nogo: {
    banner: 'bg-red-50 border-red-200',
    accent: 'bg-red-500',
    label: 'text-red-700',
    sub: 'text-red-600',
    icon: XCircle,
    iconCls: 'text-red-500',
    iconBg: 'bg-red-100',
    badge: 'bg-red-100 text-red-800 border-red-200',
    bar: 'bg-red-400',
    sectionHeader: 'bg-red-50/60 border-red-100',
    sectionIcon: 'text-red-500',
  },
  conditional: {
    banner: 'bg-amber-50 border-amber-200',
    accent: 'bg-amber-400',
    label: 'text-amber-700',
    sub: 'text-amber-600',
    icon: AlertTriangle,
    iconCls: 'text-amber-500',
    iconBg: 'bg-amber-100',
    badge: 'bg-amber-100 text-amber-800 border-amber-200',
    bar: 'bg-amber-400',
    sectionHeader: 'bg-amber-50/60 border-amber-100',
    sectionIcon: 'text-amber-500',
  },
  go: {
    banner: 'bg-green-50 border-green-200',
    accent: 'bg-green-500',
    label: 'text-green-700',
    sub: 'text-green-600',
    icon: CheckCircle2,
    iconCls: 'text-green-500',
    iconBg: 'bg-green-100',
    badge: 'bg-green-100 text-green-800 border-green-200',
    bar: 'bg-green-500',
    sectionHeader: 'bg-green-50/60 border-green-100',
    sectionIcon: 'text-green-500',
  },
}

// ─── Verdict Banner ───────────────────────────────────────────────────────────

function VerdictBanner({
  stats,
  executed,
}: {
  stats: ReportStats
  executed: number
}) {
  const v = computeVerdict(stats.failed, stats.blocked)
  const t = V[v.variant]
  const rate = pct(stats.passed, executed)
  const barColor =
    rate >= 80 ? 'bg-green-500' : rate >= 50 ? 'bg-amber-400' : 'bg-red-500'
  const parts = [
    stats.failed > 0 && `${stats.failed} failed`,
    stats.blocked > 0 && `${stats.blocked} blocked`,
  ].filter(Boolean)

  return (
    <div className={cn('relative overflow-hidden rounded-xl border', t.banner)}>
      {/* Accent bar on left */}
      <div className={cn('absolute inset-y-0 left-0 w-1.5', t.accent)} />

      <div className="flex items-center justify-between gap-8 py-5 pr-6 pl-7">
        {/* Left: icon + verdict + description */}
        <div className="flex min-w-0 items-center gap-4">
          <div
            className={cn(
              'flex h-12 w-12 shrink-0 items-center justify-center rounded-full',
              t.iconBg
            )}
          >
            <t.icon className={cn('h-7 w-7', t.iconCls)} />
          </div>
          <div className="min-w-0">
            <p
              className={cn(
                'text-3xl leading-none font-black tracking-tight',
                t.label
              )}
            >
              {v.label}
            </p>
            <p className={cn('mt-1.5 text-sm', t.sub)}>
              {parts.length > 0 ? parts.join(' · ') + ' · ' : ''}
              Build is <span className="font-semibold">{v.cleared}</span> for
              deployment
            </p>
          </div>
        </div>

        {/* Right: stats + pass rate */}
        <div className="flex shrink-0 items-center gap-6">
          {[
            { label: 'Total', value: stats.total, color: 'text-foreground' },
            { label: 'Passed', value: stats.passed, color: 'text-green-700' },
            { label: 'Failed', value: stats.failed, color: 'text-red-700' },
            { label: 'Blocked', value: stats.blocked, color: 'text-amber-700' },
            { label: 'Skipped', value: stats.skipped, color: 'text-slate-600' },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <p
                className={cn(
                  'text-2xl leading-none font-bold tabular-nums',
                  s.color
                )}
              >
                {s.value}
              </p>
              <p className="text-muted-foreground mt-1 text-[10px] font-semibold tracking-wider uppercase">
                {s.label}
              </p>
            </div>
          ))}

          <div className="h-12 w-px bg-black/10" />

          <div className="flex flex-col items-center gap-1.5">
            <p
              className={cn(
                'text-2xl leading-none font-bold tabular-nums',
                t.label
              )}
            >
              {rate}%
            </p>
            <div className="h-1.5 w-20 overflow-hidden rounded-full bg-black/10">
              <div
                className={cn('h-full rounded-full transition-all', barColor)}
                style={{ width: `${rate}%` }}
              />
            </div>
            <p
              className={cn(
                'text-[10px] font-semibold tracking-wider uppercase',
                t.sub
              )}
            >
              Pass Rate
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Meta Strip ───────────────────────────────────────────────────────────────

function MetaStrip({
  testRun,
  serviceName,
}: {
  testRun: GT.TestRun
  serviceName: string | null
}) {
  const runId = testRun.testRunId?.slice(-8) ?? '—'
  const items = [
    { label: 'Run', value: `#${runId}`, mono: true },
    { label: 'Service', value: serviceName ?? testRun.serviceId ?? '—' },
    { label: 'Env', value: testRun.environment ?? '—' },
    {
      label: 'Runner',
      value:
        testRun.executedBy ??
        (testRun as { startedBy?: string }).startedBy ??
        '—',
    },
    {
      label: 'Date',
      value: testRun.executedAt
        ? `${format(new Date(testRun.executedAt), 'MMM d, yyyy · HH:mm')} UTC`
        : '—',
    },
  ]

  return (
    <div className="flex flex-wrap items-center gap-x-1 gap-y-2">
      {items.map((item, i) => (
        <Fragment key={item.label}>
          <div className="bg-muted/50 flex items-center gap-1.5 rounded-md px-2.5 py-1.5">
            <span className="text-muted-foreground text-[10px] font-bold tracking-wider uppercase">
              {item.label}
            </span>
            <span
              className={cn(
                'text-foreground text-xs font-medium',
                item.mono && 'font-mono'
              )}
            >
              {item.value}
            </span>
          </div>
          {i < items.length - 1 && (
            <span className="text-muted-foreground/40 text-sm select-none">
              ·
            </span>
          )}
        </Fragment>
      ))}
    </div>
  )
}

// ─── Results Table ────────────────────────────────────────────────────────────

function ResultsTable({
  testsByType,
  stats,
  executed,
}: {
  testsByType: Map<string, TypeStats>
  stats: ReportStats
  executed: number
}) {
  const totalRate = pct(stats.passed, executed)
  const totalVerdict = computeVerdict(stats.failed, stats.blocked)

  function VerdictChip({ variant }: { variant: VerdictVariant }) {
    const t = V[variant]
    return (
      <span
        className={cn(
          'rounded border px-2 py-0.5 text-[10px] font-bold tracking-wide uppercase',
          t.badge
        )}
      >
        {variant === 'nogo'
          ? 'NO-GO'
          : variant === 'conditional'
            ? 'CONDITIONAL'
            : 'GO'}
      </span>
    )
  }

  function RateBar({ rate }: { rate: number }) {
    const bar =
      rate >= 80 ? 'bg-green-500' : rate >= 50 ? 'bg-amber-400' : 'bg-red-400'
    const text =
      rate >= 80
        ? 'text-green-700'
        : rate >= 50
          ? 'text-amber-700'
          : 'text-red-600'
    return (
      <div className="flex items-center gap-2">
        <div className="bg-muted h-1.5 w-16 overflow-hidden rounded-full">
          <div
            className={cn('h-full rounded-full', bar)}
            style={{ width: `${rate}%` }}
          />
        </div>
        <span className={cn('text-xs font-semibold tabular-nums', text)}>
          {rate}%
        </span>
      </div>
    )
  }

  const rows = TEST_TYPE_ORDER.map((key) => {
    const d = testsByType.get(key)
    if (!d) return null
    const cfg = getTestTypeConfig(key)
    const Icon = cfg.icon
    const ic = iconColorFromPill(cfg.pillClass)
    const rate = pct(d.passed, d.exec)
    const v = computeVerdict(d.failed, d.blocked)
    return { key, d, cfg, Icon, ic, rate, v }
  }).filter(Boolean)

  const thCls = 'px-4 py-3 text-[10px] font-bold uppercase tracking-wider'

  return (
    <div className="overflow-hidden rounded-xl border bg-white">
      {/* Section header */}
      <div className="bg-muted/30 flex items-center justify-between border-b px-5 py-3">
        <h3 className="text-foreground text-sm font-semibold">
          Results by Type
        </h3>
        <span className="text-muted-foreground text-xs">
          {stats.total} in suite · {executed} executed · {stats.skipped} skipped
        </span>
      </div>

      <table className="w-full">
        <thead>
          <tr className="bg-muted/10 border-b">
            <th className={cn(thCls, 'text-muted-foreground text-left')}>
              Type
            </th>
            <th className={cn(thCls, 'text-muted-foreground text-center')}>
              Suite
            </th>
            <th className={cn(thCls, 'text-muted-foreground text-center')}>
              Exec
            </th>
            <th className={cn(thCls, 'text-center text-green-700')}>Pass</th>
            <th className={cn(thCls, 'text-center text-red-700')}>Fail</th>
            <th className={cn(thCls, 'text-center text-amber-700')}>Block</th>
            <th className={cn(thCls, 'text-center text-slate-600')}>Skip</th>
            <th className={cn(thCls, 'text-muted-foreground text-left')}>
              Pass %
            </th>
            <th className={cn(thCls, 'text-muted-foreground text-right')}>
              Verdict
            </th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {rows.map((r) => {
            if (!r) return null
            return (
              <tr key={r.key} className="hover:bg-muted/20 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <r.Icon className={cn('h-3.5 w-3.5 shrink-0', r.ic)} />
                    <span className="text-foreground text-sm font-medium">
                      {r.cfg.label}
                    </span>
                  </div>
                </td>
                <td className="text-muted-foreground px-4 py-3 text-center text-sm tabular-nums">
                  {r.d.suite}
                </td>
                <td className="text-muted-foreground px-4 py-3 text-center text-sm tabular-nums">
                  {r.d.exec}
                </td>
                <td className="px-4 py-3 text-center text-sm font-semibold text-green-700 tabular-nums">
                  {r.d.passed}
                </td>
                <td className="px-4 py-3 text-center text-sm font-semibold tabular-nums">
                  {r.d.failed > 0 ? (
                    <span className="text-red-700">{r.d.failed}</span>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-center text-sm font-semibold tabular-nums">
                  {r.d.blocked > 0 ? (
                    <span className="text-amber-700">{r.d.blocked}</span>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-center text-sm font-semibold tabular-nums">
                  {r.d.skipped > 0 ? (
                    <span className="text-slate-600">{r.d.skipped}</span>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <RateBar rate={r.rate} />
                </td>
                <td className="px-4 py-3 text-right">
                  <VerdictChip variant={r.v.variant} />
                </td>
              </tr>
            )
          })}
        </tbody>
        <tfoot>
          <tr className="bg-muted/20 border-t-2">
            <td className="text-foreground px-4 py-3 text-sm font-bold">
              Total
            </td>
            <td className="text-foreground px-4 py-3 text-center text-sm font-bold tabular-nums">
              {stats.total}
            </td>
            <td className="text-foreground px-4 py-3 text-center text-sm font-bold tabular-nums">
              {executed}
            </td>
            <td className="px-4 py-3 text-center text-sm font-bold text-green-700 tabular-nums">
              {stats.passed}
            </td>
            <td className="px-4 py-3 text-center text-sm font-bold text-red-700 tabular-nums">
              {stats.failed}
            </td>
            <td className="px-4 py-3 text-center text-sm font-bold text-amber-700 tabular-nums">
              {stats.blocked}
            </td>
            <td className="px-4 py-3 text-center text-sm font-bold text-slate-600 tabular-nums">
              {stats.skipped}
            </td>
            <td className="px-4 py-3">
              <RateBar rate={totalRate} />
            </td>
            <td className="px-4 py-3 text-right">
              <VerdictChip variant={totalVerdict.variant} />
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  )
}

// ─── Issues Section (Failed / Blocked) ───────────────────────────────────────

function IssuesSection({
  items,
  variant,
  runUrl,
}: {
  items: StepResult[]
  variant: 'failed' | 'blocked'
  runUrl: string
}) {
  if (items.length === 0) return null

  const isFailed = variant === 'failed'
  const SectionIcon = isFailed ? XCircle : AlertTriangle
  const headerBg = isFailed
    ? 'bg-red-50/70 border-red-100'
    : 'bg-amber-50/70 border-amber-100'
  const iconCls = isFailed ? 'text-red-500' : 'text-amber-500'
  const countCls = isFailed
    ? 'bg-red-100 text-red-700'
    : 'bg-amber-100 text-amber-700'
  const title = isFailed ? 'What Failed & Why' : "Blocked — Can't Run Yet"
  const accentBorder = isFailed ? 'border-l-red-400' : 'border-l-amber-400'
  const statusBadge = isFailed
    ? 'bg-red-50 text-red-700 border-red-200'
    : 'bg-amber-50 text-amber-700 border-amber-200'

  return (
    <div className="overflow-hidden rounded-xl border bg-white">
      <div
        className={cn(
          'flex items-center justify-between border-b px-5 py-3',
          headerBg
        )}
      >
        <div className="flex items-center gap-2">
          <SectionIcon className={cn('h-4 w-4', iconCls)} />
          <h3 className="text-foreground text-sm font-semibold">{title}</h3>
        </div>
        <span
          className={cn(
            'rounded-full px-2.5 py-0.5 text-xs font-bold tabular-nums',
            countCls
          )}
        >
          {items.length}
        </span>
      </div>

      <div className="divide-y">
        {items.map(({ testCase, result }) => {
          const cfg = getTestTypeConfig(testCase.type)
          const Icon = cfg.icon
          const ic = iconColorFromPill(cfg.pillClass)
          const testId = testCase.testCaseId?.slice(-8) ?? ''
          const notes = extractPlainText(result?.notes)

          return (
            <div
              key={testCase.testCaseId}
              className={cn('border-l-[3px] px-5 py-4', accentBorder)}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1 space-y-2">
                  {/* Badges */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span
                      className={cn(
                        'inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-[10px] font-bold tracking-wide uppercase',
                        cfg.pillClass
                      )}
                    >
                      <Icon className={cn('h-3 w-3', ic)} />
                      {cfg.label}
                    </span>
                    {testCase.isCritical && (
                      <span className="rounded border border-red-300 bg-red-50 px-1.5 py-0.5 text-[10px] font-bold tracking-wide text-red-700 uppercase">
                        Critical
                      </span>
                    )}
                    <span className="text-muted-foreground font-mono text-[10px]">
                      {testId}
                    </span>
                  </div>
                  {/* Title */}
                  <p className="text-foreground text-sm leading-snug font-semibold">
                    {testCase.title || 'Untitled'}
                  </p>
                  {/* Notes / reason */}
                  {notes && (
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      <span className="text-foreground font-medium">
                        Notes:
                      </span>{' '}
                      {notes}
                    </p>
                  )}
                  {result?.blockedReason && (
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      <span className="text-foreground font-medium">
                        Blocked by:
                      </span>{' '}
                      {result.blockedReason}
                    </p>
                  )}
                </div>

                <div className="flex shrink-0 flex-col items-end gap-3">
                  <span
                    className={cn(
                      'rounded border px-2 py-0.5 text-[10px] font-bold tracking-wide uppercase',
                      statusBadge
                    )}
                  >
                    {isFailed ? 'Failed' : 'Blocked'}
                  </span>
                  <a
                    href={runUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-xs transition-colors"
                  >
                    View <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Passed Banner ────────────────────────────────────────────────────────────

function PassedCard({ count, runUrl }: { count: number; runUrl: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 px-5 py-4">
      <CheckCircle2 className="h-5 w-5 shrink-0 text-green-600" />
      <p className="text-sm text-green-800">
        {count > 0 ? (
          <>
            <strong>
              {count} test{count !== 1 ? 's' : ''} passed
            </strong>{' '}
            — no further action required.{' '}
            <a
              href={runUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-0.5 underline underline-offset-2"
            >
              View full run log <ExternalLink className="h-3 w-3" />
            </a>
          </>
        ) : (
          'No tests passed this run.'
        )}
      </p>
    </div>
  )
}

// ─── Recommended Actions ──────────────────────────────────────────────────────

function ActionsCard({ stats }: { stats: ReportStats }) {
  const actions: { type: string; cls: string; text: string }[] = []
  if (stats.failed > 0)
    actions.push({
      type: 'Immediate',
      cls: 'bg-red-50 text-red-700 border-red-200',
      text: `Investigate and fix ${stats.failed} failed test${stats.failed > 1 ? 's' : ''}`,
    })
  if (stats.criticalFailures > 0)
    actions.push({
      type: 'Critical',
      cls: 'bg-red-50 text-red-700 border-red-200',
      text: `Address ${stats.criticalFailures} critical failure${stats.criticalFailures > 1 ? 's' : ''} before deployment`,
    })
  if (stats.blocked > 0)
    actions.push({
      type: 'Blocked',
      cls: 'bg-amber-50 text-amber-700 border-amber-200',
      text: `Resolve ${stats.blocked} blocked test${stats.blocked > 1 ? 's' : ''} and retest`,
    })
  if (actions.length === 0)
    actions.push({
      type: 'Deploy',
      cls: 'bg-green-50 text-green-700 border-green-200',
      text: 'All tests passed — build is ready for deployment',
    })

  return (
    <div className="overflow-hidden rounded-xl border bg-white">
      <div className="bg-muted/30 border-b px-5 py-3">
        <h3 className="text-foreground text-sm font-semibold">
          Recommended Actions
        </h3>
      </div>
      <div className="space-y-0 divide-y">
        {actions.map((a, i) => (
          <div key={i} className="flex items-start gap-4 px-5 py-3.5">
            <span className="bg-muted text-muted-foreground mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold">
              {i + 1}
            </span>
            <div className="flex flex-wrap items-baseline gap-2">
              <span
                className={cn(
                  'rounded border px-1.5 py-0.5 text-[10px] font-bold tracking-wide uppercase',
                  a.cls
                )}
              >
                {a.type}
              </span>
              <span className="text-foreground text-sm">{a.text}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Preview ──────────────────────────────────────────────────────────────────

function ReportPreview({
  serviceName,
  testRun,
  stepResults,
  stats,
}: {
  serviceName: string | null
  testRun: GT.TestRun
  stepResults: StepResult[]
  stats: ReportStats
}) {
  const executed = stats.total - stats.skipped
  const testsByType = buildTypeMap(stepResults)
  const failed = stepResults.filter(
    ({ result }) => normalizeStatus(result?.status) === 'failed'
  )
  const blocked = stepResults.filter(
    ({ result }) => normalizeStatus(result?.status) === 'blocked'
  )
  const runUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/services/${testRun.serviceId}/tests/runs/${testRun.testRunId}`
      : `/services/${testRun.serviceId}/tests/runs/${testRun.testRunId}`

  return (
    <div className="space-y-4 p-6">
      <VerdictBanner stats={stats} executed={executed} />
      <MetaStrip testRun={testRun} serviceName={serviceName} />
      <ResultsTable
        testsByType={testsByType}
        stats={stats}
        executed={executed}
      />
      <IssuesSection items={failed} variant="failed" runUrl={runUrl} />
      <IssuesSection items={blocked} variant="blocked" runUrl={runUrl} />
      <PassedCard count={stats.passed} runUrl={runUrl} />
      <ActionsCard stats={stats} />

      <p className="text-muted-foreground pb-2 text-[11px]">
        Generated by UIGraph · Run #{testRun.testRunId?.slice(-8) ?? '—'} ·{' '}
        {format(new Date(), 'yyyy-MM-dd HH:mm:ss')} UTC
      </p>
    </div>
  )
}

// ─── Markdown Generator ───────────────────────────────────────────────────────

function generateMarkdown(
  serviceName: string | null,
  testRun: GT.TestRun,
  stepResults: StepResult[],
  stats: ReportStats
): string {
  const rid = testRun.testRunId?.slice(-8) ?? 'Unknown'
  const svc = serviceName ?? testRun.serviceId ?? 'Unknown'
  const env = testRun.environment ?? 'Unknown'
  const runner =
    testRun.executedBy ??
    (testRun as { startedBy?: string }).startedBy ??
    'Unknown'
  const date = testRun.executedAt
    ? format(new Date(testRun.executedAt), 'MMM d, yyyy · HH:mm')
    : format(new Date(), 'MMM d, yyyy · HH:mm')
  const exec = stats.total - stats.skipped
  const v = computeVerdict(stats.failed, stats.blocked)
  const vEmoji =
    v.variant === 'nogo' ? '🔴' : v.variant === 'conditional' ? '⚠️' : '✅'
  const map = buildTypeMap(stepResults)
  const failed = stepResults.filter(
    ({ result }) => normalizeStatus(result?.status) === 'failed'
  )
  const blocked = stepResults.filter(
    ({ result }) => normalizeStatus(result?.status) === 'blocked'
  )
  const origin = typeof window !== 'undefined' ? window.location.origin : ''
  const runUrl = `${origin}/services/${testRun.serviceId}/tests/runs/${testRun.testRunId}`

  let md = `# 📋 Change Ticket — UIGraph Run #${rid}\n\n`
  md += `**Service:** ${svc}  **Env:** ${env}  **Runner:** ${runner}  **${date} UTC**\n\n`
  md += `> **${vEmoji} ${v.label}** — ${stats.failed} failed, ${stats.blocked} blocked. Build is **${v.cleared}** for deployment.\n\n`
  md += `---\n\n## 📊 Results by Type\n\n`
  md += `> ${stats.total} tests in suite — **${exec} executed**, ${stats.skipped} skipped\n\n`
  md += `| Type | Suite | Exec | ✅ Pass | ❌ Fail | ⚠️ Block | 🚫 Skip | Pass % | Verdict |\n`
  md += `| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |\n`

  for (const tk of TEST_TYPE_ORDER) {
    const d = map.get(tk)
    if (!d) continue
    const cfg = getTestTypeConfig(tk)
    const rate = pct(d.passed, d.exec)
    const rv = computeVerdict(d.failed, d.blocked)
    const rEmoji =
      rv.variant === 'nogo'
        ? '❌ NO-GO'
        : rv.variant === 'conditional'
          ? '⚠️ CONDITIONAL'
          : '✅ GO'
    md += `| ${cfg.label} | ${d.suite} | ${d.exec} | ${d.passed} | ${d.failed} | ${d.blocked} | ${d.skipped} | ${rate}% | ${rEmoji} |\n`
  }

  const tr = pct(stats.passed, exec)
  md += `| **Total** | **${stats.total}** | **${exec}** | **${stats.passed}** | **${stats.failed}** | **${stats.blocked}** | **${stats.skipped}** | **${tr}%** | **${vEmoji} ${v.label}** |\n\n`
  md += `---\n\n`

  if (failed.length > 0) {
    md += `## ❌ What Failed & Why (${failed.length})\n\n`
    for (const { testCase, result } of failed) {
      const cfg = getTestTypeConfig(testCase.type)
      const id = testCase.testCaseId?.slice(-8) ?? ''
      md += `- ❌ **[${cfg.label}] ${id} – ${testCase.title || 'Untitled'}**\n`
      if (testCase.isCritical) md += `  - **Priority:** 🔴 CRITICAL\n`
      const notes = extractPlainText(result?.notes)
      if (notes) md += `  - **Notes:** ${notes}\n`
      if (result?.blockedReason)
        md += `  - **Blocked reason:** ${result.blockedReason}\n`
      md += `  - **Details:** [View in UIGraph](${runUrl})\n\n`
    }
    md += `---\n\n`
  }

  if (blocked.length > 0) {
    md += `## 🚫 Blocked — Can't Run Yet (${blocked.length})\n\n`
    for (const { testCase, result } of blocked) {
      const cfg = getTestTypeConfig(testCase.type)
      const id = testCase.testCaseId?.slice(-8) ?? ''
      md += `- 🚫 **[${cfg.label}] ${id} – ${testCase.title || 'Untitled'}**\n`
      if (result?.blockedReason)
        md += `  - **Blocked by:** ${result.blockedReason}\n`
      md += `  - **Details:** [View step](${runUrl})\n\n`
    }
    md += `---\n\n`
  }

  md += `## ✅ Passed\n\n`
  md +=
    stats.passed > 0
      ? `✅ **${stats.passed} tests passed** — no action required. [View full run log](${runUrl})\n\n`
      : `No tests passed.\n\n`
  md += `---\n\n## 📝 Executive Summary\n\n_[Add your summary here before copying]_\n\n`
  md += `---\n\n## 🔧 Recommended Actions\n\n`

  if (stats.failed > 0 || stats.blocked > 0) {
    let n = 1
    if (stats.failed > 0) {
      md += `${n}. **[Immediate]** Fix ${stats.failed} failed test${stats.failed > 1 ? 's' : ''}\n`
      n++
    }
    if (stats.criticalFailures > 0) {
      md += `${n}. **[Critical]** Address ${stats.criticalFailures} critical failure${stats.criticalFailures > 1 ? 's' : ''} before deploy\n`
      n++
    }
    if (stats.blocked > 0) {
      md += `${n}. **[Blocked]** Resolve ${stats.blocked} blocked test${stats.blocked > 1 ? 's' : ''} and retest\n`
    }
  } else {
    md += `1. **[Deploy]** All tests passed — ready for deployment\n`
  }

  md += `\n---\n\n_Generated by UIGraph · Run #${rid} · ${format(new Date(), 'yyyy-MM-dd HH:mm:ss')} UTC_\n`
  md += `_Paste into: Jira · ServiceNow · Confluence · Slack_\n`
  return md
}

// ─── Dialog ───────────────────────────────────────────────────────────────────

export function TestRunReportDialog({
  testRun,
  stepResults,
  stats,
}: TestRunReportDialogProps) {
  const { organizationId } = useOrganizationContext()
  const { data: serviceData } = useQuery(GET_SERVICES_QUERY, {
    fetchPolicy: 'cache-first',
    variables: {
      organizationId: organizationId ?? '',
      serviceId: testRun.serviceId ?? '',
    },
    skip: !organizationId || !testRun.serviceId,
  })
  const serviceName =
    arrayNonNullable(serviceData?.v1GetServices)[0]?.name ?? null
  const [tabs, activeTab] = useBetterTabs(
    [
      { id: 'preview', label: 'Preview' },
      { id: 'markdown', label: 'Markdown' },
    ],
    'preview'
  )
  const markdown = generateMarkdown(serviceName, testRun, stepResults, stats)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(markdown)
      toast.success('Report copied to clipboard!')
    } catch {
      toast.error('Failed to copy report')
    }
  }

  return (
    <BetterDialogContent
      className="p-0"
      _headerContent={
        <div className="flex shrink-0 items-center justify-between border-b bg-white px-6 py-4">
          <div>
            <DialogTitle className="flex items-center gap-2 text-base font-semibold">
              <FileText className="h-4 w-4" />
              Test Run Report
            </DialogTitle>
            <p className="text-muted-foreground mt-0.5 text-xs">
              Run #{testRun.testRunId?.slice(-8) ?? '—'}
              {testRun.environment && ` · ${testRun.environment}`}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              preset="outline"
              onClick={handleCopy}
              className="h-10 px-3! text-xs"
            >
              <Copy className="h-3.5 w-3.5" />
              Copy Markdown
            </Button>

            <BetterDialogCloseButton />
          </div>
        </div>
      }
    >
      <div className="shrink-0 border-b bg-white px-5 pt-2 pb-3">
        <BetterTabController
          control={tabs}
          className="mx-0 w-fit bg-slate-100"
          triggerClassName="h-9 text-xs font-medium text-slate-600"
          activeTriggerClassName="text-foreground"
          overlayClassName="shadow-none"
        />
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'preview' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <ReportPreview
              serviceName={serviceName}
              testRun={testRun}
              stepResults={stepResults}
              stats={stats}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {activeTab === 'markdown' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="p-6">
              <pre className="rounded-xl border bg-slate-900 p-5 text-xs leading-relaxed break-words whitespace-pre-wrap text-slate-100">
                <code>{markdown}</code>
              </pre>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </BetterDialogContent>
  )
}
