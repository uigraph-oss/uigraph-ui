import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { refreshOrganizations } from '@/store/auth-store'
import { useApolloClient, useMutation, useQuery } from '@apollo/client'
import {
  AlertCircle,
  ArrowRight,
  Check,
  CircleDot,
  CircleSlash,
  ExternalLink,
  KeyRound,
  Loader2,
  RefreshCw,
} from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  COMPLETE_ONBOARDING,
  RECHECK_REPOSITORY_ONBOARDING,
  REPOSITORY_ONBOARDING,
  RETRY_REPOSITORY_ONBOARDING,
} from './api'
import {
  codeClass,
  compactButtonClass,
  scrollAreaClass,
  StepBody,
  StepFooter,
  StepHeader,
} from './step-layout'

const statusIconClass =
  'mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg'

const rowLinkClass =
  'text-primary inline-flex items-center gap-1.5 text-xs hover:underline'

function isCompleted(status: string) {
  return status.toUpperCase() === 'COMPLETED'
}

function isFailed(status: string) {
  return status.toUpperCase() === 'FAILED'
}

function isCancelled(status: string) {
  return status.toUpperCase() === 'CANCELLED'
}

function isTerminal(status: string) {
  return isCompleted(status) || isFailed(status) || isCancelled(status)
}

function statusLabel(status: string) {
  if (status === 'COMPLETED') return 'Completed'
  if (status === 'FAILED') return 'Failed'
  if (status === 'CANCELLED') return 'Cancelled'
  if (status === 'SELECTED') return 'Queued'
  if (status === 'CHECKING_AI_CONFIGURATION') return 'Checking AI configuration'
  if (status === 'WAITING_AI_CONFIGURATION') return 'AI configuration required'
  if (status === 'RUN_QUEUED') return 'Run queued'
  if (status === 'RUN_RUNNING') return 'Generating and syncing'
  return status
    .toLowerCase()
    .replaceAll('_', ' ')
    .replace(/(^|\s)\S/g, (letter) => letter.toUpperCase())
}

function StatusIcon({ status }: { status: string }) {
  if (isCompleted(status)) {
    return (
      <span className={cn(statusIconClass, 'bg-success/10 text-success')}>
        <Check className="size-4" />
      </span>
    )
  }
  if (isFailed(status)) {
    return (
      <span
        className={cn(statusIconClass, 'bg-destructive/10 text-destructive')}
      >
        <AlertCircle className="size-4" />
      </span>
    )
  }
  if (isCancelled(status)) {
    return (
      <span className={cn(statusIconClass, 'bg-stock text-paragraph')}>
        <CircleSlash className="size-4" />
      </span>
    )
  }
  return (
    <span className={cn(statusIconClass, 'bg-stock text-paragraph')}>
      <Loader2 className="size-4 animate-spin" />
    </span>
  )
}

function StatusBadge({ status }: { status: string }) {
  if (isCompleted(status)) {
    return (
      <Badge variant="outline" className="border-success/30 text-success">
        {statusLabel(status)}
      </Badge>
    )
  }
  if (isFailed(status)) {
    return <Badge variant="destructive">{statusLabel(status)}</Badge>
  }
  if (isCancelled(status)) {
    return <Badge variant="secondary">{statusLabel(status)}</Badge>
  }
  return (
    <Badge variant="outline" className="text-paragraph">
      {statusLabel(status)}
    </Badge>
  )
}

