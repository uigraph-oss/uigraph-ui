import { Button } from '@/components/ui/button'
import {
  RECHECK_REPOSITORY_IMPORT,
  REPOSITORY_IMPORT,
  RETRY_REPOSITORY_IMPORT,
} from '@/features/github-import/api'
import { cn } from '@/lib/utils'
import { useMutation, useQuery } from '@apollo/client'
import { AnimatePresence, motion } from 'framer-motion'
import { AlertCircle, ExternalLink, Loader2, RefreshCw } from 'lucide-react'
import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { OnboardingShell } from './onboarding-shell'
import {
  isStepFailed,
  stepLabel,
  StepTimeline,
  useElapsed,
} from './step-timeline'

function isTerminalStatus(status: string) {
  return status === 'COMPLETED' || status === 'FAILED'
}

export function RunStep({
  orgID,
  teamName,
  importID,
  onFinish,
}: {
  orgID: string
  teamName: string | null
  importID: string
  onFinish: () => Promise<void>
}) {
  const navigate = useNavigate()
  const finishedRef = useRef(false)
  const [actionError, setActionError] = useState('')
  const [isPolling, setIsPolling] = useState(true)

  const importQuery = useQuery(REPOSITORY_IMPORT, {
    variables: { orgID, importID },
    fetchPolicy: 'network-only',
    pollInterval: isPolling ? 5000 : 0,
    onCompleted: (data) => {
      const value = data.repositoryImport
      setIsPolling(!isTerminalStatus(value.status))
      if (value.status !== 'COMPLETED' || finishedRef.current) return
      finishedRef.current = true
      void onFinish().then(() => {
        window.setTimeout(() => {
          void navigate(
            value.serviceId ? `/services/${value.serviceId}` : '/services'
          )
        }, 1800)
      })
    },
  })
  const [recheck, { loading: isRechecking }] = useMutation(
    RECHECK_REPOSITORY_IMPORT
  )
  const [retry, { loading: isRetrying }] = useMutation(RETRY_REPOSITORY_IMPORT)

  const value = importQuery.data?.repositoryImport ?? null
  const elapsed = useElapsed(value?.runStartedAt, value?.runCompletedAt)

  async function handleRecheck() {
    setActionError('')
    try {
      await recheck({ variables: { orgID, importID } })
      setIsPolling(true)
      await importQuery.refetch()
    } catch (caught) {
      setActionError(
        caught instanceof Error ? caught.message : 'Could not recheck the run'
      )
    }
  }

  async function handleRetry() {
    setActionError('')
    try {
      await retry({ variables: { orgID, importID } })
      setIsPolling(true)
      await importQuery.refetch()
    } catch (caught) {
      setActionError(
        caught instanceof Error ? caught.message : 'Could not retry the run'
      )
    }
  }

  const completed = value?.status === 'COMPLETED'
  const failed = value?.status === 'FAILED'
  const failedStep = value?.steps.find(isStepFailed)

  return (
    <OnboardingShell
      stepIndex={5}
      teamName={teamName}
      primary={
        failed
          ? {
              label: 'Retry',
              onClick: () => void handleRetry(),
              loading: isRetrying,
            }
          : undefined
      }
    >
      <AnimatePresence mode="wait">
        {completed && (
          <motion.div
            key="done"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex min-h-[24rem] flex-col items-center justify-center text-center"
          >
            <p className="text-success font-mono text-[0.6875rem] tracking-[0.18em] uppercase">
              Mapped in {elapsed ?? '—'}
            </p>
            <h1 className="mt-5 text-3xl font-medium tracking-tight lg:text-[2.5rem]">
              {value?.githubRepo} is on the graph.
            </h1>
            <p className="text-paragraph mt-6 flex items-center gap-2 font-mono text-[0.6875rem] tracking-[0.18em] uppercase">
              <Loader2 className="size-3.5 animate-spin" /> Opening the service
            </p>
          </motion.div>
        )}

        {!completed && (
          <motion.div key="running" exit={{ opacity: 0 }}>
            <div className="text-center">
              <p className="text-paragraph font-mono text-[0.6875rem] tracking-[0.18em] uppercase">
                {failed && 'Run stopped'}
                {!failed && 'Running on GitHub Actions'}
              </p>
              <p className="mt-4 font-mono text-5xl tracking-tight tabular-nums lg:text-6xl">
                {elapsed ?? '0s'}
              </p>
              <p className="text-paragraph mt-4 font-mono text-sm">
                {value?.githubRepo ?? 'Preparing the run'}
              </p>
            </div>

            {importQuery.loading && !value && (
              <p className="text-paragraph mt-10 flex items-center justify-center gap-2 text-sm">
                <Loader2 className="size-4 animate-spin" /> Loading the run
              </p>
            )}

            {value && (
              <div className="mx-auto mt-10 max-w-xl">
                <StepTimeline steps={value.steps} />

                {value.missingAIConfiguration.length > 0 && (
                  <div className="mt-4 rounded-2xl border border-amber-500/25 bg-amber-500/5 p-4">
                    <p className="font-mono text-[0.6875rem] tracking-[0.18em] text-amber-500 uppercase">
                      Waiting on {value.missingAIConfiguration.join(', ')}
                    </p>
                    <Button
                      preset="outline"
                      className="mt-3 h-9 rounded-[0.625rem] px-3 text-sm has-[>svg]:px-3"
                      disabled={isRechecking}
                      onClick={handleRecheck}
                    >
                      <RefreshCw
                        className={cn('size-4', isRechecking && 'animate-spin')}
                      />
                      Recheck
                    </Button>
                  </div>
                )}

                {failed && (
                  <div className="border-destructive/30 bg-destructive/5 mt-4 rounded-2xl border p-4">
                    <p className="text-destructive flex items-center gap-2 text-sm font-medium">
                      <AlertCircle className="size-4 shrink-0" />
                      {failedStep
                        ? `Failed at “${stepLabel(failedStep.name)}”`
                        : 'The run did not finish'}
                    </p>
                    <p className="text-paragraph mt-2 text-sm">
                      {value.error ??
                        'Open the Actions run for the full log, then retry.'}
                    </p>
                  </div>
                )}

                {actionError && (
                  <p className="text-destructive mt-4 text-sm">{actionError}</p>
                )}

                <div className="text-paragraph mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 font-mono text-[0.6875rem] tracking-[0.12em] uppercase">
                  {value.branch && <span>Branch {value.branch}</span>}
                  {value.runUrl && (
                    <a
                      href={value.runUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-primary inline-flex items-center gap-1.5 hover:underline"
                    >
                      Actions run <ExternalLink className="size-3" />
                    </a>
                  )}
                  {value.pullRequestUrl && (
                    <a
                      href={value.pullRequestUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-primary inline-flex items-center gap-1.5 hover:underline"
                    >
                      Pull request <ExternalLink className="size-3" />
                    </a>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </OnboardingShell>
  )
}
