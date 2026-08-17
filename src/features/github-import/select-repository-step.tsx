import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { useQuery } from '@apollo/client'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  GitBranch,
  Loader2,
  Lock,
  Search,
} from 'lucide-react'
import { useDeferredValue, useState } from 'react'
import { GITHUB_REPOSITORIES } from './api'
import { StepBody, StepFooter, StepHeader } from './step-layout'

export type SelectedRepository = { id: string; fullName: string }

export function SelectRepositoryStep({
  orgID,
  teamID,
  teamName,
  teams,
  selected,
  onBack,
  onSelectTeam,
  onSelect,
  onNext,
}: {
  orgID: string
  teamID: string
  teamName: string
  teams?: { id: string; name: string }[]
  selected: SelectedRepository | null
  onBack: () => void
  onSelectTeam?: (teamID: string) => void
  onSelect: (repository: SelectedRepository) => void
  onNext: () => void
}) {
  const [search, setSearch] = useState('')
  const deferredSearch = useDeferredValue(search)
  const repositoriesQuery = useQuery(GITHUB_REPOSITORIES, {
    variables: { orgID },
    fetchPolicy: 'network-only',
  })
  const repositories = repositoriesQuery.data?.githubRepositories ?? []
  const visibleRepositories = repositories.filter((repository) =>
    repository.fullName
      .toLowerCase()
      .includes(deferredSearch.trim().toLowerCase())
  )

  return (
    <>
      <StepHeader
        title="Choose a repository"
        description={
          <>
            Imported into{' '}
            <span className="text-foreground font-medium">{teamName}</span>.
          </>
        }
      />

      <StepBody>
        <div className="flex shrink-0 gap-2">
          <div className="relative flex-1">
            <Search className="text-paragraph pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2" />
            <Input
              aria-label="Search repositories"
              value={search}
              placeholder="Search repositories"
              className="h-[2.7938125rem] rounded-[0.80315625rem] pl-11"
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
          {teams && teams.length > 1 && onSelectTeam && (
            <Select value={teamID} onValueChange={onSelectTeam}>
              <SelectTrigger
                aria-label="Owning team"
                className="h-[2.7938125rem] w-44 shrink-0 rounded-[0.80315625rem]"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {teams.map((team) => (
                  <SelectItem key={team.id} value={team.id}>
                    {team.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        <div className="border-stock mt-3 flex h-80 flex-col overflow-hidden rounded-xl border">
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
            <div className="better-scrollbar divide-stock min-h-0 flex-1 divide-y overflow-y-auto">
              {visibleRepositories.map((repository) => (
                <button
                  type="button"
                  key={repository.id}
                  role="radio"
                  aria-checked={selected?.id === repository.id}
                  disabled={repository.archived}
                  className={cn(
                    'hover:bg-stock/30 flex w-full items-center gap-3 px-4 py-3 text-left transition-colors',
                    repository.archived &&
                      'cursor-not-allowed opacity-50 hover:bg-transparent',
                    selected?.id === repository.id && 'bg-primary/5'
                  )}
                  onClick={() =>
                    onSelect({
                      id: repository.id,
                      fullName: repository.fullName,
                    })
                  }
                >
                  <span
                    className={cn(
                      'flex size-5 shrink-0 items-center justify-center rounded-full border transition-colors',
                      selected?.id === repository.id &&
                        'border-primary bg-primary text-primary-foreground',
                      selected?.id !== repository.id && 'border-stock'
                    )}
                  >
                    {selected?.id === repository.id && (
                      <Check className="size-3" />
                    )}
                  </span>
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
                </button>
              ))}
            </div>
          )}
        </div>
      </StepBody>

      <StepFooter>
        <Button preset="outline" onClick={onBack}>
          <ArrowLeft /> Back
        </Button>
        <Button preset="primary" disabled={selected === null} onClick={onNext}>
          Continue <ArrowRight />
        </Button>
      </StepFooter>
    </>
  )
}
