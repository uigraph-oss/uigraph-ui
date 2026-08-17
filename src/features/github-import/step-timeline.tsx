import type { GT } from '@/api'
import { cn } from '@/lib/utils'
import { AlertCircle, Check, CircleSlash, Loader2, Minus } from 'lucide-react'
import { useEffect, useState } from 'react'

const FRIENDLY_LABELS: Record<string, string> = {
  'set up job': 'Preparing the runner',
  'run actions/checkout@v4': 'Checking out your repository',
  'run actions/setup-node@v4': 'Installing tools',
  'run actions/setup-go@v5': 'Installing tools',
  'run go install github.com/uigraph-oss/uigraph-cli@main': 'Installing tools',
  'generate repository artifacts': 'Generating artifacts',
  'restrict generated changes': 'Reviewing generated changes',
  'push generated artifacts': 'Pushing artifacts to your branch',
  'open artifact pull request': 'Opening the artifact pull request',
  sync: 'Publishing to UIGraph',
  'complete job': 'Wrapping up',
}

export function stepLabel(name: string) {
  return FRIENDLY_LABELS[name.trim().toLowerCase()] ?? name
}

export function isStepFailed(step: GT.RepositoryImportStep) {
  const conclusion = (step.conclusion ?? '').toLowerCase()
  return conclusion === 'failure' || conclusion === 'timed_out'
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

function StepDuration({ step }: { step: GT.RepositoryImportStep }) {
  const elapsed = useElapsed(step.startedAt, step.completedAt)
  if (!elapsed) return null
  return (
    <span className="text-paragraph shrink-0 text-xs tabular-nums">
      {elapsed}
    </span>
  )
}

function StepIcon({ step }: { step: GT.RepositoryImportStep }) {
  const status = step.status.toLowerCase()
  const conclusion = (step.conclusion ?? '').toLowerCase()

  if (isStepFailed(step)) {
    return <AlertCircle className="text-destructive size-4 shrink-0" />
  }
  if (conclusion === 'skipped' || conclusion === 'cancelled') {
    return <CircleSlash className="text-paragraph size-4 shrink-0" />
  }
  if (status === 'completed') {
    return <Check className="text-success size-4 shrink-0" />
  }
  if (status === 'in_progress') {
    return <Loader2 className="text-primary size-4 shrink-0 animate-spin" />
  }
  return <Minus className="text-paragraph/50 size-4 shrink-0" />
}

export function StepTimeline({ steps }: { steps: GT.RepositoryImportStep[] }) {
  if (steps.length === 0) {
    return (
      <div className="text-paragraph border-stock flex items-center justify-center gap-2 rounded-xl border border-dashed p-6 text-sm">
        <Loader2 className="size-4 animate-spin" /> Waiting for GitHub Actions
        to report the first step
      </div>
    )
  }

  return (
    <ol className="border-stock divide-stock divide-y overflow-hidden rounded-xl border">
      {steps.map((step, index) => (
        <li
          key={`${step.name}-${step.number}-${index}`}
          className={cn(
            'flex items-center gap-3 px-4 py-2.5',
            step.status.toLowerCase() === 'queued' && 'opacity-50'
          )}
        >
          <StepIcon step={step} />
          <span className="min-w-0 flex-1 truncate text-sm">
            {stepLabel(step.name)}
          </span>
          <StepDuration step={step} />
        </li>
      ))}
    </ol>
  )
}
