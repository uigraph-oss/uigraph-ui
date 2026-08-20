import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { RunPhaseFigure } from '@/features/org-onboarding/components/run-phase-figure'
import {
  currentRunPhase,
  runPhases,
  TROUBLESHOOTING_URL,
  useElapsed,
  type RunPhase,
} from '@/features/org-onboarding/components/run-phases'
import { cn } from '@/lib/utils'
import { useMutation, useQuery } from '@apollo/client'
import { AnimatePresence, motion } from 'framer-motion'
import {
  AlertCircle,
  ArrowRight,
  Check,
  ChevronDown,
  Clock,
  ExternalLink,
  Loader2,
  Minus,
  RefreshCw,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import {
  REPOSITORY_IMPORT,
  RERUN_REPOSITORY_IMPORT_FAILED_JOBS,
  RETRY_REPOSITORY_IMPORT,
} from './api'

function PhaseDuration({ phase }: { phase: RunPhase }) {
  const elapsed = useElapsed(phase.startedAt, phase.completedAt)
  if (phase.status === 'pending' || phase.status === 'skipped') return null
  if (phase.status !== 'active' && !phase.completedAt) return null
  if (!elapsed) return null
  return (
    <span className="text-paragraph shrink-0 font-mono text-[0.625rem] tabular-nums">
      {elapsed}
    </span>
  )
}

function PhaseList({ phases }: { phases: RunPhase[] }) {
  return (
    <ol className="flex flex-col">
      {phases.map((phase, index) => {
        const Icon = phase.icon

        return (
          <li
            key={phase.label}
            className="relative flex h-9 items-center gap-3"
          >
            {index < phases.length - 1 && (
              <span
                className={cn(
                  'absolute top-1/2 left-3 h-[calc(100%-1.5rem)] w-px -translate-x-1/2 translate-y-3 transition-colors',
                  phase.status === 'done' && 'bg-primary/30',
                  phase.status !== 'done' && 'bg-stock'
                )}
              />
            )}

            <span
              className={cn(
                'relative z-10 flex size-6 shrink-0 items-center justify-center rounded-full border transition-colors',
                phase.status === 'done' && 'border-primary/40 bg-primary/10',
                phase.status === 'active' && 'border-primary bg-primary/15',
                phase.status === 'failed' &&
                  'border-destructive/50 bg-destructive/10',
                phase.status === 'pending' && 'border-stock bg-shading-gray',
                phase.status === 'skipped' && 'border-stock/60 bg-shading-gray'
              )}
            >
              {phase.status === 'done' && (
                <Check className="text-primary size-3" />
              )}
              {phase.status === 'active' && (
                <Loader2 className="text-primary size-3 animate-spin" />
              )}
              {phase.status === 'failed' && (
                <AlertCircle className="text-destructive size-3" />
              )}
              {phase.status === 'pending' && (
                <Icon className="text-paragraph/40 size-3" />
              )}
              {phase.status === 'skipped' && (
                <Minus className="text-paragraph/30 size-3" />
              )}
            </span>

            <div className="flex min-w-0 flex-1 items-baseline justify-between gap-3">
              <span
                className={cn(
                  'text-[0.8125rem] transition-colors',
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
        )
      })}
    </ol>
  )
}

function PhaseDetail({ phases }: { phases: RunPhase[] }) {
  const index = currentRunPhase(phases)
  const phase = phases[index]
  const next = phases[index + 1]
  const failed = phase.status === 'failed'
  const running = phase.status === 'active'

  return (
    <div className="border-stock bg-shading/40 flex h-full flex-col rounded-xl border p-4">
      <AnimatePresence mode="wait">
        <motion.div
          key={`${phase.label}-${String(failed)}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          className="h-24 shrink-0"
        >
          <RunPhaseFigure index={index} running={running} failed={failed} />
        </motion.div>
      </AnimatePresence>

      <AnimatePresence mode="wait">
        <motion.div
          key={phase.label}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          className="mt-4"
        >
          <p className="text-[0.8125rem] leading-relaxed">{phase.summary}</p>
          <p className="text-paragraph mt-2 text-[0.8125rem] leading-relaxed">
            {failed ? phase.failureHint : phase.note}
          </p>
        </motion.div>
      </AnimatePresence>

      <p className="text-paragraph mt-auto flex items-center gap-2 pt-4 text-xs">
        {failed && <AlertCircle className="size-3.5 shrink-0" />}
        {!failed && running && <ArrowRight className="size-3.5 shrink-0" />}
        {!failed && !running && <Clock className="size-3.5 shrink-0" />}
        {failed && 'Run stopped'}
        {!failed && running && `Next: ${next ? next.label : 'Your graph'}`}
        {!failed && !running && 'Waiting to start'}
      </p>
    </div>
  )
}

export function ImportRunStep({
  orgID,
  importID,
  onOpenService,
}: {
  orgID: string
  importID: string
  onOpenService: () => void
}) {
  const importQuery = useQuery(REPOSITORY_IMPORT, {
    variables: { orgID, importID },
    fetchPolicy: 'network-only',
    pollInterval: 5000,
  })
  const [retry, { loading: isRetrying }] = useMutation(RETRY_REPOSITORY_IMPORT)
  const [rerunFailedJobs, { loading: isRerunning }] = useMutation(
    RERUN_REPOSITORY_IMPORT_FAILED_JOBS
  )

  const value = importQuery.data?.repositoryImport ?? null
  const elapsed = useElapsed(value?.runStartedAt, value?.runCompletedAt)

  async function handleRetry() {
    try {
      await retry({ variables: { orgID, importID } })
      await importQuery.refetch()
    } catch (caught) {
      toast.error('Could not start a new run', {
        description: caught instanceof Error ? caught.message : undefined,
      })
    }
  }

  async function handleRerunFailedJobs() {
    try {
      await rerunFailedJobs({ variables: { orgID, importID } })
      await importQuery.refetch()
    } catch (caught) {
      toast.error('Could not re-run the failed jobs', {
        description: caught instanceof Error ? caught.message : undefined,
      })
    }
  }

  if (!value && importQuery.error) {
    return (
      <div>
        <h2 className="text-lg font-medium tracking-tight">
          Could not load the run.
        </h2>
        <p className="text-paragraph mt-1.5 text-sm leading-relaxed">
          {importQuery.error.message}
        </p>
        <Button
          preset="outline"
          className="mt-5 h-9 rounded-[0.625rem] px-4 text-sm has-[>svg]:px-4"
          disabled={importQuery.loading}
          onClick={() => void importQuery.refetch()}
        >
          <RefreshCw
            className={cn('size-4', importQuery.loading && 'animate-spin')}
          />
          Try again
        </Button>
      </div>
    )
  }

  const completed = value?.status === 'COMPLETED'
  const failed = value?.status === 'FAILED'
  const phases = runPhases(value)
  const failedPhase = phases.find((phase) => phase.status === 'failed')

  if (completed) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <span className="border-success/40 bg-success/10 text-success flex size-11 items-center justify-center rounded-full border">
          <Check className="size-5" />
        </span>
        <h2 className="mt-5 text-lg font-medium tracking-tight">
          <span className="font-mono break-all">{value.githubRepo}</span> is on
          the graph.
        </h2>
        <p className="text-paragraph mt-1.5 text-sm">
          Imported in {elapsed ?? '—'}.
        </p>
        {value.serviceId && (
          <Button preset="primary" className="mt-6" asChild>
            <Link to={`/services/${value.serviceId}`} onClick={onOpenService}>
              Open the service <ArrowRight />
            </Link>
          </Button>
        )}
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-lg font-medium tracking-tight">
        {failed ? 'Could not import ' : 'Importing '}
        <span className="font-mono break-all">
          {value?.githubRepo ?? 'your repository'}
        </span>
      </h2>
      <p className="text-paragraph mt-1.5 text-sm leading-relaxed">
        {failed && 'The run stopped before it finished.'}
        {!failed &&
          'This runs on GitHub Actions and takes a few minutes. You can close this and come back.'}
      </p>

      <div className="mt-5 grid gap-x-8 gap-y-5 sm:grid-cols-2 sm:items-stretch">
        <PhaseList phases={phases} />
        <PhaseDetail phases={phases} />
      </div>

      {failed && (
        <div className="border-destructive/30 bg-destructive/5 mt-5 rounded-xl border p-4">
          <p className="text-destructive flex items-center gap-2 text-sm font-medium">
            <AlertCircle className="size-4 shrink-0" />
            {failedPhase
              ? `Failed while ${failedPhase.label.toLowerCase()}`
              : 'The run did not finish'}
          </p>
          <p className="text-paragraph mt-2 text-sm leading-relaxed">
            {value?.error ?? 'The run stopped before it could finish.'}
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-5">
            {value?.runUrl && (
              <div className="flex items-center">
                <Button
                  preset="primary"
                  className="h-9 rounded-l-[0.625rem] rounded-r-none px-4 text-sm has-[>svg]:px-4"
                  disabled={isRetrying || isRerunning}
                  onClick={() => void handleRerunFailedJobs()}
                >
                  {(isRetrying || isRerunning) && (
                    <Loader2 className="size-4 animate-spin" />
                  )}
                  {!isRetrying && !isRerunning && (
                    <RefreshCw className="size-4" />
                  )}
                  Retry failed jobs
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      preset="primary"
                      aria-label="More retry options"
                      disabled={isRetrying || isRerunning}
                      className="border-primary-foreground/5 h-9 rounded-l-none rounded-r-[0.625rem] border-l px-2 has-[>svg]:px-2"
                    >
                      <ChevronDown className="size-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" sideOffset={6}>
                    <DropdownMenuItem onSelect={() => void handleRetry()}>
                      <RefreshCw className="size-4" />
                      Start a new run
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
            {!value?.runUrl && (
              <Button
                preset="primary"
                className="h-9 rounded-[0.625rem] px-4 text-sm has-[>svg]:px-4"
                disabled={isRetrying}
                onClick={() => void handleRetry()}
              >
                {isRetrying && <Loader2 className="size-4 animate-spin" />}
                {!isRetrying && <RefreshCw className="size-4" />}
                Retry run
              </Button>
            )}
            <a
              href={
                failedPhase ? failedPhase.troubleshooting : TROUBLESHOOTING_URL
              }
              target="_blank"
              rel="noreferrer"
              className="text-paragraph hover:text-foreground inline-flex items-center gap-1.5 text-xs transition-colors"
            >
              What to check <ExternalLink className="size-3" />
            </a>
          </div>
        </div>
      )}

      {value?.runUrl && (
        <a
          href={value.runUrl}
          target="_blank"
          rel="noreferrer"
          className="text-paragraph hover:text-foreground mt-5 inline-flex items-center gap-1.5 text-xs transition-colors"
        >
          Open the run log <ExternalLink className="size-3" />
        </a>
      )}
    </div>
  )
}
