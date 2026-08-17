import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useQuery } from '@apollo/client'
import { Check, Copy, ExternalLink, KeyRound, RefreshCw } from 'lucide-react'
import { useState } from 'react'
import { GITHUB_APP } from './api'
import { isInstallationConnected } from './connect-github-step'

const REQUIRED_SECRETS = [
  'AI_PROVIDER_API_KEY',
  'AI_PROVIDER_MODEL',
  'AI_PROVIDER_API_URL',
  'AI_PROVIDER_NPM',
]

function secretsSettingsURL(accountLogin: string | null) {
  if (!accountLogin) return 'https://github.com/settings/secrets/actions'
  return `https://github.com/organizations/${accountLogin}/settings/secrets/actions`
}

function SecretName({ name }: { name: string }) {
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
      className="hover:bg-stock inline-flex items-center gap-1.5 rounded px-1 py-0.5 transition-colors"
    >
      <code className="bg-stock/70 rounded px-1.5 py-0.5 font-mono text-[0.6875rem]">
        {name}
      </code>
      {copied && <Check className="text-success size-3" />}
      {!copied && <Copy className="text-paragraph size-3" />}
    </button>
  )
}

export function SecretsGuidance({
  orgID,
  missing,
  onRecheck,
  isRechecking,
}: {
  orgID: string
  missing?: string[]
  onRecheck?: () => void
  isRechecking?: boolean
}) {
  const installationQuery = useQuery(GITHUB_APP, { variables: { orgID } })

  const installation = installationQuery.data?.githubApp
  const accountLogin =
    installation && isInstallationConnected(installation.status)
      ? installation.accountLogin
      : null
  const names = missing && missing.length > 0 ? missing : REQUIRED_SECRETS

  return (
    <Alert className="border-amber-500/25 bg-amber-500/5">
      <KeyRound className="text-amber-500" />
      <AlertTitle>
        {missing ? 'AI configuration required' : 'Before you start'}
      </AlertTitle>
      <AlertDescription>
        <p>
          UIGraph runs on your GitHub Actions runners with your own AI provider.
          Add these as organization or repository Actions secrets — UIGraph
          never receives or stores the values.
        </p>
        <ul className="flex flex-wrap gap-1">
          {names.map((name) => (
            <li key={name}>
              <SecretName name={name} />
            </li>
          ))}
        </ul>
        <p className="text-xs">
          <code className="bg-stock/70 rounded px-1.5 py-0.5 font-mono text-[0.6875rem]">
            AI_PROVIDER_API_KEY
          </code>{' '}
          must be a secret. The rest work as a secret or a variable, and either{' '}
          <code className="bg-stock/70 rounded px-1.5 py-0.5 font-mono text-[0.6875rem]">
            AI_PROVIDER_API_URL
          </code>{' '}
          or{' '}
          <code className="bg-stock/70 rounded px-1.5 py-0.5 font-mono text-[0.6875rem]">
            AI_PROVIDER_NPM
          </code>{' '}
          is enough.
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <a
            href={secretsSettingsURL(accountLogin)}
            target="_blank"
            rel="noreferrer"
            className="text-primary inline-flex items-center gap-1.5 text-xs hover:underline"
          >
            Open GitHub Actions secrets <ExternalLink className="size-3" />
          </a>
          {onRecheck && (
            <Button
              preset="outline"
              className="h-9 rounded-[0.625rem] px-3 text-sm has-[>svg]:px-3"
              disabled={isRechecking}
              onClick={onRecheck}
            >
              <RefreshCw
                className={cn('size-4', isRechecking && 'animate-spin')}
              />
              Recheck
            </Button>
          )}
        </div>
      </AlertDescription>
    </Alert>
  )
}
