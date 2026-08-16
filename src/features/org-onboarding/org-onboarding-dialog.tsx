'use client'

import { UiGraphLogo } from '@/components/logo'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  TeamContextProvider,
  useTeamContext,
} from '@/features/dashboard-settings/context/team-context'
import { usePermissions } from '@/hooks/use-permissions'
import { cn } from '@/lib/utils'
import {
  refreshOrganizations,
  useCurrentOrganization,
} from '@/store/auth-store'
import { useApolloClient, useMutation, useQuery } from '@apollo/client'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Check,
  CircleDot,
  ExternalLink,
  GitBranch,
  Github,
  KeyRound,
  Loader2,
  Lock,
  RefreshCw,
  Search,
} from 'lucide-react'
import { useDeferredValue, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  COMPLETE_ONBOARDING,
  DISCONNECT_GITHUB_APP,
  GITHUB_APP,
  GITHUB_APP_INSTALL_URL,
  GITHUB_REPOSITORIES,
  RECHECK_REPOSITORY_ONBOARDING,
  REPOSITORY_ONBOARDING,
  RETRY_REPOSITORY_ONBOARDING,
  START_REPOSITORY_ONBOARDING,
} from './api'

const STEPS = [
  'welcome',
  'teams',
  'github',
  'repositories',
  'progress',
] as const
type Step = (typeof STEPS)[number]

const fieldClass = 'h-12 rounded-xl border-input'

function batchStorageKey(orgID: string) {
  return `org-onboarding:${orgID}:batch`
}

function readableStatus(status: string) {
  return status
    .toLowerCase()
    .replaceAll('_', ' ')
    .replace(/(^|\s)\S/g, (letter) => letter.toUpperCase())
}

function isInstallationConnected(status: string) {
  const normalized = status.toUpperCase()
  if (normalized === 'CONNECTED') return true
  if (normalized === 'ACTIVE') return true
  if (normalized === 'INSTALLED') return true
  return false
}

function isCompleted(status: string) {
  return status.toUpperCase() === 'COMPLETED'
}

function isFailed(status: string) {
  return status.toUpperCase() === 'FAILED'
}

function isCancelled(status: string) {
  return status.toUpperCase() === 'CANCELLED'
}

function onboardingLabel(onboarding: {
  status: string
  setupPullRequestUrl?: string | null
  generationRunUrl?: string | null
  artifactsPullRequestUrl?: string | null
  syncRunUrl?: string | null
  missingAIConfiguration: string[]
}) {
  if (onboarding.status === 'COMPLETED') return 'Completed'
  if (onboarding.status === 'FAILED') return 'Failed'
  if (onboarding.status === 'CANCELLED') return 'Cancelled'
  if (onboarding.status === 'SELECTED') return 'Selected'
  if (onboarding.status === 'SETUP_PR_CREATING')
    return 'Creating setup pull request'
  if (onboarding.status === 'SETUP_PR_OPEN') return 'Setup pull request open'
  if (onboarding.status === 'WAITING_SETUP_MERGE')
    return 'Waiting for setup merge'
  if (onboarding.status === 'CHECKING_AI_CONFIGURATION')
    return 'Checking AI configuration'
  if (onboarding.status === 'WAITING_AI_CONFIGURATION')
    return 'AI configuration required'
  if (onboarding.status === 'GENERATION_QUEUED') return 'Generation queued'
  if (onboarding.status === 'GENERATION_RUNNING') return 'Generating artifacts'
  if (onboarding.status === 'ARTIFACTS_PR_OPEN')
    return 'Artifacts pull request open'
  if (onboarding.status === 'WAITING_ARTIFACTS_MERGE')
    return 'Waiting for artifacts merge'
  if (onboarding.status === 'SYNC_QUEUED') return 'Sync queued'
  if (onboarding.status === 'SYNC_RUNNING') return 'Syncing'
  if (onboarding.status === 'RUNNING') return 'Starting onboarding'
  return readableStatus(onboarding.status)
}

