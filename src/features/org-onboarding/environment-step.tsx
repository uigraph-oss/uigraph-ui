import { Button } from '@/components/ui/button'
import {
  GITHUB_APP,
  REPOSITORY_AI_CONFIGURATION,
} from '@/features/github-import/api'
import { cn } from '@/lib/utils'
import { useQuery } from '@apollo/client'
import {
  AlertCircle,
  Check,
  Copy,
  ExternalLink,
  Loader2,
  RefreshCw,
} from 'lucide-react'
import { useState } from 'react'
import { OnboardingShell, StepIntro } from './onboarding-shell'

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

function secretsSettingsURL(accountLogin: string | null) {
  if (!accountLogin) return 'https://github.com/settings/secrets/actions'
  return `https://github.com/organizations/${accountLogin}/settings/secrets/actions`
}

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

export function EnvironmentStep({
  orgID,
  teamName,
  owner,
  repo,
  onBack,
  onNext,
}: {
  orgID: string
  teamName: string | null
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
  })
  const installationQuery = useQuery(GITHUB_APP, { variables: { orgID } })

  const configuration = configQuery.data?.repositoryAIConfiguration ?? null
  const missing = configuration?.missing ?? []
  const ready = configuration?.ready ?? false
  const installation = installationQuery.data?.githubApp
  const accountLogin =
    installation && !installation.suspended ? installation.accountLogin : null

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
    <OnboardingShell
      stepIndex={4}
      teamName={teamName}
      onBack={onBack}
      primary={{
        label: 'Go ahead',
        onClick: handleNext,
        disabled: !ready,
        loading: isStarting,
      }}
    >
      <StepIntro
        title={
          ready
            ? 'Everything the run needs is in place.'
            : 'The run needs a few secrets first.'
        }
        description={
          <>
            Add these as Actions secrets on GitHub for{' '}
            <span className="font-mono text-[0.8125rem]">
              {owner}/{repo}
            </span>
            . UIGraph never receives the values, the workflow reads them on your
            runner.
          </>
        }
      />

      <div className="border-stock bg-shading mt-8 rounded-xl border">
        <ul className="divide-stock divide-y">
          {VARIABLE_ROWS.map((row) => {
            const found = !row.names.some((name) => missing.includes(name))
            return (
              <li
                key={row.names.join('-')}
                className="flex items-start gap-4 p-4"
              >
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-x-2">
                    {row.names.map((name, index) => (
                      <span key={name} className="flex items-center gap-2">
                        {index > 0 && (
                          <span className="text-paragraph text-xs">or</span>
                        )}
                        <VariableName name={name} />
                      </span>
                    ))}
                  </span>
                  <span className="text-paragraph mt-1 block text-xs">
                    {row.description}
                  </span>
                </span>
                <span
                  className={cn(
                    'flex shrink-0 items-center gap-1.5 text-xs',
                    found && 'text-success',
                    !found && 'text-amber-500'
                  )}
                >
                  {found && <Check className="size-3.5" />}
                  {found ? 'Found' : 'Missing'}
                </span>
              </li>
            )
          })}
        </ul>

        <div className="border-stock flex flex-wrap items-center justify-between gap-2 border-t px-4 py-3">
          <span className="text-paragraph text-xs">
            {ready ? 'Everything is in place.' : 'Checking every 5 seconds.'}
          </span>
          <div className="flex items-center gap-1">
            <a
              href={secretsSettingsURL(accountLogin)}
              target="_blank"
              rel="noreferrer"
              className="text-primary inline-flex items-center gap-1.5 px-2 text-xs hover:underline"
            >
              Open Actions secrets <ExternalLink className="size-3" />
            </a>
            <Button
              preset="ghost"
              className="text-paragraph h-8 rounded-[0.625rem] px-2.5 text-xs has-[>svg]:px-2.5"
              disabled={configQuery.loading}
              onClick={() => void configQuery.refetch()}
            >
              <RefreshCw
                className={cn(
                  'size-3.5',
                  configQuery.loading && 'animate-spin'
                )}
              />
              Check again
            </Button>
          </div>
        </div>
      </div>

      {configQuery.loading && !configuration && (
        <p className="text-paragraph mt-3 flex items-center gap-2 text-sm">
          <Loader2 className="size-4 animate-spin" /> Reading the repository
          configuration
        </p>
      )}

      {configQuery.error && (
        <p className="text-destructive mt-3 flex items-start gap-2 text-sm">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          {configQuery.error.message}
        </p>
      )}

      {startError && (
        <p className="text-destructive mt-3 flex items-start gap-2 text-sm">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          {startError}
        </p>
      )}
    </OnboardingShell>
  )
}
