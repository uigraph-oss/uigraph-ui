import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { useQuery } from '@apollo/client'
import { Check, Loader2, Search } from 'lucide-react'
import { useDeferredValue, useState, type ReactNode } from 'react'
import { GITHUB_REPOSITORIES } from './api'

export type SelectedRepository = {
  githubId: string
  owner: string
  name: string
  fullName: string
}

export function RepositoryPicker({
  orgID,
  selected,
  listClassName,
  searchTrailing,
  onSelect,
}: {
  orgID: string
  selected: SelectedRepository | null
  listClassName?: string
  searchTrailing?: ReactNode
  onSelect: (repository: SelectedRepository) => void
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
      <div className="flex items-center gap-2.5">
        <div className="relative flex-1">
          <Search className="text-paragraph pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2" />
          <Input
            aria-label="Search repositories"
            value={search}
            placeholder="Search repositories"
            className="h-10 rounded-[0.625rem] pl-10"
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
        {searchTrailing}
      </div>

      <div
        className={cn(
          'border-stock bg-shading/40 mt-3 flex h-[22rem] flex-col overflow-hidden rounded-xl border',
          listClassName
        )}
      >
        {repositoriesQuery.loading && !repositoriesQuery.data && (
          <div className="text-paragraph flex flex-1 items-center justify-center gap-2 text-sm">
            <Loader2 className="size-4 animate-spin" /> Loading repositories
          </div>
        )}

        {!repositoriesQuery.loading && visibleRepositories.length === 0 && (
          <div className="text-paragraph flex flex-1 items-center justify-center px-8 text-center text-sm">
            No repositories match this search. Check which repositories the app
            can read on GitHub.
          </div>
        )}

        {visibleRepositories.length > 0 && (
          <div
            role="radiogroup"
            aria-label="Repositories"
            className="better-scrollbar divide-stock min-h-0 flex-1 divide-y overflow-y-auto"
          >
            {visibleRepositories.map((repository) => (
              <button
                type="button"
                key={repository.githubId}
                role="radio"
                aria-checked={selected?.fullName === repository.fullName}
                disabled={repository.archived}
                className={cn(
                  'hover:bg-stock/25 flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors',
                  repository.archived &&
                    'cursor-not-allowed opacity-50 hover:bg-transparent',
                  selected?.fullName === repository.fullName &&
                    'bg-primary/10 hover:bg-primary/10'
                )}
                onClick={() =>
                  onSelect({
                    githubId: repository.githubId,
                    owner: repository.owner,
                    name: repository.name,
                    fullName: repository.fullName,
                  })
                }
              >
                <span
                  className={cn(
                    'flex size-4 shrink-0 items-center justify-center rounded-full border transition-colors',
                    selected?.fullName === repository.fullName &&
                      'border-primary bg-primary text-primary-foreground',
                    selected?.fullName !== repository.fullName && 'border-stock'
                  )}
                >
                  {selected?.fullName === repository.fullName && (
                    <Check className="size-2.5" />
                  )}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm">
                    {repository.fullName}
                  </span>
                  <span className="text-paragraph mt-0.5 block font-mono text-[0.6875rem]">
                    {repository.defaultBranch}
                  </span>
                </span>
                {repository.private && (
                  <Badge variant="outline" className="shrink-0">
                    Private
                  </Badge>
                )}
                {repository.archived && (
                  <Badge variant="secondary" className="shrink-0">
                    Archived
                  </Badge>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