export function ProgressStep({
  orgID,
  batchID,
  onRestart,
}: {
  orgID: string
  batchID: string
  onRestart: () => void
}) {
  const apolloClient = useApolloClient()
  const [pendingID, setPendingID] = useState('')
  const [actionError, setActionError] = useState('')
  const [finishError, setFinishError] = useState('')
  const [isPolling, setIsPolling] = useState(true)
  const batchQuery = useQuery(REPOSITORY_ONBOARDING, {
    variables: { orgID, batchID },
    fetchPolicy: 'network-only',
    pollInterval: isPolling ? 5000 : 0,
    onCompleted: (data) => {
      const items = data.repositoryOnboarding.repositories
      const done =
        items.length > 0 && items.every((item) => isTerminal(item.status))
      if (done) setIsPolling(false)
      if (!done) setIsPolling(true)
    },
  })
  const [completeOnboarding, { called: finishCalled }] =
    useMutation(COMPLETE_ONBOARDING)
  const [recheck] = useMutation(RECHECK_REPOSITORY_ONBOARDING)
  const [retry] = useMutation(RETRY_REPOSITORY_ONBOARDING)
  const batch = batchQuery.data?.repositoryOnboarding
  const repositories = batch?.repositories ?? []
  const completedCount = repositories.filter((item) =>
    isCompleted(item.status)
  ).length
  const attentionCount = repositories.filter(
    (item) => isFailed(item.status) || isCancelled(item.status)
  ).length
  const terminal =
    repositories.length > 0 &&
    repositories.every((item) => isTerminal(item.status))
  const allCompleted =
    repositories.length > 0 && completedCount === repositories.length

  const finishOnboarding = useCallback(async () => {
    setFinishError('')
    try {
      await completeOnboarding({ variables: { orgId: orgID } })
      await Promise.all([
        refreshOrganizations(),
        apolloClient.refetchQueries({
          include: 'active',
          onQueryUpdated: (query) => query.queryName === 'Services',
        }),
      ])
    } catch (caught) {
      setFinishError(
        caught instanceof Error
          ? caught.message
          : 'Could not finish the onboarding'
      )
    }
  }, [apolloClient, completeOnboarding, orgID])

  useEffect(() => {
    if (!allCompleted || finishCalled) return
    void finishOnboarding()
  }, [allCompleted, finishCalled, finishOnboarding])

  async function handleRecheck(onboardingID: string) {
    setPendingID(onboardingID)
    setActionError('')
    try {
      await recheck({ variables: { orgID, batchID, onboardingID } })
      await batchQuery.refetch()
    } catch (caught) {
      setActionError(
        caught instanceof Error
          ? caught.message
          : 'Could not recheck the repository'
      )
    } finally {
      setPendingID('')
    }
  }

  async function handleRetry(onboardingID: string) {
    setPendingID(onboardingID)
    setActionError('')
    try {
      await retry({ variables: { orgID, batchID, onboardingID } })
      await batchQuery.refetch()
    } catch (caught) {
      setActionError(
        caught instanceof Error
          ? caught.message
          : 'Could not retry the repository'
      )
    } finally {
      setPendingID('')
    }
  }

  const loadFailed = Boolean(batchQuery.error) && !batch
  const canRestart = loadFailed || (terminal && !allCompleted)

  function footerMessage() {
    if (loadFailed) return 'Onboarding progress is unavailable right now.'
    if (repositories.length === 0) return 'Preparing the onboarding batch.'
    if (!terminal) return 'This usually takes a few minutes.'
    if (allCompleted) return 'All repositories completed.'
    if (attentionCount === 1) return '1 repository needs your attention.'
    return `${attentionCount} repositories need your attention.`
  }

  return (
    <>
      <StepHeader
        title="Onboarding repositories"
        description="Each repository runs on its own branch. Nothing is merged into your default branch."
      />

      <StepBody>
        {batch && repositories.length > 1 && (
          <div className="shrink-0">
            <div className="flex items-center justify-between gap-3 text-xs">
              <span className="text-paragraph">
                {completedCount} of {repositories.length} completed
              </span>
              {!terminal && (
                <span className="text-paragraph flex items-center gap-1.5">
                  <CircleDot className="size-3 animate-pulse" /> Refreshing
                  every 5s
                </span>
              )}
            </div>
            <div className="bg-stock mt-2 h-1.5 w-full overflow-hidden rounded-full">
              <div
                className="bg-primary h-full rounded-full transition-all duration-500"
                style={{
                  width: `${(completedCount / repositories.length) * 100}%`,
                }}
              />
            </div>
          </div>
        )}

        {batchQuery.loading && !batch && (
          <div className="text-paragraph flex flex-1 items-center justify-center gap-2 text-sm">
            <Loader2 className="size-4 animate-spin" /> Loading onboarding
            progress
          </div>
        )}

        {batch && repositories.length === 0 && (
          <div className="text-paragraph flex flex-1 items-center justify-center gap-2 text-sm">
            <Loader2 className="size-4 animate-spin" /> Preparing repositories
          </div>
        )}

        {loadFailed && (
          <Alert variant="destructive" className="my-auto shrink-0">
            <AlertCircle />
            <AlertTitle>Could not load progress</AlertTitle>
            <AlertDescription>{batchQuery.error?.message}</AlertDescription>
          </Alert>
        )}

        {finishError && (
          <Alert variant="destructive" className="mt-4 shrink-0">
            <AlertCircle />
            <AlertTitle>Onboarding could not finish</AlertTitle>
            <AlertDescription>
              <p>{finishError}</p>
              <Button
                preset="outline"
                className={cn(compactButtonClass, 'mt-1')}
                onClick={() => void finishOnboarding()}
              >
                <RefreshCw className="size-4" /> Try again
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {actionError && (
          <Alert variant="destructive" className="mt-4 shrink-0">
            <AlertCircle />
            <AlertTitle>Action failed</AlertTitle>
            <AlertDescription>{actionError}</AlertDescription>
          </Alert>
        )}

        {repositories.length > 0 && (
          <div className={cn(scrollAreaClass, 'mt-4 space-y-3 pr-1')}>
            {repositories.map((onboarding) => (
              <article
                key={onboarding.id}
                className="border-stock flex items-start gap-3 rounded-xl border p-4"
              >
                <StatusIcon status={onboarding.status} />

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <a
                      href={onboarding.repository.url}
                      target="_blank"
                      rel="noreferrer"
                      className="truncate text-sm font-medium hover:underline"
                    >
                      {onboarding.repository.fullName}
                    </a>
                    <StatusBadge status={onboarding.status} />
                  </div>

                  <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1.5">
                    {onboarding.branch && (
                      <a
                        href={`${onboarding.repository.url}/tree/${onboarding.branch}`}
                        target="_blank"
                        rel="noreferrer"
                        className={rowLinkClass}
                      >
                        Branch <ExternalLink className="size-3" />
                      </a>
                    )}
                    {onboarding.runUrl && (
                      <a
                        href={onboarding.runUrl}
                        target="_blank"
                        rel="noreferrer"
                        className={rowLinkClass}
                      >
                        Actions run <ExternalLink className="size-3" />
                      </a>
                    )}
                    {onboarding.pullRequestUrl && (
                      <a
                        href={onboarding.pullRequestUrl}
                        target="_blank"
                        rel="noreferrer"
                        className={rowLinkClass}
                      >
                        Pull request <ExternalLink className="size-3" />
                      </a>
                    )}
                    {onboarding.serviceId && (
                      <Link
                        to={`/services/${onboarding.serviceId}`}
                        className={rowLinkClass}
                      >
                        Open service <ArrowRight className="size-3" />
                      </Link>
                    )}
                  </div>

                  {onboarding.missingAIConfiguration.length > 0 && (
                    <Alert className="mt-3 border-amber-500/25 bg-amber-500/5">
                      <KeyRound className="text-amber-500" />
                      <AlertTitle>AI configuration required</AlertTitle>
                      <AlertDescription>
                        <p>
                          Add these names to the repository or organization
                          GitHub Actions settings:
                        </p>
                        <ul className="flex flex-wrap gap-1.5">
                          {onboarding.missingAIConfiguration.map((name) => (
                            <li key={name}>
                              <code className={codeClass}>{name}</code>
                            </li>
                          ))}
                        </ul>
                        <p className="text-xs">
                          <code className={codeClass}>AI_PROVIDER_API_KEY</code>{' '}
                          must be a secret. The rest work as a secret or a
                          variable, and either{' '}
                          <code className={codeClass}>AI_PROVIDER_API_URL</code>{' '}
                          or <code className={codeClass}>AI_PROVIDER_NPM</code>{' '}
                          is enough.
                        </p>
                        <Button
                          preset="outline"
                          className={cn(compactButtonClass, 'mt-1')}
                          disabled={pendingID !== ''}
                          onClick={() => handleRecheck(onboarding.id)}
                        >
                          <RefreshCw
                            className={cn(
                              'size-4',
                              pendingID === onboarding.id && 'animate-spin'
                            )}
                          />
                          Recheck
                        </Button>
                      </AlertDescription>
                    </Alert>
                  )}

                  {isFailed(onboarding.status) && (
                    <Alert variant="destructive" className="mt-3">
                      <AlertCircle />
                      <AlertTitle>Onboarding failed</AlertTitle>
                      <AlertDescription>
                        {onboarding.error && <p>{onboarding.error}</p>}
                        {!onboarding.error && (
                          <p>
                            Try again. If it keeps failing, open the linked
                            Actions run for details.
                          </p>
                        )}
                        <Button
                          preset="outline"
                          className={cn(compactButtonClass, 'mt-1')}
                          disabled={pendingID !== ''}
                          onClick={() => handleRetry(onboarding.id)}
                        >
                          <RefreshCw
                            className={cn(
                              'size-4',
                              pendingID === onboarding.id && 'animate-spin'
                            )}
                          />
                          Retry
                        </Button>
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </StepBody>

      <StepFooter>
        <p className="text-paragraph text-xs">{footerMessage()}</p>
        {canRestart && (
          <Button
            preset="outline"
            className={cn(compactButtonClass, 'shrink-0')}
            onClick={onRestart}
          >
            Start over
          </Button>
        )}
        {allCompleted && (
          <span className="text-paragraph flex shrink-0 items-center gap-2 text-xs">
            <Loader2 className="size-3.5 animate-spin" /> Finishing
          </span>
        )}
      </StepFooter>
    </>
  )
}
