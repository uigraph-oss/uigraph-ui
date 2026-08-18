import { Button } from '@/components/ui/button'
import { useTeamContext } from '@/features/dashboard-settings/context/team-context'
import { ArrowRight, Loader2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { OnboardingLayout } from './onboarding-layout'

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

  const taken = teams.some(
    (team) => team.teamName.toLowerCase() === name.trim().toLowerCase()
  )

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
    <OnboardingLayout>
      <div className="mx-auto w-full max-w-md">
        <div className="text-center">
          <h1 className="text-2xl font-medium tracking-tight">
            {teams.length === 0 ? 'Name your first team' : 'Name a new team'}
          </h1>
          <p className="text-paragraph mx-auto mt-3 max-w-sm text-sm leading-relaxed">
            A team owns the repositories UIGraph maps. You can add more teams
            and members later from settings.
          </p>
        </div>

        <div className="border-stock bg-shading mt-8 rounded-2xl border p-6">
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
            className="border-stock bg-shading-gray focus:border-primary placeholder:text-paragraph/40 mt-2 h-12 w-full rounded-xl border px-4 transition-colors outline-none"
            onChange={(event) => setName(event.target.value)}
            onKeyDown={(event) => {
              if (event.key !== 'Enter') return
              event.preventDefault()
              void handleCreate()
            }}
          />

          {taken && (
            <p className="mt-2 text-xs text-amber-500">
              A team with this name already exists.
            </p>
          )}
          {error && <p className="text-destructive mt-2 text-xs">{error}</p>}

          <Button
            preset="primary"
            className="mt-5 h-11 w-full rounded-xl"
            disabled={name.trim() === '' || isCreating}
            onClick={handleCreate}
          >
            {isCreating && <Loader2 className="animate-spin" />}
            Create team
            <ArrowRight />
          </Button>
        </div>

        {teams.length > 0 && (
          <div className="mt-8">
            <p className="text-paragraph text-center text-xs">
              Teams you already have
            </p>
            <div className="mt-3 flex flex-wrap justify-center gap-2">
              {teams.map((team) => (
                <span
                  key={team.teamId}
                  className="border-stock text-paragraph rounded-full border px-3 py-1 text-xs"
                >
                  {team.teamName}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </OnboardingLayout>
  )
}
