import { useTeamContext } from '@/features/dashboard-settings/context/team-context'
import { useEffect, useRef, useState } from 'react'
import { OnboardingShell, StepIntro } from './onboarding-shell'

export function CreateTeamStep({
  onCreated,
}: {
  onCreated: (team: { id: string; name: string }) => Promise<void>
}) {
  const { createTeam } = useTeamContext()
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
      stepIndex={0}
      primary={{
        label: 'Create team',
        onClick: handleCreate,
        disabled: name.trim() === '',
        loading: isCreating,
      }}
    >
      <StepIntro
        title="Name your first team."
        description="A team owns the repositories UIGraph maps. You can add more teams and members later from settings."
      />

      <div className="mt-10">
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
