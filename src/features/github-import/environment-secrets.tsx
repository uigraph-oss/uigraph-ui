import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useMutation, useQuery } from '@apollo/client'
import {
  AlertTriangle,
  ArrowUpRight,
  BookOpen,
  Check,
  Copy,
  KeyRound,
  Loader2,
  RotateCw,
} from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { LuGithub } from 'react-icons/lu'
import { toast } from 'sonner'
import {
  CREATE_REPOSITORY_IMPORT_TOKEN,
  GITHUB_IMPORT_ENVIRONMENT,
} from './api'

const DOCS_URL = 'https://docs.uigraph.app/self-hosting/ai-providers'

const PROVIDER_ROWS = [
  {
    name: 'AI_PROVIDER_API_URL',
    info: 'The OpenAI compatible endpoint the workflow calls. Providers that ship as an npm package are set up differently.',
    infoHref: DOCS_URL,
    example: 'https://api.openai.com/v1',
  },
  {
    name: 'AI_PROVIDER_MODEL',
    info: 'The model that reads the repository and writes its artifacts.',
    example: 'gpt-5.6-terra',
  },
  {
    name: 'AI_PROVIDER_API_KEY',
    info: 'The API key the workflow uses to call your model provider. It is read inside your own GitHub Actions run, never by UIGraph.',
    example: 'sk-proj-…',
  },
]

function SecretName({ name, info }: { name: string; info: string }) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    await navigator.clipboard.writeText(name)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1500)
  }

  return (
    <button
      type="button"
      onClick={() => void handleCopy()}
      aria-label={`Copy ${name}`}
      className="group/name hover:bg-stock/50 -mx-1.5 flex min-w-0 items-center gap-1.5 rounded px-1.5 py-1 transition-colors"
    >
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="decoration-paragraph/30 hover:decoration-paragraph min-w-0 truncate font-mono text-[0.8125rem] underline decoration-dotted underline-offset-4 transition-colors">
            {name}
          </span>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs leading-relaxed">
          {info}
        </TooltipContent>
      </Tooltip>
      {copied && <Check className="text-success size-3.5 shrink-0" />}
      {!copied && (
        <Copy className="text-paragraph/50 group-hover/name:text-paragraph size-3.5 shrink-0 transition-colors" />
      )}
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
    <span className="border-stock/70 text-paragraph/60 flex h-8 max-w-[17rem] cursor-default items-center truncate rounded-lg border border-dashed px-2.5 font-mono text-xs select-none">
      {label}
    </span>
  )
}

function SecretRow({
  name,
  info,
  infoHref,
  note,
  value,
}: {
  name: string
  info: string
  infoHref?: string
  note?: ReactNode
  value: ReactNode
}) {
  return (
    <li className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 px-4 py-2.5">
      <div className="min-w-0">
        <div className="flex min-w-0 items-center gap-2">
          <SecretName name={name} info={info} />
          {infoHref && (
            <a
              href={infoHref}
              target="_blank"
              rel="noreferrer"
              className="border-stock/70 text-paragraph/70 hover:border-primary/40 hover:text-primary flex h-6 shrink-0 items-center gap-1 rounded-full border px-2 text-[0.6875rem] transition-colors"
            >
              Learn more
              <ArrowUpRight className="size-3" />
            </a>
          )}
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

  async function handleCreate() {
    try {
      const result = await createToken({ variables: { orgID, owner, repo } })
      const created = result.data?.createRepositoryImportToken
      if (!created) throw new Error('The token came back empty')
      setToken(created)
    } catch (caught) {
      toast.error('Could not create the token', {
        description: caught instanceof Error ? caught.message : undefined,
      })
    }
  }

  return (
    <SecretRow
      name="UIGRAPH_TOKEN"
      info="A UIGraph service account token the workflow signs in with. Create it here, then paste it into GitHub — it is shown only once."
      note={
        token && (
          <p className="mt-1.5 flex items-center gap-1.5 text-xs text-amber-500">
            <AlertTriangle className="size-3.5 shrink-0" />
            Copy it now. It is shown once and cannot be read again.
          </p>
        )
      }
      value={
        <div className="flex items-center gap-2">
          {token && <ValueChip value={token} />}
          <Button
            preset="outline"
            className="border-primary/30 bg-primary/10 text-primary hover:border-primary/50 hover:bg-primary/15 hover:text-primary h-8 shrink-0 gap-1.5 rounded-lg px-3 text-xs has-[>svg]:px-3"
            disabled={loading}
            onClick={() => void handleCreate()}
          >
            {loading && <Loader2 className="size-3.5 animate-spin" />}
            {!loading && token && <RotateCw className="size-3.5" />}
            {!loading && !token && <KeyRound className="size-3.5" />}
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
    onError: (error) =>
      toast.error('Could not read this instance configuration', {
        description: error.message,
      }),
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
            The run checks them before reading your code.
          </p>
        </div>

        <Button
          preset="outline"
          asChild
          className="h-10 shrink-0 gap-2 rounded-xl px-4 text-sm has-[>svg]:px-4"
        >
          <a href={DOCS_URL} target="_blank" rel="noreferrer">
            <BookOpen className="size-4" />
            View Docs
          </a>
        </Button>
      </div>

      <div className="border-stock bg-shading/40 mt-5 overflow-hidden rounded-xl border">
        <ul className="divide-stock divide-y">
          {PROVIDER_ROWS.map((row) => (
            <SecretRow
              key={row.name}
              name={row.name}
              info={row.info}
              infoHref={row.infoHref}
              value={<PlaceholderChip label={row.example} />}
            />
          ))}
          <SecretRow
            name="UIGRAPH_API_URL"
            info="Where the workflow reaches this UIGraph instance to report the run back."
            value={
              <InstanceValue
                value={environment?.apiUrl ?? ''}
                loading={isLoading}
              />
            }
          />
          <SecretRow
            name="UIGRAPH_GATEWAY_URL"
            info="Where the workflow uploads the graph it generates."
            value={
              <InstanceValue
                value={environment?.gatewayUrl ?? ''}
                loading={isLoading}
              />
            }
          />
          <ImportTokenRow orgID={orgID} owner={owner} repo={repo} />
        </ul>

        <div className="border-stock bg-shading-gray/40 flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-t px-4 py-2">
          <span className="text-paragraph min-w-0 truncate text-[0.8125rem]">
            <span className="font-mono">
              {owner}/{repo}
            </span>{' '}
            &gt; Settings &gt; Secrets
          </span>
          <Button
            preset="ghost"
            asChild
            className="text-paragraph -mx-2 h-8 gap-2 rounded-lg px-2 text-[0.8125rem] has-[>svg]:px-2"
          >
            <a
              href={`https://github.com/${owner}/${repo}/settings/secrets/actions`}
              target="_blank"
              rel="noreferrer"
            >
              <LuGithub className="size-4" />
              Open Settings
            </a>
          </Button>
        </div>
      </div>
    </>
  )
}
