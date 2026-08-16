import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { useMutation, useQuery } from '@apollo/client'
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  GitBranch,
  Loader2,
  Lock,
  Search,
} from 'lucide-react'
import { useDeferredValue, useState } from 'react'
import { GITHUB_REPOSITORIES, START_REPOSITORY_ONBOARDING } from './api'
import {
  compactButtonClass,
  fieldClass,
  scrollAreaClass,
  StepBody,
  StepFooter,
  StepHeader,
} from './step-layout'

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
  const selectableRepositories = visibleRepositories.filter(
    (repository) => !repository.archived
  )
  const allSelected =
    selectableRepositories.length > 0 &&
    selectableRepositories.every((repository) =>
      selected.includes(repository.id)
    )

  function handleSelectAll() {
    setSelected((current) => [
      ...current,
      ...selectableRepositories
        .map((repository) => repository.id)
        .filter((id) => !current.includes(id)),
    ])
  }

  function handleClearSelection() {
    const visibleIDs = selectableRepositories.map((repository) => repository.id)
    setSelected((current) => current.filter((id) => !visibleIDs.includes(id)))
  }

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
    <>
      <StepHeader
        title="Choose repositories"
        description={
          <>
            Selected repositories are onboarded to{' '}
            <span className="text-foreground font-medium">{team.name}</span> in
            one batch.
          </>
        }
      />

      <StepBody>
        <div className="relative shrink-0">
          <Search className="text-paragraph pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2" />
          <Input
            aria-label="Search repositories"
            value={search}
            placeholder="Search repositories"
            className={cn(fieldClass, 'pl-11')}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        <div className="mt-3 flex h-9 shrink-0 items-center justify-between gap-3">
          <p className="text-paragraph text-xs">
            {selected.length} selected of {repositories.length}
          </p>
          {selectableRepositories.length > 0 && !allSelected && (
            <Button
              preset="ghost"
              className={cn(compactButtonClass, 'text-xs')}
              onClick={handleSelectAll}
            >
              Select all
            </Button>
          )}
          {selectableRepositories.length > 0 && allSelected && (
            <Button
              preset="ghost"
              className={cn(compactButtonClass, 'text-xs')}
              onClick={handleClearSelection}
            >
              Clear selection
            </Button>
          )}
        </div>

        <div className="border-stock mt-1 flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border">
          {repositoriesQuery.loading && !repositoriesQuery.data && (
            <div className="text-paragraph flex flex-1 items-center justify-center gap-2 text-sm">
              <Loader2 className="size-4 animate-spin" /> Loading repositories
            </div>
          )}

          {!repositoriesQuery.loading && visibleRepositories.length === 0 && (
            <div className="text-paragraph flex flex-1 items-center justify-center px-8 text-center text-sm">
              No repositories match this search.
            </div>
          )}

          {visibleRepositories.length > 0 && (
            <div className={cn(scrollAreaClass, 'divide-stock divide-y')}>
              {visibleRepositories.map((repository) => (
                <label
                  key={repository.id}
                  className={cn(
                    'hover:bg-stock/30 flex cursor-pointer items-center gap-3 px-4 py-3 transition-colors',
                    repository.archived &&
                      'cursor-not-allowed opacity-50 hover:bg-transparent'
                  )}
                >
                  <Checkbox
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
                    <span className="flex items-center gap-2">
                      <span className="truncate text-sm font-medium">
                        {repository.fullName}
                      </span>
                      {repository.private && (
                        <Badge variant="outline" className="shrink-0">
                          <Lock /> Private
                        </Badge>
                      )}
                      {repository.archived && (
                        <Badge variant="secondary" className="shrink-0">
                          Archived
                        </Badge>
                      )}
                    </span>
                    <span className="text-paragraph mt-1 flex items-center gap-1.5 text-xs">
                      <GitBranch className="size-3 shrink-0" />
                      <span className="truncate">
                        {repository.defaultBranch}
                      </span>
                    </span>
                  </span>
                </label>
              ))}
            </div>
          )}
        </div>

        {error && (
          <Alert variant="destructive" className="mt-3 shrink-0">
            <AlertCircle />
            <AlertTitle>Could not start onboarding</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </StepBody>

      <StepFooter>
        <Button preset="outline" onClick={onBack}>
          <ArrowLeft /> Back
        </Button>
        <Button
          preset="primary"
          disabled={selected.length === 0 || isStarting}
          onClick={handleStart}
        >
          {isStarting && <Loader2 className="animate-spin" />}
          {selected.length === 0 && 'Onboard repositories'}
          {selected.length === 1 && 'Onboard 1 repository'}
          {selected.length > 1 && `Onboard ${selected.length} repositories`}
          {!isStarting && <ArrowRight />}
        </Button>
      </StepFooter>
    </>
  )
}
