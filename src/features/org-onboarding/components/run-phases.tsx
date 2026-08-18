import type { GT } from '@/api'
import { cn } from '@/lib/utils'
import { AlertCircle, Check, Loader2, Minus } from 'lucide-react'
import { useEffect, useState } from 'react'
import {
  LuCloudUpload,
  LuFlag,
  LuGitBranchPlus,
  LuGitCommitVertical,
  LuPackage,
  LuScanSearch,
  LuServer,
} from 'react-icons/lu'

const PHASES = [
  {
    label: 'Creating Branch',
    icon: LuGitBranchPlus,
    summary: 'UIGraph is opening a branch of its own on your repository.',
    note: 'Your default branch is left alone. Everything from here happens on that branch.',
    failureHint:
      'The branch could not be created. Check that UIGraph is still connected here, then retry.',
  },
  {
    label: 'Preparing',
    icon: LuServer,
    summary:
      'GitHub is starting a fresh machine and putting your repository on it.',
    note: 'Everything runs on your own runners, so your code never leaves GitHub.',
    failureHint:
      'The run could not start. Check that GitHub Actions is enabled here, then retry.',
  },
  {
    label: 'Installing',
    icon: LuPackage,
    summary: 'The tools that read your repository are going into place.',
    note: 'This part is quick, and usually takes well under a minute.',
    failureHint:
      'The tools could not be installed. This is usually temporary, so a retry often clears it.',
  },
  {
    label: 'Generating',
    icon: LuScanSearch,
    summary:
      'Your pages, components, and API calls are being read to work out how they connect.',
    note: 'This is the longest step of the run, and normally takes a few minutes.',
    failureHint:
      'Your repository could not be read through. Check your AI provider settings, then retry.',
  },
  {
    label: 'Wrapping Up',
    icon: LuGitCommitVertical,
    summary:
      'What was found is being checked and saved back to your repository.',
    note: 'It sits alongside your code, so the graph stays in step as your code changes.',
    failureHint:
      'The results could not be saved back. Check that UIGraph can write to this repository, then retry.',
  },
  {
    label: 'Uploading to UIGraph',
    icon: LuCloudUpload,
    summary: 'Your graph is being sent to UIGraph and put together.',
    note: 'Pages, components, services, and every link between them.',
    failureHint:
      'The run could not reach UIGraph. Check this repository’s UIGraph connection, then retry.',
  },
  {
    label: 'Finishing Up',
    icon: LuFlag,
    summary: 'The last checks are running.',
    note: 'Your service opens on the graph as soon as they pass.',
    failureHint:
      'The run did not close out cleanly. Retry, or open the run log to see what happened.',
  },
]

const ARTIFACT_PHASE_BY_STEP: Record<string, number> = {
  'set up job': 1,
  'run actions/checkout@v4': 1,
  'run actions/setup-node@v4': 2,
  'generate repository artifacts': 3,
  'restrict generated changes': 4,
  'push generated artifacts': 4,
}

const SYNC_PHASE_BY_STEP: Record<string, number> = {
  'set up job': 5,
  'run actions/checkout@v4': 5,
  'run actions/setup-go@v5': 5,
  'run go install github.com/uigraph-oss/uigraph-cli@main': 5,
  sync: 5,
  'complete job': 6,
}

type RunPhaseStatus = 'pending' | 'active' | 'done' | 'failed' | 'skipped'

export type RunPhase = (typeof PHASES)[number] & {
  status: RunPhaseStatus
  startedAt: string | null
  completedAt: string | null
}

type RunImport = {
  status: string
  steps: GT.RepositoryImportStep[]
  createdAt: string
  runStartedAt?: string | null
}

function hasRunStarted(status: string) {
  return (
    status === 'RUN_QUEUED' ||
    status === 'RUN_RUNNING' ||
    status === 'COMPLETED' ||
    status === 'FAILED'
  )
}

export function runPhases(value: RunImport | null): RunPhase[] {
  const tracked = PHASES.map(() => ({
    running: false,
    completed: false,
    failed: false,
    startedAt: null as string | null,
    completedAt: null as string | null,
  }))

  const steps = value?.steps ?? []
  const isRunning = value === null || !isTerminal(value.status)
  const blocked = value?.status === 'WAITING_AI_CONFIGURATION'

  if (value === null) tracked[0].running = true
  else if (value.status === 'FAILED' && steps.length === 0)
    tracked[0].failed = true
  else if (hasRunStarted(value.status)) tracked[0].completed = true
  else if (!blocked) tracked[0].running = true

  let jobIndex = 0
  let previousNumber = 0

  for (const step of steps) {
    if (step.number <= previousNumber) jobIndex += 1
    previousNumber = step.number

    const name = step.name.trim().toLowerCase()
    const index =
      jobIndex === 0 ? ARTIFACT_PHASE_BY_STEP[name] : SYNC_PHASE_BY_STEP[name]
    if (index === undefined) continue

    const status = step.status.toLowerCase()
    const conclusion = (step.conclusion ?? '').toLowerCase()
    const phase = tracked[index]

    if (
      conclusion === 'failure' ||
      conclusion === 'timed_out' ||
      conclusion === 'cancelled'
    )
      phase.failed = true
    if (status === 'in_progress') phase.running = true
    if (status === 'completed') phase.completed = true
    if (step.startedAt && !phase.startedAt) phase.startedAt = step.startedAt
    if (step.completedAt) phase.completedAt = step.completedAt
  }

  let failedIndex = tracked.findIndex((phase) => phase.failed)

  let reached = -1
  tracked.forEach((phase, index) => {
    if (phase.running || phase.completed || phase.failed) reached = index
  })

  if (value?.status === 'FAILED' && failedIndex === -1) {
    failedIndex = reached === -1 ? 0 : reached
    tracked[failedIndex].failed = true
  }
  if (failedIndex !== -1) reached = failedIndex

  const phases = PHASES.map((phase, index) => {
    const state = tracked[index]
    let status: RunPhaseStatus = 'pending'
    if (failedIndex !== -1 && index > failedIndex) status = 'skipped'
    else if (state.failed) status = 'failed'
    else if (index < reached) status = 'done'
    else if (state.running) status = 'active'
    else if (state.completed) status = 'done'

    return {
      ...phase,
      status,
      startedAt: state.startedAt,
      completedAt: status === 'active' ? null : state.completedAt,
    }
  })

  const settled = phases.some(
    (phase) => phase.status === 'active' || phase.status === 'failed'
  )
  if (isRunning && !blocked && !settled) {
    const next = phases.find((phase) => phase.status === 'pending')
    if (next) next.status = 'active'
  }

  return phases
}

