import { OnboardingRunner } from '@/api/.gql/graphql'
import { cn } from '@/lib/utils'
import { Check } from 'lucide-react'
import { useState } from 'react'
import { OnboardingShell, StepIntro } from './onboarding-shell'
import { WorkflowPreview } from './workflow-preview'

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
        title="Where should the mapping run?"
        description="UIGraph reads your repository, builds the graph, and pushes the artifacts back on a branch of its own."
      />

      <div className="border-stock divide-stock mt-8 divide-y rounded-xl border">
        <button
          type="button"
          role="radio"
          aria-checked={selected === OnboardingRunner.GithubActions}
          className="hover:bg-stock/25 flex w-full items-start gap-3 p-4 text-left transition-colors"
          onClick={() => setSelected(OnboardingRunner.GithubActions)}
        >
          <span
            className={cn(
              'mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border transition-colors',
              selected === OnboardingRunner.GithubActions &&
                'border-primary bg-primary text-primary-foreground',
              selected !== OnboardingRunner.GithubActions && 'border-stock'
            )}
          >
            {selected === OnboardingRunner.GithubActions && (
              <Check className="size-2.5" />
            )}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-medium">GitHub Actions</span>
            <span className="text-paragraph mt-1 block text-sm">
              Runs on your own runners, so your code never leaves GitHub.
            </span>
          </span>
        </button>

        <div className="flex items-start gap-3 p-4 opacity-45">
          <span className="border-stock mt-0.5 size-4 shrink-0 rounded-full border" />
          <span className="min-w-0 flex-1">
            <span className="flex items-center gap-2 text-sm font-medium">
              UIGraph Sandbox
              <span className="border-stock text-paragraph rounded border px-1.5 py-0.5 font-mono text-[0.625rem]">
                Coming soon
              </span>
            </span>
            <span className="text-paragraph mt-1 block text-sm">
              Runs in a UIGraph-hosted sandbox, with no workflow files added.
            </span>
          </span>
        </div>
      </div>
    </OnboardingShell>
  )
}
