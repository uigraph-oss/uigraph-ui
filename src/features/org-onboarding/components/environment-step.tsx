import { Button } from '@/components/ui/button'
import { REPOSITORY_AI_CONFIGURATION } from '@/features/github-import/api'
import { cn } from '@/lib/utils'
import { NetworkStatus, useQuery } from '@apollo/client'
import { motion } from 'framer-motion'
import {
  AlertCircle,
  BookOpen,
  Check,
  Copy,
  Minus,
  RefreshCw,
  Sparkles,
} from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { OnboardingLayout } from './onboarding-layout'
import { OnboardingTeamChip } from './onboarding-team-chip'
import {
  OnboardingActions,
  OnboardingStepTicks,
  OnboardingStepTitle,
  StepIntro,
} from './onboarding-ui'

const DOCS_URL = 'https://docs.uigraph.app/self-hosting/ai-providers'

const VARIABLE_ROWS = [
  {
    names: ['AI_PROVIDER_API_KEY'],
    description: 'The key the workflow uses to call your model provider.',
  },
  {
    names: ['AI_PROVIDER_MODEL'],
    description: 'The model that reads the repository.',
  },
  {
    names: ['AI_PROVIDER_API_URL', 'AI_PROVIDER_NPM'],
    description: 'Either one: the provider endpoint, or its npm package.',
  },
]

const UIGRAPH_VARIABLES = [
  'UIGRAPH_API_URL',
  'UIGRAPH_GATEWAY_URL',
  'UIGRAPH_TOKEN',
]

function VariableName({ name }: { name: string }) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    await navigator.clipboard.writeText(name)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1500)
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={`Copy ${name}`}
      className="hover:bg-stock/50 -mx-1 inline-flex items-center gap-1.5 rounded px-1 py-0.5 font-mono text-[0.8125rem] transition-colors"
    >
      {name}
      {copied && <Check className="text-success size-3" />}
      {!copied && <Copy className="text-paragraph/70 size-3" />}
    </button>
  )
}

function ReadyMark({ delay }: { delay: number }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className="size-4">
      <motion.path
        d="M6 17 L13 24 L26 8"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="stroke-success"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.35, delay, ease: 'easeOut' }}
      />
    </svg>
  )
}

function SecretsCard({
  actions,
  children,
}: {
  actions?: ReactNode
  children: ReactNode
}) {
  return (
    <div className="border-stock bg-shading/40 mt-8 overflow-hidden rounded-xl border">
      <ul className="divide-stock divide-y">{children}</ul>
      {actions && (
        <div className="border-stock bg-shading-gray/40 flex flex-wrap items-center justify-end gap-0.5 border-t px-2.5 py-2.5">
          {actions}
        </div>
      )}
    </div>
  )
}

function DocsLink() {
  return (
    <Button
      preset="outline"
      asChild
      className="h-11 shrink-0 gap-2 rounded-[0.625rem] px-4 text-sm"
    >
      <a href={DOCS_URL} target="_blank" rel="noreferrer">
        <BookOpen className="size-4" />
        Docs
      </a>
    </Button>
  )
}

