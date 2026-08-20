import { Button } from '@/components/ui/button'
import {
  REPOSITORY_IMPORT,
  RETRY_REPOSITORY_IMPORT,
} from '@/features/github-import/api'
import { cn } from '@/lib/utils'
import { useMutation, useQuery } from '@apollo/client'
import { AlertCircle, ExternalLink, Loader2, RefreshCw } from 'lucide-react'
import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { OnboardingLayout } from './onboarding-layout'
import {
  OnboardingStepTicks,
  OnboardingStepTitle,
  StepIntro,
} from './onboarding-ui'
import { RunPhaseDetail } from './run-phase-detail'
import {
  isTerminal,
  RunPhaseList,
  runPhases,
  TROUBLESHOOTING_URL,
  useElapsed,
} from './run-phases'

export function RunStep({
  orgID,
  importID,
  onFinish,
}: {
  orgID: string
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
      setIsPolling(!isTerminal(value.status))
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
  const [retry, { loading: isRetrying }] = useMutation(RETRY_REPOSITORY_IMPORT)

  const value = importQuery.data?.repositoryImport ?? null
  const elapsed = useElapsed(value?.runStartedAt, value?.runCompletedAt)

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
  const phases = runPhases(value)
  const failedPhase = phases.find((phase) => phase.status === 'failed')

  if (!value && importQuery.error) {
    return (
      <OnboardingLayout
        headerLeftContent={<OnboardingStepTitle current={3} />}
        headerCenterContent={<OnboardingStepTicks current={3} />}
      >
        <div className="mx-auto w-full max-w-2xl">
          <StepIntro
            title="Could not load the run."
            description={importQuery.error.message}
          />
          <div className="mt-6 flex items-center gap-3">
            <Button
              preset="outline"
              className="h-11 rounded-[0.625rem] px-5"
              disabled={importQuery.loading}
              onClick={() => void importQuery.refetch()}
            >
              <RefreshCw
                className={cn('size-4', importQuery.loading && 'animate-spin')}
              />
              Try again
            </Button>
            <Button
              preset="ghost"
              className="h-11 rounded-[0.625rem] px-5"
              onClick={() => void navigate('/get-started/import')}
            >
              Start over
            </Button>
          </div>
        </div>
      </OnboardingLayout>
    )
  }

  if (completed) {
    return (
      <OnboardingLayout
        headerLeftContent={<OnboardingStepTitle current={3} />}
        headerCenterContent={<OnboardingStepTicks current={3} />}
      >
        <div className="flex flex-col items-center justify-center text-center">
          <h1 className="text-2xl font-medium tracking-tight lg:text-[1.75rem]">
            <span className="font-mono break-all">{value?.githubRepo}</span> is
            on the graph.
          </h1>
          <p className="text-paragraph mt-3 text-sm">
            Imported in {elapsed ?? '—'}.
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
      headerLeftContent={<OnboardingStepTitle current={3} />}
      headerCenterContent={<OnboardingStepTicks current={3} />}
    >
      <div className="mx-auto w-full max-w-5xl">
        <StepIntro
          title={
            <>
              {failed ? 'Could not import ' : 'Importing '}
              <span className="font-mono break-all">
                {value?.githubRepo ?? 'your repository'}
              </span>
            </>
          }
          description={
            failed
              ? 'The run stopped before it finished.'
              : 'This runs on GitHub Actions and takes a few minutes. You can leave this open.'
          }
        />

        <div className="mt-10 grid gap-x-28 gap-y-8 lg:grid-cols-2 lg:items-start">
          <div className="min-w-0">
            <RunPhaseList phases={phases} />
          </div>

          <div className="min-w-0">
            <RunPhaseDetail phases={phases} />
          </div>
        </div>

        {failed && (
          <div className="border-destructive/30 bg-destructive/5 mt-10 rounded-xl border p-4">
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
              <Button
                preset="primary"
                className="h-9 rounded-[0.625rem] px-4 text-sm has-[>svg]:px-4"
                disabled={isRetrying}
                onClick={() => void handleRetry()}
              >
                {isRetrying && <Loader2 className="size-4 animate-spin" />}
                Retry run
              </Button>
              <a
                href={
                  failedPhase
                    ? failedPhase.troubleshooting
                    : TROUBLESHOOTING_URL
                }
                target="_blank"
                rel="noreferrer"
                className="text-paragraph hover:text-foreground inline-flex items-center gap-1.5 text-xs transition-colors"
              >
                What to check <ExternalLink className="size-3" />
              </a>
              {value?.runUrl && (
                <a
                  href={value.runUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-paragraph hover:text-foreground inline-flex items-center gap-1.5 text-xs transition-colors"
                >
                  Open the run log <ExternalLink className="size-3" />
                </a>
              )}
            </div>
          </div>
        )}

        {actionError && (
          <p className="text-destructive mt-4 text-sm">{actionError}</p>
        )}
      </div>
    </OnboardingLayout>
  )
}
