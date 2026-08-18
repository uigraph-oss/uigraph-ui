import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useTeamContext } from '@/features/dashboard-settings/context/team-context'
import { Loader2, Users } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { AiOutlineUsergroupAdd } from 'react-icons/ai'
import { OnboardingLayout } from './onboarding-layout'

export function CreateTeamStep({
  onContinue,
  onSkip,
}: {
  onContinue: (team: { id: string; name: string }) => Promise<void>
  onSkip: () => void
}) {
  const { teams, isTeamsLoading, createTeam } = useTeamContext()
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
      await onContinue({ id, name: teamName })
    } catch (caught) {
      setIsCreating(false)
      setError(
        caught instanceof Error ? caught.message : 'Could not create the team'
      )
    }
  }

  function handleSkip() {
    onSkip()
  }

  return (
    <OnboardingLayout>
      <div className="mx-auto w-full max-w-lg">
        <div className="border-stock bg-shading mb-5 flex size-10 items-center justify-center rounded-xl border">
          <Users className="size-5" />
        </div>
        <h1 className="text-2xl font-medium tracking-tight">
          {teams.length === 0 ? 'Name your first team' : 'Name a new team'}
        </h1>
        <p className="text-paragraph mt-3 text-sm leading-relaxed">
          A team owns the repositories UIGraph imports. You can add more teams
          and members later from settings.
        </p>

        <div className="mt-8">
          <Label htmlFor="onboarding-team-name">Team name</Label>
          <div className="mt-2 flex items-start gap-2">
            <Input
              id="onboarding-team-name"
              ref={inputRef}
              value={name}
              placeholder="e.g. Engineering"
              autoComplete="off"
              maxLength={64}
              className="h-[2.7938125rem] flex-1 rounded-[0.80315625rem]"
              onChange={(event) => setName(event.target.value)}
              onKeyDown={(event) => {
                if (event.key !== 'Enter') return
                event.preventDefault()
                void handleCreate()
              }}
            />
            <Button
              preset="primary"
              className="h-[2.7938125rem] shrink-0 rounded-[0.80315625rem]"
              disabled={name.trim() === '' || isCreating}
              onClick={handleCreate}
            >
              {isCreating ? (
                <Loader2 className="animate-spin" />
              ) : (
                <AiOutlineUsergroupAdd />
              )}
              Create team
            </Button>
          </div>
          {error && <p className="text-destructive mt-2 text-sm">{error}</p>}
        </div>

        {!isTeamsLoading && teams.length > 0 && (
          <div className="mt-8">
            <Label>Your teams</Label>
            <div className="border-stock mt-2 overflow-hidden rounded-xl border">
              <ul className="better-scrollbar divide-stock max-h-56 divide-y overflow-y-auto">
                {teams.map((team) => (
                  <li
                    key={team.teamId}
                    className="flex items-center justify-between gap-4 px-4 py-2.5"
                  >
                    <span className="truncate text-sm">{team.teamName}</span>
                    {team.memberCount > 0 && (
                      <span className="text-paragraph shrink-0 text-xs">
                        {team.memberCount === 1
                          ? '1 member'
                          : `${team.memberCount} members`}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-4 flex justify-center">
              <Button
                preset="ghost"
                className="text-paragraph h-8 rounded-[0.625rem] px-3 text-xs has-[>svg]:px-3"
                disabled={isCreating}
                onClick={handleSkip}
              >
                Skip for now
              </Button>
            </div>
          </div>
        )}
      </div>
    </OnboardingLayout>
  )
}
