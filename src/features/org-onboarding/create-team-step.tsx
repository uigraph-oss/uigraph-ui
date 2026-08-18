import { useTeamContext } from '@/features/dashboard-settings/context/team-context'
import { AnimatePresence, motion } from 'framer-motion'
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
  const [created, setCreated] = useState('')
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
      setCreated(teamName)
      window.setTimeout(() => void onCreated({ id, name: teamName }), 700)
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
        disabled: name.trim() === '' || created !== '',
        loading: isCreating,
      }}
    >
      <div className="mx-auto max-w-xl">
        <StepIntro
          eyebrow="Set up · 6 steps"
          title="Name your first team."
          description="A team owns the repositories UIGraph maps. You can add more teams and members later from settings."
        />

        <AnimatePresence mode="wait">
          {created === '' && (
            <motion.div
              key="field"
              exit={{ opacity: 0, y: -8 }}
              className="mt-12"
            >
              <label
                htmlFor="onboarding-team-name"
                className="text-paragraph font-mono text-[0.6875rem] tracking-[0.18em] uppercase"
              >
                Team name
              </label>
              <div className="border-stock focus-within:border-primary mt-3 flex items-baseline gap-3 border-b pb-3 transition-colors">
                <span className="text-primary font-mono text-2xl">/</span>
                <input
                  id="onboarding-team-name"
                  ref={inputRef}
                  value={name}
                  autoComplete="off"
                  placeholder="platform"
                  maxLength={64}
                  className="placeholder:text-paragraph/30 min-w-0 flex-1 bg-transparent text-2xl outline-none lg:text-3xl"
                  onChange={(event) => setName(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key !== 'Enter') return
                    event.preventDefault()
                    void handleCreate()
                  }}
                />
                <span className="text-paragraph/50 shrink-0 font-mono text-[0.6875rem]">
                  {name.length}/64
                </span>
              </div>
              {error && (
                <p className="text-destructive mt-3 text-sm">{error}</p>
              )}
            </motion.div>
          )}

          {created !== '' && (
            <motion.div key="chip" className="mt-12 flex items-center">
              <motion.span
                layoutId="onboarding-team-chip"
                className="border-success/40 bg-success/10 rounded-full border px-5 py-2 font-mono text-sm tracking-[0.08em]"
              >
                {created}
              </motion.span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </OnboardingShell>
  )
}