export function isTerminal(status: string) {
  return status === 'COMPLETED' || status === 'FAILED'
}

export function currentRunPhase(phases: RunPhase[]) {
  const failed = phases.findIndex((phase) => phase.status === 'failed')
  if (failed !== -1) return failed
  const active = phases.findIndex((phase) => phase.status === 'active')
  if (active !== -1) return active
  const pending = phases.findIndex((phase) => phase.status === 'pending')
  if (pending !== -1) return pending
  return phases.length - 1
}

function formatElapsed(milliseconds: number) {
  const total = Math.max(0, Math.floor(milliseconds / 1000))
  const minutes = Math.floor(total / 60)
  const seconds = total % 60
  if (minutes === 0) return `${seconds}s`
  return `${minutes}m ${String(seconds).padStart(2, '0')}s`
}

export function useElapsed(startedAt?: string | null, endedAt?: string | null) {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    if (!startedAt || endedAt) return
    const timer = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(timer)
  }, [startedAt, endedAt])

  if (!startedAt) return null
  const start = new Date(startedAt).getTime()
  const end = endedAt ? new Date(endedAt).getTime() : now
  return formatElapsed(end - start)
}

function PhaseDuration({ phase }: { phase: RunPhase }) {
  const elapsed = useElapsed(phase.startedAt, phase.completedAt)
  if (phase.status === 'pending' || phase.status === 'skipped') return null
  if (phase.status !== 'active' && !phase.completedAt) return null
  if (!elapsed) return null
  return (
    <span className="text-paragraph shrink-0 font-mono text-[0.6875rem] tabular-nums">
      {elapsed}
    </span>
  )
}

function PhaseMarker({ phase }: { phase: RunPhase }) {
  const Icon = phase.icon

  return (
    <span
      className={cn(
        'relative z-10 flex size-7 shrink-0 items-center justify-center rounded-full border transition-colors',
        phase.status === 'done' && 'border-primary/40 bg-primary/10',
        phase.status === 'active' && 'border-primary bg-primary/15',
        phase.status === 'failed' && 'border-destructive/50 bg-destructive/10',
        phase.status === 'pending' && 'border-stock bg-shading-gray',
        phase.status === 'skipped' && 'border-stock/60 bg-shading-gray'
      )}
    >
      {phase.status === 'done' && <Check className="text-primary size-3.5" />}
      {phase.status === 'active' && (
        <Loader2 className="text-primary size-3.5 animate-spin" />
      )}
      {phase.status === 'failed' && (
        <AlertCircle className="text-destructive size-3.5" />
      )}
      {phase.status === 'pending' && (
        <Icon className="text-paragraph/40 size-3.5" />
      )}
      {phase.status === 'skipped' && (
        <Minus className="text-paragraph/30 size-3.5" />
      )}
    </span>
  )
}

export function RunPhaseList({ phases }: { phases: RunPhase[] }) {
  return (
    <ol className="flex flex-col">
      {phases.map((phase, index) => (
        <li
          key={phase.label}
          className="relative flex h-12 items-center gap-3.5"
        >
          {index < phases.length - 1 && (
            <span
              className={cn(
                'absolute top-1/2 left-[0.875rem] h-[calc(100%-1.75rem)] w-px -translate-x-1/2 translate-y-[0.875rem] transition-colors',
                phase.status === 'done' && 'bg-primary/30',
                phase.status !== 'done' && 'bg-stock'
              )}
            />
          )}

          <PhaseMarker phase={phase} />

          <div className="flex min-w-0 flex-1 items-baseline justify-between gap-3">
            <span
              className={cn(
                'text-sm transition-colors',
                phase.status === 'active' && 'text-foreground font-medium',
                phase.status === 'failed' && 'text-destructive font-medium',
                phase.status === 'done' && 'text-foreground',
                phase.status === 'pending' && 'text-paragraph/70',
                phase.status === 'skipped' && 'text-paragraph/40'
              )}
            >
              {phase.label}
            </span>
            <PhaseDuration phase={phase} />
          </div>
        </li>
      ))}
    </ol>
  )
}
