import { useTeamContext } from '@/features/dashboard-settings/context/team-context'
import { useEffect, useRef, useState } from 'react'
import { OnboardingShell, StepIntro } from './onboarding-shell'

export function CreateTeamStep({
  onCreated,
}: {
  onCreated: (team: { id: string; name: string }) => Promise<void>
}) {
  const { teams, createTeam } = useTeamContext()
  const inputRef = useRef<HTMLInputElement>(null)
  const [name, setName] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => inputRef.current?.focus(), [])

  async function handleCreate() {
    const teamName = name.trim()
    if (teamName === '' || isCreating) return
    setIsCreating(true)
    setError('')
    try {
      const result = await createTeam({ teamName })
      const id = result.data?.createTeam.id
      if (!id) throw new Error('The team was created without an ID')
      await onCreated({ id, name: teamName })
    } catch (caught) {
      setIsCreating(false)
      setError(
        caught instanceof Error ? caught.message : 'Could not create the team'
      )
    }
  }

  return (
    <OnboardingShell
      primary={{
        label: 'Create team',
        onClick: handleCreate,
        disabled: name.trim() === '',
        loading: isCreating,
      }}
    >
      <StepIntro
        title={teams.length === 0 ? 'Name your first team.' : 'Name a team.'}
        description="A team owns the repositories UIGraph maps. You can add more teams and members later from settings."
      />

      {teams.length > 0 && (
        <div className="border-stock mt-8 rounded-xl border">
          <p className="border-stock text-paragraph border-b px-4 py-2.5 text-xs">
            Teams in this organization
          </p>
          <ul className="divide-stock divide-y">
            {teams.map((team) => (
              <li
                key={team.teamId}
                className="flex items-center justify-between gap-4 px-4 py-2.5"
              >
                <span className="truncate text-sm">{team.teamName}</span>
                <span className="text-paragraph shrink-0 text-xs">
                  {team.memberCount === 1
                    ? '1 member'
                    : `${team.memberCount} members`}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-8">
        <label htmlFor="onboarding-team-name" className="text-sm font-medium">
          Team name
        </label>
        <input
          id="onboarding-team-name"
          ref={inputRef}
          value={name}
          autoComplete="off"
          placeholder="Platform"
          maxLength={64}
          className="border-stock focus:border-primary placeholder:text-paragraph/40 mt-3 w-full border-b bg-transparent pb-2 text-xl transition-colors outline-none"
          onChange={(event) => setName(event.target.value)}
          onKeyDown={(event) => {
            if (event.key !== 'Enter') return
            event.preventDefault()
            void handleCreate()
          }}
        />
        {error && <p className="text-destructive mt-2 text-sm">{error}</p>}
      </div>
    </OnboardingShell>
  )
}
