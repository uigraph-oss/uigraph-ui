import { OnboardingRunner } from '@/api/.gql/graphql'
import { cn } from '@/lib/utils'
import { Check, FlaskConical, Workflow } from 'lucide-react'
import { useState } from 'react'
import { OnboardingShell, StepIntro } from './onboarding-shell'
import { WorkflowPreview } from './visuals/workflow-preview'

export function RunnerStep({
  teamName,
  runner,
  onBack,
  onNext,
}: {
  teamName: string | null
  runner: OnboardingRunner | null
  onBack: () => void
  onNext: (runner: OnboardingRunner) => Promise<void>
}) {
  const [selected, setSelected] = useState(runner)
  const [isSaving, setIsSaving] = useState(false)

  async function handleNext() {
    if (!selected) return
    setIsSaving(true)
    await onNext(selected)
    setIsSaving(false)
  }

  return (
    <OnboardingShell
      stepIndex={1}
      teamName={teamName}
      onBack={onBack}
      primary={{
        label: 'Continue',
        onClick: handleNext,
        disabled: selected === null,
        loading: isSaving,
      }}
      aside={<WorkflowPreview />}
    >
      <StepIntro
        eyebrow="Runner"
        title="Where should the mapping run?"
        description="UIGraph reads your repository, builds the graph, and pushes the artifacts back on a branch of its own."
      />

      <div className="mt-10 grid gap-3">
        <button
          type="button"
          role="radio"
          aria-checked={selected === OnboardingRunner.GithubActions}
          className={cn(
            'group rounded-2xl border p-5 text-left transition-colors',
            selected === OnboardingRunner.GithubActions &&
              'border-primary bg-primary/5',
            selected !== OnboardingRunner.GithubActions &&
              'border-stock hover:border-paragraph/50'
          )}
          onClick={() => setSelected(OnboardingRunner.GithubActions)}
        >
          <div className="flex items-center gap-3">
            <span
              className={cn(
                'flex size-9 shrink-0 items-center justify-center rounded-lg transition-colors',
                selected === OnboardingRunner.GithubActions &&
                  'bg-primary text-primary-foreground',
                selected !== OnboardingRunner.GithubActions &&
                  'bg-stock text-paragraph'
              )}
            >
              <Workflow className="size-4" />
            </span>
            <span className="flex-1 font-medium">GitHub Actions</span>
            {selected === OnboardingRunner.GithubActions && (
              <span className="text-primary flex items-center gap-1.5 font-mono text-[0.625rem] tracking-[0.18em] uppercase">
                <Check className="size-3.5" /> Selected
              </span>
            )}
          </div>
          <p className="text-paragraph mt-3 text-sm leading-relaxed">
            Runs on your own runners. Your code never leaves GitHub.
          </p>
        </button>

        <div className="border-stock rounded-2xl border border-dashed p-5 opacity-50">
          <div className="flex items-center gap-3">
            <span className="bg-stock text-paragraph flex size-9 shrink-0 items-center justify-center rounded-lg">
              <FlaskConical className="size-4" />
            </span>
            <span className="flex-1 font-medium">UIGraph Sandbox</span>
            <span className="text-paragraph font-mono text-[0.625rem] tracking-[0.18em] uppercase">
              Coming soon
            </span>
          </div>
          <p className="text-paragraph mt-3 text-sm leading-relaxed">
            Runs in a UIGraph-hosted sandbox, with no workflows added.
          </p>
        </div>
      </div>
    </OnboardingShell>
  )
}
