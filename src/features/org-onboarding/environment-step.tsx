import { Button } from '@/components/ui/button'
import {
  GITHUB_APP,
  REPOSITORY_AI_CONFIGURATION,
} from '@/features/github-import/api'
import { cn } from '@/lib/utils'
import { useQuery } from '@apollo/client'
import { AnimatePresence, motion } from 'framer-motion'
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
import { VariableField } from './visuals/variable-field'

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
      className="hover:bg-stock/60 -mx-1.5 inline-flex items-center gap-2 rounded px-1.5 py-0.5 font-mono text-sm transition-colors"
    >
      {name}
      {copied && <Check className="text-success size-3.5" />}
      {!copied && <Copy className="text-paragraph size-3.5" />}
    </button>
  )
}

function Corner({ className }: { className: string }) {
  return (
    <span
      aria-hidden
      className={cn('border-primary/50 absolute size-4', className)}
    />
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
  const foundCount = VARIABLE_ROWS.filter(
    (row) => !row.names.some((name) => missing.includes(name))
  ).length

  async function handleNext() {
    setIsStarting(true)
    setStartError('')
    try {
      await onNext()
    } catch (caught) {
      setStartError(
        caught instanceof Error ? caught.message : 'Could not start the run'
      )
    }
    setIsStarting(false)
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
      <div className="relative">
        <VariableField />

        <div className="relative">
          <div className="text-center">
            <StepIntro
              eyebrow={`${owner}/${repo}`}
              title={
                ready
                  ? 'Everything the run needs is in place.'
                  : 'The run needs a few secrets first.'
              }
            />
            <p className="text-paragraph mx-auto mt-4 max-w-md text-sm leading-relaxed">
              Add these as Actions secrets on GitHub. UIGraph never receives the
              values — the workflow reads them on your runner.
            </p>
          </div>

          <div className="border-stock bg-shading relative mx-auto mt-10 max-w-xl rounded-2xl border p-6">
            <Corner className="-top-px -left-px border-t border-l" />
            <Corner className="-top-px -right-px border-t border-r" />
            <Corner className="-bottom-px -left-px border-b border-l" />
            <Corner className="-right-px -bottom-px border-r border-b" />

            <div className="flex items-center justify-between">
              <span className="text-paragraph font-mono text-[0.625rem] tracking-[0.18em] uppercase">
                Actions secrets
              </span>
              <span className="font-mono text-[0.625rem] tracking-[0.18em] uppercase">
                {foundCount} of {VARIABLE_ROWS.length} found
              </span>
            </div>

            <ul className="divide-stock mt-4 divide-y">
              {VARIABLE_ROWS.map((row) => {
                const rowFound = !row.names.some((name) =>
                  missing.includes(name)
                )
                return (
                  <li
                    key={row.names.join('-')}
                    className="flex items-start gap-4 py-4"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        {row.names.map((name, index) => (
                          <span key={name} className="flex items-center gap-2">
                            {index > 0 && (
                              <span className="text-paragraph font-mono text-[0.625rem] uppercase">
                                or
                              </span>
                            )}
                            <VariableName name={name} />
                          </span>
                        ))}
                      </span>
                      <span className="text-paragraph mt-1.5 block text-xs">
                        {row.description}
                      </span>
                    </span>

                    <AnimatePresence mode="wait" initial={false}>
                      <motion.span
                        key={rowFound ? 'found' : 'missing'}
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 4 }}
                        className={cn(
                          'flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[0.625rem] tracking-[0.18em] uppercase',
                          rowFound && 'border-success/40 text-success',
                          !rowFound && 'border-amber-500/40 text-amber-500'
                        )}
                      >
                        {rowFound && <Check className="size-3" />}
                        {rowFound ? 'Found' : 'Missing'}
                      </motion.span>
                    </AnimatePresence>
                  </li>
                )
              })}
            </ul>

            <div className="border-stock mt-2 flex flex-wrap items-center justify-between gap-3 border-t pt-4">
              <span className="text-paragraph flex items-center gap-2 font-mono text-[0.625rem] tracking-[0.18em] uppercase">
                <span
                  className={cn(
                    'size-1.5 rounded-full',
                    ready && 'bg-success',
                    !ready && 'bg-primary animate-pulse'
                  )}
                />
                {ready ? 'All set' : 'Checking every 5s'}
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
            <p className="text-paragraph mt-4 flex items-center justify-center gap-2 text-sm">
              <Loader2 className="size-4 animate-spin" /> Reading the repository
              configuration
            </p>
          )}

          {configQuery.error && (
            <p className="text-destructive mx-auto mt-4 flex max-w-xl items-center gap-2 text-sm">
              <AlertCircle className="size-4 shrink-0" />
              {configQuery.error.message}
            </p>
          )}

          {startError && (
            <p className="text-destructive mx-auto mt-4 flex max-w-xl items-center gap-2 text-sm">
              <AlertCircle className="size-4 shrink-0" />
              {startError}
            </p>
          )}
        </div>
      </div>
    </OnboardingShell>
  )
}
