import { Button } from '@/components/ui/button'
import {
  RECHECK_REPOSITORY_IMPORT,
  REPOSITORY_IMPORT,
  RETRY_REPOSITORY_IMPORT,
} from '@/features/github-import/api'
import { cn } from '@/lib/utils'
import { useMutation, useQuery } from '@apollo/client'
import { AlertCircle, ExternalLink, Loader2, RefreshCw } from 'lucide-react'
import { type ReactNode, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { OnboardingLayout } from './onboarding-layout'
import { OnboardingActions, OnboardingSteps } from './onboarding-ui'
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
  headerRight,
  importID,
  onFinish,
}: {
  orgID: string
  headerRight: ReactNode
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
        }, 1500)
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

  if (completed) {
    return (
      <OnboardingLayout
        headerLeftContent={<OnboardingSteps current={4} />}
        headerRightContent={headerRight}
      >
        <div className="flex flex-col items-center justify-center text-center">
          <h1 className="text-2xl font-medium tracking-tight lg:text-[1.75rem]">
            <span className="font-mono">{value?.githubRepo}</span> is on the
            graph.
          </h1>
          <p className="text-paragraph mt-3 text-sm">
            Mapped in {elapsed ?? '—'}.
          </p>
          <p className="text-paragraph mt-8 flex items-center gap-2 text-sm">
            <Loader2 className="size-4 animate-spin" /> Opening the service
          </p>
        </div>
      </OnboardingLayout>
    )
  }

  return (
    <OnboardingLayout
      headerLeftContent={<OnboardingSteps current={4} />}
      headerRightContent={headerRight}
    >
      <div className="mx-auto w-full max-w-2xl">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <div className="min-w-0">
            <h1 className="truncate font-mono text-xl">
              {value?.githubRepo ?? 'Preparing the run'}
            </h1>
            <p className="text-paragraph mt-1 text-sm">
              {failed && 'The run stopped before it finished.'}
              {!failed && 'Running on GitHub Actions. You can leave this open.'}
            </p>
          </div>
          <span className="font-mono text-sm tabular-nums">
            {elapsed ?? '0s'}
          </span>
        </div>

        {importQuery.loading && !value && (
          <p className="text-paragraph mt-8 flex items-center gap-2 text-sm">
            <Loader2 className="size-4 animate-spin" /> Loading the run
          </p>
        )}

        {value && (
          <div className="mt-6">
            <StepTimeline steps={value.steps} />

            {value.missingAIConfiguration.length > 0 && (
              <div className="mt-4 rounded-xl border border-amber-500/25 bg-amber-500/5 p-4">
                <p className="text-sm text-amber-500">
                  Waiting on{' '}
                  <span className="font-mono text-[0.75rem]">
                    {value.missingAIConfiguration.join(', ')}
                  </span>
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
              <div className="border-destructive/30 bg-destructive/5 mt-4 rounded-xl border p-4">
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

            <div className="text-paragraph mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs">
              {value.branch && (
                <span className="font-mono text-[0.6875rem]">
                  {value.branch}
                </span>
              )}
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

        {failed && (
          <div className="mt-10">
            <OnboardingActions
              primary={{
                label: 'Retry',
                onClick: () => void handleRetry(),
                loading: isRetrying,
              }}
            />
          </div>
        )}
      </div>
    </OnboardingLayout>
  )
}
