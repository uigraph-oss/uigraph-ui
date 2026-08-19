import {
  BetterDialogCloseButton,
  BetterDialogContent,
} from '@/components/better-dialog'
import { Button } from '@/components/ui/button'
import { DialogClose, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { SETTINGS_TEAMS } from '@/features/dashboard-settings/api/teams'
import { cn } from '@/lib/utils'
import { useMutation, useQuery } from '@apollo/client'
import { arrayNonNullable } from 'daily-code'
import { ArrowLeft, ArrowRight, Check, Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { START_REPOSITORY_IMPORT } from './api'
import { ConnectGitHubCard } from './connect-github-card'
import {
  EnvironmentSecrets,
  useRepositoryEnvironment,
} from './environment-secrets'
import { ImportRunStep } from './import-run-step'
import { RepositoryPicker, type SelectedRepository } from './repository-picker'
import { useGitHubConnection } from './use-github-connection'

const STEPS = [
  'Connect GitHub',
  'Select repository',
  'Check environment',
  'Start',
]

export function ImportGitHubModal({
  orgID,
  onOpenChange,
  onImported,
}: {
  orgID: string
  onOpenChange: (open: boolean) => void
  onImported?: () => void
}) {
  const [step, setStep] = useState<number | null>(null)
  const [teamID, setTeamID] = useState('')
  const [repository, setRepository] = useState<SelectedRepository | null>(null)
  const [importID, setImportID] = useState('')
  const [startError, setStartError] = useState('')

  const github = useGitHubConnection(orgID)
  const teamsQuery = useQuery(SETTINGS_TEAMS, { variables: { orgId: orgID } })
  const [startImport, { loading: isStarting }] = useMutation(
    START_REPOSITORY_IMPORT
  )

  const environment = useRepositoryEnvironment({
    orgID,
    owner: repository?.owner ?? '',
    repo: repository?.name ?? '',
    skip: step !== 2 || repository === null,
  })

  useEffect(() => {
    if (step !== null || github.isLoading) return
    setStep(github.connected ? 1 : 0)
  }, [step, github.isLoading, github.connected])

  const teams = arrayNonNullable(teamsQuery.data?.teams)
  const team = teams.find((item) => item.id === teamID) ?? teams[0]

  async function handleStart() {
    if (!repository || !team) return

    setStartError('')
    try {
      const result = await startImport({
        variables: {
          orgID,
          teamID: team.id,
          owner: repository.owner,
          repo: repository.name,
        },
      })
      const id = result.data?.startRepositoryImport.id
      if (!id) throw new Error('The import started without an ID')
      setImportID(id)
      setStep(3)
    } catch (caught) {
      setStartError(
        caught instanceof Error ? caught.message : 'Could not start the import'
      )
    }
  }

  const isLoading = step === null || (teamsQuery.loading && !teamsQuery.data)

  return (
    <BetterDialogContent
      className="flex flex-col"
      _headerContent={
        <DialogHeader className="flex min-h-18 w-full shrink-0 flex-row items-center gap-6 border-b border-[#2A3242] px-6">
          <DialogTitle className="shrink-0 text-left text-base font-medium">
            Import from GitHub
          </DialogTitle>

          <ol className="hidden min-w-0 flex-1 items-center gap-2 lg:flex">
            {STEPS.map((label, index) => (
              <li
                key={label}
                className="flex min-w-0 flex-1 items-center gap-2"
              >
                <span
                  className={cn(
                    'flex size-5 shrink-0 items-center justify-center rounded-full border text-[0.625rem] font-medium transition-colors',
                    index < (step ?? 0) &&
                      'border-primary/40 bg-primary/10 text-primary',
                    index === (step ?? 0) &&
                      'border-primary bg-primary text-white',
                    index > (step ?? 0) && 'border-stock text-paragraph/60'
                  )}
                >
                  {index < (step ?? 0) ? (
                    <Check className="size-3" />
                  ) : (
                    index + 1
                  )}
                </span>
                <span
                  className={cn(
                    'truncate text-xs transition-colors',
                    index <= (step ?? 0)
                      ? 'text-foreground'
                      : 'text-paragraph/60'
                  )}
                >
                  {label}
                </span>
                {index < STEPS.length - 1 && (
                  <span
                    className={cn(
                      'h-px min-w-3 flex-1 transition-colors',
                      index < (step ?? 0) ? 'bg-primary/30' : 'bg-stock'
                    )}
                  />
                )}
              </li>
            ))}
          </ol>

          <BetterDialogCloseButton />
        </DialogHeader>
      }
      _footerContent={
        <footer className="border-stock flex shrink-0 items-center justify-between gap-3 border-t px-6 py-4">
          {isLoading && <span />}

          {!isLoading && step === 0 && (
            <>
              <DialogClose asChild>
                <Button preset="outline">Cancel</Button>
              </DialogClose>
              <Button
                preset="primary"
                disabled={!github.connected}
                onClick={() => setStep(1)}
              >
                Continue <ArrowRight />
              </Button>
            </>
          )}

          {!isLoading && step === 1 && (
            <>
              <Button preset="outline" onClick={() => setStep(0)}>
                <ArrowLeft /> Back
              </Button>
              <Button
                preset="primary"
                disabled={repository === null || !team}
                onClick={() => setStep(2)}
              >
                Continue <ArrowRight />
              </Button>
            </>
          )}

          {!isLoading && step === 2 && (
            <>
              <Button preset="outline" onClick={() => setStep(1)}>
                <ArrowLeft /> Back
              </Button>
              <Button
                preset="primary"
                disabled={!environment.isReady || isStarting}
                onClick={() => void handleStart()}
              >
                {isStarting && <Loader2 className="animate-spin" />}
                Start import <ArrowRight />
              </Button>
            </>
          )}

          {!isLoading && step === 3 && (
            <>
              <span />
              <DialogClose asChild>
                <Button preset="outline">Close</Button>
              </DialogClose>
            </>
          )}
        </footer>
      }
    >
      {isLoading && (
        <div className="text-paragraph m-auto flex items-center gap-2 text-sm">
          <Loader2 className="size-4 animate-spin" /> Checking your GitHub setup
        </div>
      )}

      {!isLoading && !team && (
        <div className="m-auto max-w-sm text-center">
          <h2 className="text-lg font-medium tracking-tight">
            Create a team first.
          </h2>
          <p className="text-paragraph mx-auto mt-2 max-w-sm text-sm leading-relaxed">
            Every repository UIGraph imports is owned by one of your teams.
            Create one in settings, then come back.
          </p>
          <Button preset="primary" className="mt-6" asChild>
            <Link to="/settings/teams" onClick={() => onOpenChange(false)}>
              Go to team settings <ArrowRight />
            </Link>
          </Button>
        </div>
      )}

      {!isLoading && team && step === 0 && (
        <div className="m-auto w-full max-w-lg">
          <ConnectGitHubCard github={github} />
        </div>
      )}

      {!isLoading && team && step === 1 && (
        <div className="mx-auto flex min-h-0 w-full max-w-2xl flex-1 flex-col">
          <h2 className="text-lg font-medium tracking-tight">
            Pick the repository to import.
          </h2>
          <p className="text-paragraph mt-1.5 text-sm leading-relaxed">
            Start with one. UIGraph documents it end to end, then you can bring
            in the rest.
          </p>

          <div className="mt-5 flex min-h-0 flex-1 flex-col">
            <RepositoryPicker
              orgID={orgID}
              selected={repository}
              listClassName="h-auto min-h-0 flex-1"
              onSelect={setRepository}
              searchTrailing={
                teams.length > 1 && (
                  <Select value={team.id} onValueChange={setTeamID}>
                    <SelectTrigger
                      aria-label="Owning team"
                      className="h-10 w-44 shrink-0 rounded-[0.625rem]"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {teams.map((item) => (
                        <SelectItem key={item.id} value={item.id}>
                          {item.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )
              }
            />
          </div>
        </div>
      )}

      {!isLoading && team && step === 2 && repository && (
        <div className="mx-auto w-full max-w-2xl">
          <EnvironmentSecrets
            owner={repository.owner}
            repo={repository.name}
            environment={environment}
          />

          {startError && (
            <p className="text-destructive mt-6 text-sm">{startError}</p>
          )}
        </div>
      )}

      {!isLoading && team && step === 3 && (
        <div className="mx-auto w-full max-w-5xl">
          <ImportRunStep
            orgID={orgID}
            importID={importID}
            onCompleted={() => onImported?.()}
            onOpenService={() => onOpenChange(false)}
          />
        </div>
      )}
    </BetterDialogContent>
  )
}
