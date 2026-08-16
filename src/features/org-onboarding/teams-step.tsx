import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useTeamContext } from '@/features/dashboard-settings/context/team-context'
import { cn } from '@/lib/utils'
import { ArrowLeft, ArrowRight, Check, Loader2 } from 'lucide-react'
import { useState } from 'react'
import {
  fieldClass,
  scrollAreaClass,
  StepBody,
  StepFooter,
  StepHeader,
} from './step-layout'

export function TeamsStep({
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
  const { teams, isTeamsLoading, createTeam } = useTeamContext()
  const [teamName, setTeamName] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState('')

  async function handleAddTeam() {
    const name = teamName.trim()
    if (name === '') return
    setIsCreating(true)
    setError('')
    try {
      const result = await createTeam({ teamName: name })
      const id = result.data?.createTeam.id
      if (!id) throw new Error('The team was created without an ID')
      onSelect({ id, name })
      setTeamName('')
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : 'Could not create the team'
      )
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <>
      <StepHeader
        title="Choose a team"
        description="Every repository you onboard next will be owned by this team."
      />

      <StepBody>
        <div className="shrink-0">
          <Label htmlFor="onboarding-team-name">Create a team</Label>
          <div className="mt-2 flex items-start gap-2">
            <Input
              id="onboarding-team-name"
              value={teamName}
              placeholder="e.g. Engineering"
              autoComplete="off"
              className={cn(fieldClass, 'flex-1')}
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
          {error && <p className="text-destructive mt-2 text-sm">{error}</p>}
        </div>

        <div className="mt-5 flex min-h-0 flex-1 flex-col">
          <Label className="shrink-0">Your teams</Label>

          <div className={cn(scrollAreaClass, 'mt-2 space-y-2 pr-1')}>
            {isTeamsLoading && (
              <div className="text-paragraph flex h-full min-h-24 items-center justify-center gap-2 text-sm">
                <Loader2 className="size-4 animate-spin" /> Loading teams
              </div>
            )}

            {!isTeamsLoading && teams.length === 0 && (
              <div className="border-stock text-paragraph flex h-full min-h-24 items-center justify-center rounded-xl border border-dashed p-6 text-center text-sm">
                No teams yet. Create one above to continue.
              </div>
            )}

            {!isTeamsLoading &&
              teams.map((team) => (
                <button
                  type="button"
                  key={team.teamId}
                  aria-pressed={selectedTeamID === team.teamId}
                  className={cn(
                    'border-stock hover:bg-stock/50 flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-colors',
                    selectedTeamID === team.teamId &&
                      'border-primary bg-primary/5'
                  )}
                  onClick={() =>
                    onSelect({ id: team.teamId, name: team.teamName })
                  }
                >
                  <span
                    className={cn(
                      'flex size-5 shrink-0 items-center justify-center rounded-full border transition-colors',
                      selectedTeamID === team.teamId &&
                        'border-primary bg-primary text-primary-foreground',
                      selectedTeamID !== team.teamId && 'border-stock'
                    )}
                  >
                    {selectedTeamID === team.teamId && (
                      <Check className="size-3" />
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">
                      {team.teamName}
                    </span>
                    <span className="text-paragraph mt-0.5 block text-xs">
                      {team.memberCount}{' '}
                      {team.memberCount === 1 ? 'member' : 'members'}
                    </span>
                  </span>
                </button>
              ))}
          </div>
        </div>
      </StepBody>

      <StepFooter>
        <Button preset="outline" onClick={onBack}>
          <ArrowLeft /> Back
        </Button>
        <Button
          preset="primary"
          disabled={selectedTeamID === null}
          onClick={onNext}
        >
          Continue <ArrowRight />
        </Button>
      </StepFooter>
    </>
  )
}