export function EnvironmentStep({
  orgID,
  owner,
  repo,
  onBack,
  onNext,
}: {
  orgID: string
  owner: string
  repo: string
  onBack: () => void
  onNext: () => Promise<void>
}) {
  const [isStarting, setIsStarting] = useState(false)
  const [startError, setStartError] = useState('')

  const configQuery = useQuery(REPOSITORY_AI_CONFIGURATION, {
    variables: { orgID, owner, repo },
    fetchPolicy: 'network-only',
    pollInterval: 5000,
    notifyOnNetworkStatusChange: true,
  })

  const isRefetching = configQuery.networkStatus === NetworkStatus.refetch

  const configuration = configQuery.data?.repositoryAIConfiguration ?? null
  const missing = configuration?.missing ?? []

  const isReady = configuration?.ready === true
  const isIncomplete = configuration?.ready === false
  const isChecking = !configuration && configQuery.loading
  const isFailed = !configuration && !configQuery.loading

  const repoName = (
    <span className="font-mono text-[0.8125rem]">
      {owner}/{repo}
    </span>
  )

  async function handleNext() {
    setIsStarting(true)
    setStartError('')
    try {
      await onNext()
    } catch (caught) {
      setIsStarting(false)
      setStartError(
        caught instanceof Error ? caught.message : 'Could not start the run'
      )
    }
  }

  return (
    <OnboardingLayout
      headerLeftContent={<OnboardingStepTitle current={2} />}
      headerCenterContent={<OnboardingStepTicks current={2} />}
      headerRightContent={<OnboardingTeamChip />}
    >
      <div className="mx-auto w-full max-w-2xl">
        <div className="flex items-center justify-between gap-6">
          <div className="min-w-0">
            {isChecking && (
              <StepIntro
                title="Checking the secrets on your repository."
                description={<>Reading the Actions secrets on {repoName}.</>}
              />
            )}

            {isReady && (
              <StepIntro
                title="Everything is ready to go."
                description={
                  <>{repoName} has every secret the workflow needs.</>
                }
              />
            )}

            {isIncomplete && (
              <StepIntro
                title="The run needs a few secrets first."
                description={<>Add them as Actions secrets on {repoName}.</>}
              />
            )}

            {isFailed && (
              <StepIntro
                title="Could not check the secrets."
                description={
                  <>Could not read the Actions secrets on {repoName}.</>
                }
              />
            )}
          </div>

          <DocsLink />
        </div>

        {isFailed && (
          <p className="text-destructive mt-3 flex items-start gap-2 text-sm">
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            {configQuery.error?.message ?? 'The check did not go through'}
          </p>
        )}

        <SecretsCard
          actions={
            isIncomplete || isFailed ? (
              <>
                <span className="text-paragraph mr-auto px-1.5 text-[0.8125rem]">
                  Not sure what to add?{' '}
                  <a
                    href={DOCS_URL}
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary hover:underline"
                  >
                    Read the setup guide
                  </a>
                </span>
                <Button
                  preset="ghost"
                  aria-label="Check again"
                  className="text-paragraph size-9 rounded-[0.625rem] p-0 has-[>svg]:px-0"
                  disabled={isRefetching}
                  onClick={() => void configQuery.refetch()}
                >
                  <RefreshCw
                    className={cn('size-4', isRefetching && 'animate-spin')}
                  />
                </Button>
                <Button
                  preset="ghost"
                  asChild
                  className="text-paragraph h-9 rounded-[0.625rem] px-3 text-[0.8125rem]"
                >
                  <a
                    href={`https://github.com/${owner}/${repo}/settings/secrets/actions`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Open GitHub settings
                  </a>
                </Button>
              </>
            ) : undefined
          }
        >
          {VARIABLE_ROWS.map((row, index) => {
            const isRowMissing = row.names.some((name) =>
              missing.includes(name)
            )

            return (
              <li
                key={row.names.join('-')}
                className={cn(
                  'flex items-start gap-3 px-4 py-3.5',
                  isRowMissing && 'bg-destructive/5'
                )}
              >
                <span className="mt-0.5 flex size-4 shrink-0 items-center justify-center">
                  {isChecking && (
                    <span className="bg-stock size-3.5 animate-pulse rounded-full" />
                  )}
                  {isFailed && <Minus className="text-paragraph/40 size-4" />}
                  {(isReady || isIncomplete) && isRowMissing && (
                    <AlertCircle className="text-destructive size-4" />
                  )}
                  {(isReady || isIncomplete) && !isRowMissing && (
                    <ReadyMark delay={index * 0.08} />
                  )}
                </span>

                <span className="min-w-0 flex-1">
                  {isChecking && (
                    <>
                      <span className="bg-stock block h-3.5 w-44 max-w-full animate-pulse rounded" />
                      <span className="bg-stock/60 mt-1.5 block h-3 w-64 max-w-full animate-pulse rounded" />
                    </>
                  )}

                  {!isChecking && (
                    <>
                      <span
                        className={cn(
                          'flex flex-wrap items-center gap-x-2',
                          isRowMissing && 'text-destructive'
                        )}
                      >
                        {row.names.map((name, nameIndex) => (
                          <span key={name} className="flex items-center gap-2">
                            {nameIndex > 0 && (
                              <span className="text-paragraph text-xs">or</span>
                            )}
                            <VariableName name={name} />
                          </span>
                        ))}
                      </span>
                      <span className="text-paragraph mt-1 block text-xs">
                        {row.description}
                      </span>
                    </>
                  )}
                </span>
              </li>
            )
          })}

          <li className="flex items-start gap-3 px-4 py-3.5">
            <span className="mt-0.5 flex size-4 shrink-0 items-center justify-center">
              <Sparkles className="text-primary/70 size-4" />
            </span>

            <span className="min-w-0 flex-1">
              <span className="flex flex-wrap items-center gap-x-2">
                {UIGRAPH_VARIABLES.map((name) => (
                  <VariableName key={name} name={name} />
                ))}
              </span>
              <span className="text-paragraph mt-1 block text-xs">
                UIGraph sets these on the repository when the import starts.
                Nothing for you to add.
              </span>
            </span>
          </li>
        </SecretsCard>

        {startError && (
          <p className="text-destructive mt-6 flex items-start gap-2 text-sm">
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            {startError}
          </p>
        )}

        <div className="mt-6">
          <OnboardingActions
            onBack={onBack}
            primary={
              isReady
                ? {
                    label: 'Go ahead',
                    onClick: handleNext,
                    loading: isStarting,
                  }
                : undefined
            }
          />
        </div>
      </div>
    </OnboardingLayout>
  )
}
