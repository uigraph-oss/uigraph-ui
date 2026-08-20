import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useMutation, useQuery } from '@apollo/client'
import { AlertTriangle, BookOpen, Check, Copy, Loader2 } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import {
  CREATE_REPOSITORY_IMPORT_TOKEN,
  GITHUB_IMPORT_ENVIRONMENT,
} from './api'

const DOCS_URL = 'https://docs.uigraph.app/self-hosting/ai-providers'

const PROVIDER_ROWS = [
  ['AI_PROVIDER_API_KEY'],
  ['AI_PROVIDER_MODEL'],
  ['AI_PROVIDER_API_URL', 'AI_PROVIDER_NPM'],
]

function CopyValue({
  value,
  className,
}: {
  value: string
  className?: string
}) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    await navigator.clipboard.writeText(value)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1500)
  }

  return (
    <button
      type="button"
      onClick={() => void handleCopy()}
      aria-label={`Copy ${value}`}
      className={cn(
        'hover:bg-stock/50 -mx-1 inline-flex min-w-0 items-center gap-1.5 rounded px-1 py-0.5 font-mono text-[0.8125rem] transition-colors',
        className
      )}
    >
      <span className="truncate">{value}</span>
      {copied && <Check className="text-success size-3 shrink-0" />}
      {!copied && <Copy className="text-paragraph/60 size-3 shrink-0" />}
    </button>
  )
}

function ValueChip({ value }: { value: string }) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    await navigator.clipboard.writeText(value)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1500)
  }

  return (
    <button
      type="button"
      onClick={() => void handleCopy()}
      aria-label={`Copy ${value}`}
      className="border-stock bg-shading-gray hover:border-primary/40 flex h-8 max-w-[17rem] min-w-0 items-center gap-2 rounded-lg border px-2.5 font-mono text-xs transition-colors"
    >
      <span className="truncate">{value}</span>
      {copied && <Check className="text-success size-3.5 shrink-0" />}
      {!copied && <Copy className="text-paragraph/60 size-3.5 shrink-0" />}
    </button>
  )
}

function PlaceholderChip({ label }: { label: string }) {
  return (
    <span className="border-stock/70 text-paragraph/60 flex h-8 items-center rounded-lg border border-dashed px-2.5 font-mono text-xs">
      {label}
    </span>
  )
}

function SectionHeader({ title }: { title: string }) {
  return (
    <div className="border-stock bg-shading-gray/50 text-paragraph border-b px-4 py-1.5 text-[0.6875rem] font-medium tracking-wider uppercase">
      {title}
    </div>
  )
}

function SecretRow({
  names,
  note,
  value,
}: {
  names: string[]
  note?: ReactNode
  value: ReactNode
}) {
  return (
    <li className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 px-4 py-2.5">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-x-2">
          {names.map((name, index) => (
            <span key={name} className="flex min-w-0 items-center gap-2">
              {index > 0 && <span className="text-paragraph text-xs">or</span>}
              <CopyValue value={name} />
            </span>
          ))}
        </div>
        {note}
      </div>
      {value}
    </li>
  )
}

function ImportTokenRow({
  orgID,
  owner,
  repo,
}: {
  orgID: string
  owner: string
  repo: string
}) {
  const [createToken, { loading }] = useMutation(CREATE_REPOSITORY_IMPORT_TOKEN)
  const [token, setToken] = useState('')
  const [error, setError] = useState('')

  async function handleCreate() {
    setError('')
    try {
      const result = await createToken({ variables: { orgID, owner, repo } })
      const created = result.data?.createRepositoryImportToken
      if (!created) throw new Error('The token came back empty')
      setToken(created)
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : 'Could not create the token'
      )
    }
  }

  return (
    <SecretRow
      names={['UIGRAPH_TOKEN']}
      note={
        <>
          {token && (
            <p className="mt-1.5 flex items-center gap-1.5 text-xs text-amber-500">
              <AlertTriangle className="size-3.5 shrink-0" />
              Copy it now. It is shown once and cannot be read again.
            </p>
          )}
          {error && <p className="text-destructive mt-1.5 text-xs">{error}</p>}
        </>
      }
      value={
        <div className="flex items-center gap-2">
          {token && <ValueChip value={token} />}
          <Button
            preset="outline"
            className="h-8 shrink-0 rounded-lg px-3 text-xs has-[>svg]:px-3"
            disabled={loading}
            onClick={() => void handleCreate()}
          >
            {loading && <Loader2 className="size-3.5 animate-spin" />}
            {token ? 'Create another' : 'Create token'}
          </Button>
        </div>
      }
    />
  )
}

function InstanceValue({
  value,
  loading,
}: {
  value: string
  loading: boolean
}) {
  if (loading)
    return <span className="bg-stock h-8 w-44 animate-pulse rounded-lg" />
  if (value) return <ValueChip value={value} />
  return <PlaceholderChip label="not configured" />
}

export function EnvironmentSecrets({
  orgID,
  owner,
  repo,
}: {
  orgID: string
  owner: string
  repo: string
}) {
  const environmentQuery = useQuery(GITHUB_IMPORT_ENVIRONMENT, {
    variables: { orgID },
  })

  const environment = environmentQuery.data?.githubImportEnvironment
  const isLoading = !environment && environmentQuery.loading

  return (
    <>
      <div className="flex items-start justify-between gap-6">
        <div className="min-w-0">
          <h2 className="text-lg font-medium tracking-tight">
            Add these secrets to your repository.
          </h2>
          <p className="text-paragraph mt-1.5 text-sm">
            <span className="font-mono text-[0.8125rem]">
              {owner}/{repo}
            </span>{' '}
            → Settings → Secrets and variables → Actions.
          </p>
        </div>

        <Button
          preset="outline"
          asChild
          className="h-9 shrink-0 gap-2 rounded-[0.625rem] px-3 text-sm has-[>svg]:px-3"
        >
          <a href={DOCS_URL} target="_blank" rel="noreferrer">
            <BookOpen className="size-4" />
            Docs
          </a>
        </Button>
      </div>

      <div className="border-stock bg-shading/40 mt-5 overflow-hidden rounded-xl border">
        <ul className="divide-stock divide-y">
          {PROVIDER_ROWS.map((names) => (
            <SecretRow
              key={names.join('-')}
              names={names}
              value={<PlaceholderChip label="your value" />}
            />
          ))}
          <SecretRow
            names={['UIGRAPH_API_URL']}
            value={
              <InstanceValue
                value={environment?.apiUrl ?? ''}
                loading={isLoading}
              />
            }
          />
          <SecretRow
            names={['UIGRAPH_GATEWAY_URL']}
            value={
              <InstanceValue
                value={environment?.gatewayUrl ?? ''}
                loading={isLoading}
              />
            }
          />
          <ImportTokenRow orgID={orgID} owner={owner} repo={repo} />
        </ul>

        {environmentQuery.error && (
          <p className="text-destructive border-stock flex items-center gap-2 border-t px-4 py-2.5 text-xs">
            <AlertTriangle className="size-3.5 shrink-0" />
            {environmentQuery.error.message}
          </p>
        )}

        <div className="border-stock bg-shading-gray/40 border-t px-4 py-2">
          <Button
            preset="ghost"
            asChild
            className="text-paragraph -mx-2 h-8 rounded-lg px-2 text-[0.8125rem]"
          >
            <a
              href={`https://github.com/${owner}/${repo}/settings/secrets/actions`}
              target="_blank"
              rel="noreferrer"
            >
              Open GitHub settings
            </a>
          </Button>
        </div>
      </div>
    </>
  )
}
