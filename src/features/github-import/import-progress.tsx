import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { usePermissions } from '@/hooks/use-permissions'
import { cn } from '@/lib/utils'
import { useMutation, useQuery } from '@apollo/client'
import {
  AlertCircle,
  ArrowRight,
  CircleDot,
  ExternalLink,
  Loader2,
  PartyPopper,
  RefreshCw,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  GITHUB_APP,
  RECHECK_REPOSITORY_IMPORT,
  REPOSITORY_IMPORT,
  RETRY_REPOSITORY_IMPORT,
} from './api'
import { PipelineIllustration } from './pipeline-illustration'
import { SecretsGuidance } from './secrets-guidance'
import { compactButtonClass } from './step-layout'
import {
  isStepFailed,
  stepLabel,
  StepTimeline,
  useElapsed,
  type ImportStep,
} from './step-timeline'

const linkClass =
  'text-primary inline-flex items-center gap-1.5 text-xs hover:underline'

export function isTerminalStatus(status: string) {
  return status === 'COMPLETED' || status === 'FAILED' || status === 'CANCELLED'
}

function pipelineStage(status: string, steps: ImportStep[]) {
  if (status === 'SELECTED') return 0
  if (status === 'CHECKING_AI_CONFIGURATION') return 0
  if (status === 'WAITING_AI_CONFIGURATION') return 0
  const publishing = steps.some(
    (step) =>
      stepLabel(step.name) === 'Publishing to UIGraph' &&
      step.status.toLowerCase() !== 'queued'
  )
  if (publishing) return 2
  return 1
}

export function ImportProgress({
  orgID,
  importID,
  onCompleted,
}: {
  orgID: string
  importID: string
  onCompleted?: () => void
}) {
  const { isAdmin } = usePermissions()
  const [actionError, setActionError] = useState('')
  const [isPolling, setIsPolling] = useState(true)

  const importQuery = useQuery(REPOSITORY_IMPORT, {
    variables: { orgID, importID },
    fetchPolicy: 'network-only',
    pollInterval: isPolling ? 5000 : 0,
    onCompleted: (data) => {
      setIsPolling(!isTerminalStatus(data.repositoryImport.status))
    },
  })
  const installationQuery = useQuery(GITHUB_APP, { variables: { orgID } })
  const [recheck, { loading: isRechecking }] = useMutation(
    RECHECK_REPOSITORY_IMPORT
  )
  const [retry, { loading: isRetrying }] = useMutation(RETRY_REPOSITORY_IMPORT)

  const value = importQuery.data?.repositoryImport
  const steps = value?.steps ?? []
  const status = value?.status ?? 'SELECTED'
  const completed = status === 'COMPLETED'
  const failed = status === 'FAILED' || status === 'CANCELLED'
  const elapsed = useElapsed(value?.runStartedAt, value?.runCompletedAt)
  const failedStep = steps.find(isStepFailed)

  useEffect(() => {
    if (!completed || !onCompleted) return
    onCompleted()
  }, [completed, onCompleted])

  async function handleRecheck() {
    setActionError('')
    try {
      await recheck({ variables: { orgID, importID } })
      setIsPolling(true)
      await importQuery.refetch()
    } catch (caught) {
      setActionError(
        caught instanceof Error
          ? caught.message
          : 'Could not recheck the import'
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
        caught instanceof Error ? caught.message : 'Could not retry the import'
      )
    }
  }

  if (importQuery.loading && !value) {
    return (
      <div className="text-paragraph flex flex-1 items-center justify-center gap-2 py-16 text-sm">
        <Loader2 className="size-4 animate-spin" /> Loading import progress
      </div>
    )
  }

  if (!value) {
    return (
      <Alert variant="destructive">
        <AlertCircle />
        <AlertTitle>Could not load this import</AlertTitle>
        <AlertDescription>
          {importQuery.error?.message ?? 'The import could not be found.'}
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="flex flex-col gap-5">
      <header className="text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          {completed && 'Repository ready'}
          {failed && 'Import stopped'}
          {!completed && !failed && 'Setting up your repository'}
        </h1>
        <p className="text-paragraph mt-2 text-sm">
          <a
            href={value.repository.url}
            target="_blank"
            rel="noreferrer"
            className="hover:underline"
          >
            {value.repository.fullName}
          </a>
          {value.teamName && <> · {value.teamName}</>}
          {elapsed && <> · {elapsed}</>}
        </p>
      </header>

      <PipelineIllustration
        stage={pipelineStage(status, steps)}
        done={completed}
        failed={failed}
      />

      {completed && (
        <Alert className="border-success/25 bg-success/5">
          <PartyPopper className="text-success" />
          <AlertTitle>
            {value.repository.name} is documented in UIGraph
          </AlertTitle>
          <AlertDescription>
            <p>
              Its artifacts are live. From here, your repository keeps itself in
              sync through the workflows UIGraph added.
            </p>
            {value.serviceId && (
              <Button preset="primary" className="mt-1" asChild>
                <Link to={`/services/${value.serviceId}`}>
                  Open the service <ArrowRight />
                </Link>
              </Button>
            )}
          </AlertDescription>
        </Alert>
      )}

      {value.missingAIConfiguration.length > 0 && (
        <SecretsGuidance
          accountLogin={installationQuery.data?.githubApp?.accountLogin ?? null}
          missing={value.missingAIConfiguration}
          onRecheck={isAdmin ? handleRecheck : undefined}
          isRechecking={isRechecking}
        />
      )}

      {failed && (
        <Alert variant="destructive">
          <AlertCircle />
          <AlertTitle>
            {failedStep
              ? `Failed at “${stepLabel(failedStep.name)}”`
              : 'The import did not finish'}
          </AlertTitle>
          <AlertDescription>
            <p>
              {value.error ??
                'Open the linked Actions run for the full log, then retry.'}
            </p>
            {isAdmin && (
              <Button
                preset="outline"
                className={cn(compactButtonClass, 'mt-1')}
                disabled={isRetrying}
                onClick={handleRetry}
              >
                <RefreshCw
                  className={cn('size-4', isRetrying && 'animate-spin')}
                />
                Retry import
              </Button>
            )}
          </AlertDescription>
        </Alert>
      )}

      {actionError && (
        <Alert variant="destructive">
          <AlertCircle />
          <AlertTitle>Action failed</AlertTitle>
          <AlertDescription>{actionError}</AlertDescription>
        </Alert>
      )}

      <StepTimeline steps={steps} />

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        {!isTerminalStatus(status) && (
          <span className="text-paragraph flex items-center gap-1.5 text-xs">
            <CircleDot className="size-3 animate-pulse" /> Live from GitHub
            Actions. You can leave this page — setup continues.
          </span>
        )}
        {value.branch && (
          <a
            href={`${value.repository.url}/tree/${value.branch}`}
            target="_blank"
            rel="noreferrer"
            className={linkClass}
          >
            Branch <ExternalLink className="size-3" />
          </a>
        )}
        {value.runUrl && (
          <a
            href={value.runUrl}
            target="_blank"
            rel="noreferrer"
            className={linkClass}
          >
            Actions run <ExternalLink className="size-3" />
          </a>
        )}
        {value.pullRequestUrl && (
          <a
            href={value.pullRequestUrl}
            target="_blank"
            rel="noreferrer"
            className={linkClass}
          >
            Pull request <ExternalLink className="size-3" />
          </a>
        )}
      </div>
    </div>
  )
}
