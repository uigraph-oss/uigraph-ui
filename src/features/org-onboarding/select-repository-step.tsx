import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { GITHUB_REPOSITORIES } from '@/features/github-import/api'
import { cn } from '@/lib/utils'
import { useQuery } from '@apollo/client'
import { Check, Loader2, Search } from 'lucide-react'
import { useDeferredValue, useState } from 'react'
import { OnboardingShell, StepIntro } from './onboarding-shell'

export function SelectRepositoryStep({
  orgID,
  teamName,
  repoOwner,
  repoName,
  onBack,
  onNext,
}: {
  orgID: string
  teamName: string | null
  repoOwner: string | null
  repoName: string | null
  onBack: () => void
  onNext: (repository: { owner: string; name: string }) => Promise<void>
}) {
  const [search, setSearch] = useState('')
  const [selectedID, setSelectedID] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const deferredSearch = useDeferredValue(search)

  const repositoriesQuery = useQuery(GITHUB_REPOSITORIES, {
    variables: { orgID },
    fetchPolicy: 'network-only',
  })
  const repositories = repositoriesQuery.data?.githubRepositories ?? []
  const selected =
    repositories.find((repository) => repository.githubId === selectedID) ??
    repositories.find(
      (repository) =>
        selectedID === '' &&
        repository.owner === repoOwner &&
        repository.name === repoName
    ) ??
    null
  const visibleRepositories = repositories.filter((repository) =>
    repository.fullName
      .toLowerCase()
      .includes(deferredSearch.trim().toLowerCase())
  )

  async function handleNext() {
    if (!selected) return
    setIsSaving(true)
    await onNext({ owner: selected.owner, name: selected.name })
    setIsSaving(false)
  }

  return (
    <OnboardingShell
      stepIndex={3}
      teamName={teamName}
      actionsAtBottom
      onBack={onBack}
      primary={{
        label: 'Continue',
        onClick: handleNext,
        disabled: selected === null,
        loading: isSaving,
      }}
    >
      <StepIntro
        title="Pick the repository to map."
        description="Start with one. UIGraph documents it end to end, then you can bring in the rest."
      />

      <div className="relative mt-8">
        <Search className="text-paragraph pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2" />
        <Input
          aria-label="Search repositories"
          value={search}
          placeholder="Search repositories"
          className="h-10 rounded-[0.625rem] pl-10"
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>

      <div className="border-stock mt-3 flex h-[22rem] flex-col overflow-hidden rounded-xl border">
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
          <div className="better-scrollbar divide-stock min-h-0 flex-1 divide-y overflow-y-auto">
            {visibleRepositories.map((repository) => (
              <button
                type="button"
                key={repository.githubId}
                role="radio"
                aria-checked={selected?.githubId === repository.githubId}
                disabled={repository.archived}
                className={cn(
                  'hover:bg-stock/25 flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors',
                  repository.archived &&
                    'cursor-not-allowed opacity-50 hover:bg-transparent',
                  selected?.githubId === repository.githubId && 'bg-primary/5'
                )}
                onClick={() => setSelectedID(repository.githubId)}
              >
                <span
                  className={cn(
                    'flex size-4 shrink-0 items-center justify-center rounded-full border transition-colors',
                    selected?.githubId === repository.githubId &&
                      'border-primary bg-primary text-primary-foreground',
                    selected?.githubId !== repository.githubId && 'border-stock'
                  )}
                >
                  {selected?.githubId === repository.githubId && (
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
    </OnboardingShell>
  )
}
