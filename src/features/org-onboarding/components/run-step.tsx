import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  REPOSITORY_IMPORT,
  RERUN_REPOSITORY_IMPORT_FAILED_JOBS,
  RETRY_REPOSITORY_IMPORT,
} from '@/features/github-import/api'
import { cn } from '@/lib/utils'
import { useMutation, useQuery } from '@apollo/client'
import {
  AlertCircle,
  ChevronDown,
  ExternalLink,
  Loader2,
  RefreshCw,
} from 'lucide-react'
import { Navigate, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { OnboardingLayout } from './onboarding-layout'
import {
  OnboardingStepTicks,
  OnboardingStepTitle,
  StepIntro,
} from './onboarding-ui'
import { RunPhaseDetail } from './run-phase-detail'
import { RunPhaseList, runPhases, TROUBLESHOOTING_URL } from './run-phases'

export function RunStep({
  orgID,
  importID,
}: {
  orgID: string
  importID: string
}) {
  const navigate = useNavigate()

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

  if (value?.status === 'COMPLETED') {
    return (
      <Navigate
        to={value.serviceId ? `/services/${value.serviceId}` : '/services'}
        replace
      />
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
      </div>
    </OnboardingLayout>
  )
}