export function OrgOnboardingDialog() {
  const organization = useCurrentOrganization()
  const { isAdmin } = usePermissions()

  const open = Boolean(isAdmin && organization && !organization.onboardingDone)
  if (!open) return null

  return (
    <Dialog open>
      <DialogPortal>
        <DialogOverlay className="bg-black/60 backdrop-blur-md" />
        <DialogPrimitive.Content
          onInteractOutside={(event) => event.preventDefault()}
          onEscapeKeyDown={(event) => event.preventDefault()}
          className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 bg-shading border-stock fixed top-1/2 left-1/2 z-50 w-full max-w-[calc(100%-1rem)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border p-0 shadow-2xl duration-200 sm:max-w-2xl"
        >
          <TeamContextProvider>
            <OrgOnboardingWizard orgID={organization!.id} />
          </TeamContextProvider>
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  )
}

function OrgOnboardingWizard({ orgID }: { orgID: string }) {
  const [batchID, setBatchID] = useState(() =>
    localStorage.getItem(batchStorageKey(orgID))
  )
  const [step, setStep] = useState<Step>(batchID ? 'progress' : 'welcome')
  const [team, setTeam] = useState<{ id: string; name: string } | null>(null)

  return (
    <div className="flex max-h-[92vh] min-h-0 flex-col p-5 sm:p-8">
      <div className="mb-5 flex shrink-0 flex-col items-center gap-3">
        <UiGraphLogo className="h-10 w-10" />
        <StepDots step={step} />
      </div>

      {step === 'welcome' && <WelcomeStep onNext={() => setStep('teams')} />}
      {step === 'teams' && (
        <TeamsStep
          selectedTeamID={team?.id ?? null}
          onBack={() => setStep('welcome')}
          onSelect={setTeam}
          onNext={() => setStep('github')}
        />
      )}
      {step === 'github' && (
        <GitHubStep
          orgID={orgID}
          onBack={() => setStep('teams')}
          onNext={() => setStep('repositories')}
        />
      )}
      {step === 'repositories' && team && (
        <RepositoriesStep
          orgID={orgID}
          team={team}
          onBack={() => setStep('github')}
          onStarted={(id) => {
            localStorage.setItem(batchStorageKey(orgID), id)
            setBatchID(id)
            setStep('progress')
          }}
        />
      )}
      {step === 'progress' && batchID && (
        <ProgressStep
          orgID={orgID}
          batchID={batchID}
          onMissing={() => {
            localStorage.removeItem(batchStorageKey(orgID))
            setBatchID(null)
            setStep('welcome')
          }}
        />
      )}
    </div>
  )
}

function StepDots({ step }: { step: Step }) {
  const current = STEPS.indexOf(step)
  return (
    <div
      className="flex items-center gap-1.5"
      aria-label={`Step ${current + 1} of ${STEPS.length}`}
    >
      {STEPS.map((item, index) => (
        <span
          key={item}
          className={cn(
            'h-1.5 rounded-full transition-all',
            index === current && 'bg-primary w-6',
            index !== current && 'bg-stock w-1.5'
          )}
        />
      ))}
    </div>
  )
}

function WelcomeStep({ onNext }: { onNext: () => void }) {
  return (
    <div className="mx-auto w-full max-w-md text-center">
      <DialogTitle className="text-2xl font-semibold">
        Welcome to UIGraph
      </DialogTitle>
      <DialogDescription className="text-paragraph mx-auto mt-3 max-w-sm text-sm leading-relaxed">
        Let&apos;s set up your organization, connect GitHub, and generate your
        first repository documentation.
      </DialogDescription>
      <Button preset="primary" className="mt-8 w-full" onClick={onNext}>
        Get Started
        <ArrowRight />
      </Button>
    </div>
  )
}

function TeamsStep({
  selectedTeamID,
  onBack,
  onSelect,
  onNext,
}: {
  selectedTeamID: string | null
  onBack: () => void
  onSelect: (team: { id: string; name: string }) => void
  onNext: () => void
}) {
  const { teams, createTeam } = useTeamContext()
  const [teamName, setTeamName] = useState('')
  const [isCreating, setIsCreating] = useState(false)

  async function handleAddTeam() {
    const name = teamName.trim()
    if (name === '') return
    setIsCreating(true)
    try {
      const result = await createTeam({ teamName: name })
      const id = result.data?.createTeam.id
      if (!id) throw new Error('The team was created without an ID')
      onSelect({ id, name })
      setTeamName('')
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="mb-5 shrink-0 text-center">
        <DialogTitle className="text-2xl font-semibold">
          Choose a team
        </DialogTitle>
        <DialogDescription className="text-paragraph mx-auto mt-2 max-w-md text-sm leading-relaxed">
          All selected repositories will be added to this UIGraph team.
        </DialogDescription>
      </div>

      <div className="shrink-0 space-y-2">
        <Label htmlFor="onboarding-team-name">Create a team</Label>
        <div className="flex items-stretch gap-2">
          <Input
            id="onboarding-team-name"
            value={teamName}
            placeholder="e.g. Engineering"
            autoComplete="off"
            className={fieldClass}
            onChange={(event) => setTeamName(event.target.value)}
            onKeyDown={(event) => {
              if (event.key !== 'Enter') return
              event.preventDefault()
              void handleAddTeam()
            }}
          />
          <Button
            preset="outline"
            className={cn(fieldClass, 'shrink-0')}
            disabled={teamName.trim() === '' || isCreating}
            onClick={handleAddTeam}
          >
            {isCreating && <Loader2 className="animate-spin" />}
            Add
          </Button>
        </div>
      </div>

      {teams.length > 0 && (
        <div className="mt-5 min-h-0 flex-1 overflow-y-auto">
          <Label className="mb-2 block">Select a team</Label>
          <div className="space-y-2">
            {teams.map((item) => (
              <button
                type="button"
                key={item.teamId}
                className={cn(
                  'border-stock hover:bg-stock flex w-full items-center gap-3 rounded-xl border p-3 text-left text-sm transition-colors',
                  selectedTeamID === item.teamId &&
                    'border-primary bg-primary/5'
                )}
                onClick={() =>
                  onSelect({ id: item.teamId, name: item.teamName })
                }
              >
                <span className="bg-primary/10 text-primary flex size-8 shrink-0 items-center justify-center rounded-lg">
                  {selectedTeamID === item.teamId && (
                    <Check className="size-4" />
                  )}
                </span>
                {item.teamName}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="mt-6 flex shrink-0 gap-2">
        <Button preset="outline" onClick={onBack}>
          <ArrowLeft /> Back
        </Button>
        <Button
          preset="primary"
          className="flex-1"
          disabled={!selectedTeamID}
          onClick={onNext}
        >
          Continue <ArrowRight />
        </Button>
      </div>
    </div>
  )
}

function GitHubStep({
  orgID,
  onBack,
  onNext,
}: {
  orgID: string
  onBack: () => void
  onNext: () => void
}) {
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState('')
  const popupRef = useRef<Window | null>(null)
  const installationQuery = useQuery(GITHUB_APP, {
    variables: { orgID },
    fetchPolicy: 'network-only',
    pollInterval: isConnecting ? 5000 : 0,
  })
  const [getInstallURL, { loading: isStarting }] = useMutation(
    GITHUB_APP_INSTALL_URL
  )
  const [disconnect, { loading: isDisconnecting }] = useMutation(
    DISCONNECT_GITHUB_APP
  )
  const installation = installationQuery.data?.githubApp
  const connected = Boolean(
    installation && isInstallationConnected(installation.status)
  )

  useEffect(() => {
    if (!connected) return
    setIsConnecting(false)
    popupRef.current?.close()
    popupRef.current = null
  }, [connected])

  useEffect(() => () => popupRef.current?.close(), [])

  async function handleConnect() {
    setError('')
    const popup = window.open(
      '',
      'uigraph-github-app',
      'popup,width=720,height=760'
    )
    if (!popup) {
      setError('Allow popups for UIGraph, then try again.')
      return
    }
    popupRef.current = popup

    try {
      const result = await getInstallURL({ variables: { orgID } })
      const installURL = result.data?.githubAppInstallURL
      if (!installURL)
        throw new Error('GitHub did not return an installation URL')
      const url = new URL(installURL)
      if (url.protocol !== 'https:') {
        throw new Error('GitHub returned an invalid installation URL')
      }
      popup.opener = null
      popup.location.href = url.href
      setIsConnecting(true)
      await installationQuery.refetch()
    } catch (caught) {
      popup.close()
      popupRef.current = null
      setError(
        caught instanceof Error ? caught.message : 'Could not connect GitHub'
      )
    }
  }

  async function handleDisconnect() {
    setError('')
    try {
      await disconnect({ variables: { orgID } })
      setIsConnecting(false)
      await installationQuery.refetch()
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : 'Could not disconnect GitHub'
      )
    }
  }

  return (
    <div className="text-center">
      <div className="bg-stock mx-auto flex size-14 items-center justify-center rounded-2xl">
        <Github className="size-7" />
      </div>
      <DialogTitle className="mt-5 text-2xl font-semibold">
        Connect GitHub
      </DialogTitle>
      <DialogDescription className="text-paragraph mx-auto mt-2 max-w-md text-sm leading-relaxed">
        Install the UIGraph GitHub App and choose the repositories you want to
        onboard. GitHub returns to <code>/api/v1/github-app/callback</code> when
        installation is complete.
      </DialogDescription>

      {connected && installation && (
        <div className="border-stock bg-primary/5 mt-6 rounded-xl border p-4 text-left">
          <div className="flex items-center gap-3">
            <span className="bg-primary/10 text-primary flex size-9 items-center justify-center rounded-lg">
              <Check className="size-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">
                {installation.accountLogin}
              </p>
              <p className="text-paragraph text-xs">
                {readableStatus(installation.accountType)}
              </p>
            </div>
            <Button
              preset="ghost"
              disabled={isDisconnecting}
              onClick={handleDisconnect}
            >
              Disconnect
            </Button>
          </div>
        </div>
      )}

      {!connected && (
        <Button
          preset="primary"
          className="mt-6 w-full"
          disabled={isStarting || isConnecting}
          onClick={handleConnect}
        >
          {(isStarting || isConnecting) && <Loader2 className="animate-spin" />}
          {isConnecting ? 'Waiting for GitHub…' : 'Install GitHub App'}
          {!isStarting && !isConnecting && <ExternalLink />}
        </Button>
      )}

      {error && <p className="text-destructive mt-3 text-sm">{error}</p>}

      <div className="mt-6 flex gap-2">
        <Button preset="outline" onClick={onBack}>
          <ArrowLeft /> Back
        </Button>
        <Button
          preset="primary"
          className="flex-1"
          disabled={!connected}
          onClick={onNext}
        >
          Choose repositories <ArrowRight />
        </Button>
      </div>
    </div>
  )
}

export function RepositoriesStep({
  orgID,
  team,
  onBack,
  onStarted,
}: {
  orgID: string
  team: { id: string; name: string }
  onBack: () => void
  onStarted: (batchID: string) => void
}) {
  const [search, setSearch] = useState('')
  const deferredSearch = useDeferredValue(search)
  const [selected, setSelected] = useState<string[]>([])
  const [error, setError] = useState('')
  const repositoriesQuery = useQuery(GITHUB_REPOSITORIES, {
    variables: { orgID },
    fetchPolicy: 'network-only',
  })
  const [startOnboarding, { loading: isStarting }] = useMutation(
    START_REPOSITORY_ONBOARDING
  )
  const repositories = repositoriesQuery.data?.githubRepositories ?? []
  const visibleRepositories = repositories.filter((repository) =>
    repository.fullName
      .toLowerCase()
      .includes(deferredSearch.trim().toLowerCase())
  )

  async function handleStart() {
    if (selected.length === 0) return
    setError('')
    try {
      const result = await startOnboarding({
        variables: {
          input: { orgId: orgID, teamId: team.id, repositoryIds: selected },
        },
      })
      const id = result.data?.startRepositoryOnboarding.id
      if (!id) throw new Error('Onboarding started without a batch ID')
      onStarted(id)
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : 'Could not start onboarding'
      )
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="shrink-0 text-center">
        <DialogTitle className="text-2xl font-semibold">
          Choose repositories
        </DialogTitle>
        <DialogDescription className="text-paragraph mx-auto mt-2 max-w-md text-sm leading-relaxed">
          Selected repositories will be onboarded to{' '}
          <strong>{team.name}</strong> in one batch.
        </DialogDescription>
      </div>

      <div className="relative mt-5 shrink-0">
        <Search className="text-paragraph absolute top-1/2 left-4 size-4 -translate-y-1/2" />
        <Input
          aria-label="Search repositories"
          value={search}
          placeholder="Search repositories"
          className={cn(fieldClass, 'pl-10')}
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>

      <div className="border-stock mt-3 min-h-48 flex-1 overflow-y-auto rounded-xl border">
        {repositoriesQuery.loading && !repositoriesQuery.data && (
          <div className="text-paragraph flex h-48 items-center justify-center gap-2 text-sm">
            <Loader2 className="size-4 animate-spin" /> Loading repositories
          </div>
        )}
        {!repositoriesQuery.loading && visibleRepositories.length === 0 && (
          <p className="text-paragraph p-8 text-center text-sm">
            No repositories found.
          </p>
        )}
        {visibleRepositories.map((repository) => (
          <label
            key={repository.id}
            className={cn(
              'border-stock flex cursor-pointer items-start gap-3 border-b p-4 last:border-b-0',
              repository.archived && 'cursor-not-allowed opacity-50'
            )}
          >
            <Checkbox
              className="mt-0.5"
              checked={selected.includes(repository.id)}
              disabled={repository.archived}
              onCheckedChange={(checked) => {
                if (checked === true) {
                  setSelected((current) => [...current, repository.id])
                  return
                }
                setSelected((current) =>
                  current.filter((id) => id !== repository.id)
                )
              }}
            />
            <span className="min-w-0 flex-1">
              <span className="flex flex-wrap items-center gap-2 text-sm font-medium">
                <span className="truncate">{repository.fullName}</span>
                {repository.private && (
                  <Badge variant="outline">
                    <Lock /> Private
                  </Badge>
                )}
                {repository.archived && (
                  <Badge variant="secondary">Archived</Badge>
                )}
              </span>
              <span className="text-paragraph mt-1 flex items-center gap-1.5 text-xs">
                <GitBranch className="size-3" /> {repository.defaultBranch}
              </span>
            </span>
          </label>
        ))}
      </div>

      {error && <p className="text-destructive mt-3 text-sm">{error}</p>}
      <div className="mt-4 flex shrink-0 items-center gap-2">
        <Button preset="outline" onClick={onBack}>
          <ArrowLeft /> Back
        </Button>
        <Button
          preset="primary"
          className="flex-1"
          disabled={selected.length === 0 || isStarting}
          onClick={handleStart}
        >
          {isStarting && <Loader2 className="animate-spin" />}
          Onboard {selected.length || ''}{' '}
          {selected.length === 1 ? 'repository' : 'repositories'}
          {!isStarting && <ArrowRight />}
        </Button>
      </div>
    </div>
  )
}

export function ProgressStep({
  orgID,
  batchID,
  onMissing,
}: {
  orgID: string
  batchID: string
  onMissing: () => void
}) {
  const completedRef = useRef(false)
  const apolloClient = useApolloClient()
  const batchQuery = useQuery(REPOSITORY_ONBOARDING, {
    variables: { orgID, batchID },
    fetchPolicy: 'network-only',
  })
  const [completeOnboarding, { error: completionError }] =
    useMutation(COMPLETE_ONBOARDING)
  const [recheck, { loading: isRechecking }] = useMutation(
    RECHECK_REPOSITORY_ONBOARDING
  )
  const [retry, { loading: isRetrying }] = useMutation(
    RETRY_REPOSITORY_ONBOARDING
  )
  const batch = batchQuery.data?.repositoryOnboarding
  const { startPolling, stopPolling } = batchQuery
  const repositories = batch?.repositories ?? []
  const terminal =
    repositories.length > 0 &&
    repositories.every(
      (item) =>
        isCompleted(item.status) ||
        isFailed(item.status) ||
        isCancelled(item.status)
    )
  const allCompleted =
    repositories.length > 0 &&
    repositories.every((item) => isCompleted(item.status))

  useEffect(() => {
    if (batchQuery.error?.message.toLowerCase().includes('not found')) {
      onMissing()
    }
  }, [batchQuery.error, onMissing])

  useEffect(() => {
    if (!batch) return
    if (terminal) {
      stopPolling()
      return
    }
    startPolling(5000)
    return () => stopPolling()
  }, [batch, startPolling, stopPolling, terminal])

  useEffect(() => {
    if (!allCompleted || completedRef.current) return
    completedRef.current = true
    void (async () => {
      try {
        await completeOnboarding({ variables: { orgId: orgID } })
        localStorage.removeItem(batchStorageKey(orgID))
        await Promise.all([
          refreshOrganizations(),
          apolloClient.refetchQueries({
            include: 'active',
            onQueryUpdated: (query) => query.queryName === 'Services',
          }),
        ])
      } catch {
        completedRef.current = false
      }
    })()
  }, [allCompleted, apolloClient, completeOnboarding, orgID])

  async function handleRecheck(onboardingID: string) {
    await recheck({ variables: { orgID, batchID, onboardingID } })
    await batchQuery.refetch()
  }

  async function handleRetry(onboardingID: string) {
    await retry({ variables: { orgID, batchID, onboardingID } })
    await batchQuery.refetch()
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="shrink-0 text-center">
        <DialogTitle className="text-2xl font-semibold">
          Onboarding repositories
        </DialogTitle>
        <DialogDescription className="text-paragraph mx-auto mt-2 max-w-lg text-sm leading-relaxed">
          Each repository progresses independently. You can follow pull requests
          and Actions runs below.
        </DialogDescription>
      </div>

      {batchQuery.loading && !batch && (
        <div className="text-paragraph flex min-h-48 items-center justify-center gap-2 text-sm">
          <Loader2 className="size-4 animate-spin" /> Loading onboarding
          progress
        </div>
      )}
      {batchQuery.error && !batch && (
        <Alert variant="destructive" className="mt-5">
          <AlertCircle />
          <AlertTitle>Could not load onboarding</AlertTitle>
          <AlertDescription>{batchQuery.error.message}</AlertDescription>
        </Alert>
      )}
      {completionError && (
        <Alert variant="destructive" className="mt-5">
          <AlertCircle />
          <AlertTitle>
            Repositories completed, but onboarding could not finish
          </AlertTitle>
          <AlertDescription>{completionError.message}</AlertDescription>
        </Alert>
      )}

      {batch && (
        <div className="mt-5 min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
          {repositories.map((onboarding) => (
            <div
              key={onboarding.id}
              className="border-stock rounded-xl border p-4"
            >
              <div className="flex items-start gap-3">
                <span
                  className={cn(
                    'mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg',
                    isCompleted(onboarding.status) &&
                      'bg-primary/10 text-primary',
                    isFailed(onboarding.status) &&
                      'bg-destructive/10 text-destructive',
                    isCancelled(onboarding.status) && 'bg-stock text-paragraph',
                    !isCompleted(onboarding.status) &&
                      !isFailed(onboarding.status) &&
                      !isCancelled(onboarding.status) &&
                      'bg-stock text-paragraph'
                  )}
                >
                  {isCompleted(onboarding.status) && (
                    <Check className="size-4" />
                  )}
                  {isFailed(onboarding.status) && (
                    <AlertCircle className="size-4" />
                  )}
                  {isCancelled(onboarding.status) && (
                    <AlertCircle className="size-4" />
                  )}
                  {!isCompleted(onboarding.status) &&
                    !isFailed(onboarding.status) &&
                    !isCancelled(onboarding.status) && (
                      <Loader2 className="size-4 animate-spin" />
                    )}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <a
                      href={onboarding.repository.url}
                      target="_blank"
                      rel="noreferrer"
                      className="truncate text-sm font-medium hover:underline"
                    >
                      {onboarding.repository.fullName}
                    </a>
                    <Badge
                      variant={
                        isFailed(onboarding.status) ? 'destructive' : 'outline'
                      }
                    >
                      {onboardingLabel(onboarding)}
                    </Badge>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs">
                    {onboarding.setupPullRequestUrl && (
                      <ProgressLink href={onboarding.setupPullRequestUrl}>
                        Setup PR
                      </ProgressLink>
                    )}
                    {onboarding.generationRunUrl && (
                      <ProgressLink href={onboarding.generationRunUrl}>
                        Generation run
                      </ProgressLink>
                    )}
                    {onboarding.artifactsPullRequestUrl && (
                      <ProgressLink href={onboarding.artifactsPullRequestUrl}>
                        Artifacts PR
                      </ProgressLink>
                    )}
                    {onboarding.syncRunUrl && (
                      <ProgressLink href={onboarding.syncRunUrl}>
                        Sync run
                      </ProgressLink>
                    )}
                    {onboarding.serviceId && (
                      <Button preset="link" asChild>
                        <Link to={`/services/${onboarding.serviceId}`}>
                          Open service <ArrowRight />
                        </Link>
                      </Button>
                    )}
                  </div>

                  {onboarding.missingAIConfiguration.length > 0 && (
                    <Alert className="mt-3 border-amber-500/30 bg-amber-500/5">
                      <KeyRound />
                      <AlertTitle>AI Actions configuration required</AlertTitle>
                      <AlertDescription>
                        <p>
                          Add these missing names in the repository or
                          organization GitHub Actions settings:
                        </p>
                        <ul className="list-inside list-disc">
                          {onboarding.missingAIConfiguration.map((name) => (
                            <li key={name}>
                              <code>{name}</code>
                            </li>
                          ))}
                        </ul>
                        <p>
                          <code>AI_PROVIDER_API_KEY</code> is a secret.{' '}
                          <code>AI_PROVIDER_MODEL</code> and{' '}
                          <code>AI_PROVIDER_API_URL</code> are variables.{' '}
                          <code>AI_PROVIDER_NPM</code> is optional.
                        </p>
                        <Button
                          preset="outline"
                          className="mt-2"
                          disabled={isRechecking}
                          onClick={() => handleRecheck(onboarding.id)}
                        >
                          <RefreshCw
                            className={cn(isRechecking && 'animate-spin')}
                          />{' '}
                          Recheck
                        </Button>
                      </AlertDescription>
                    </Alert>
                  )}

                  {isFailed(onboarding.status) && (
                    <Alert variant="destructive" className="mt-3">
                      <AlertCircle />
                      <AlertTitle>Repository onboarding failed</AlertTitle>
                      <AlertDescription>
                        <p>
                          {onboarding.error ||
                            'Try the failed step again. If it continues, check the linked GitHub Actions run.'}
                        </p>
                        <Button
                          preset="outline"
                          className="mt-2"
                          disabled={isRetrying}
                          onClick={() => handleRetry(onboarding.id)}
                        >
                          <RefreshCw
                            className={cn(isRetrying && 'animate-spin')}
                          />{' '}
                          Retry
                        </Button>
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {batch && !terminal && (
        <p className="text-paragraph mt-4 flex shrink-0 items-center justify-center gap-2 text-xs">
          <CircleDot className="size-3 animate-pulse" /> Progress refreshes
          every 5 seconds
        </p>
      )}
    </div>
  )
}

function ProgressLink({
  href,
  children,
}: {
  href: string
  children: React.ReactNode
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="text-primary inline-flex items-center gap-1 hover:underline"
    >
      {children} <ExternalLink className="size-3" />
    </a>
  )
}
