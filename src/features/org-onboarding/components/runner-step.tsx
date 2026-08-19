import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { ArrowLeft, ArrowRight, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { LuGithub, LuTerminal } from 'react-icons/lu'
import { OnboardingRunner } from '../context/onboarding-context'
import { MappingRunAnimation } from './mapping-run-animation'
import { OnboardingLayout } from './onboarding-layout'
import { OnboardingTeamChip } from './onboarding-team-chip'
import { StepIntro } from './onboarding-ui'

export function RunnerStep({
  onBack,
  onNext,
}: {
  onBack: () => void
  onNext: (runner: OnboardingRunner) => Promise<void>
}) {
  const [saving, setSaving] = useState<OnboardingRunner | null>(null)

  async function handleChoose(chosen: OnboardingRunner) {
    if (saving) return
    setSaving(chosen)
    await onNext(chosen)
    setSaving(null)
  }

  const isSaving = saving !== null

  return (
    <OnboardingLayout headerRightContent={<OnboardingTeamChip />}>
      <div className="mx-auto grid w-full max-w-6xl gap-x-20 gap-y-8 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] lg:items-center">
        <div className="min-w-0">
          <StepIntro
            title="Where should UIGraph run?"
            description="UIGraph reads your repository, builds the graph, and pushes the artifacts back on a branch of its own."
          />

          <div className="mt-8 space-y-3">
            <button
              type="button"
              disabled={isSaving}
              className="group border-stock bg-shading hover:border-paragraph/30 hover:bg-stock/50 focus-visible:ring-primary/40 flex w-full items-center gap-4 rounded-xl border p-4 text-left transition-colors focus-visible:ring-2 focus-visible:outline-none"
              onClick={() => void handleChoose(OnboardingRunner.GithubActions)}
            >
              <span className="border-stock/70 text-paragraph flex size-11 shrink-0 items-center justify-center rounded-lg border">
                <LuGithub className="size-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-medium">
                  GitHub Actions
                </span>
                <span className="text-paragraph mt-1 block text-sm">
                  Runs on your own runners, so your code never leaves GitHub.
                </span>
              </span>
              {saving === OnboardingRunner.GithubActions && (
                <Loader2 className="text-paragraph size-4 shrink-0 animate-spin" />
              )}
              {saving !== OnboardingRunner.GithubActions && (
                <ArrowRight className="text-paragraph/50 group-hover:text-paragraph size-4 shrink-0 transition-colors" />
              )}
            </button>

            <button
              type="button"
              disabled={isSaving}
              className="group border-stock bg-shading hover:border-paragraph/30 hover:bg-stock/50 focus-visible:ring-primary/40 flex w-full items-center gap-4 rounded-xl border p-4 text-left transition-colors focus-visible:ring-2 focus-visible:outline-none"
              onClick={() => void handleChoose(OnboardingRunner.CodingAgent)}
            >
              <span className="border-stock/70 text-paragraph flex size-11 shrink-0 items-center justify-center rounded-lg border">
                <LuTerminal className="size-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex flex-wrap items-center gap-2 text-sm font-medium">
                  Start with a coding agent
                  <span className="border-primary/40 text-primary rounded border px-1.5 py-0.5 font-mono text-[0.625rem]">
                    Recommended
                  </span>
                </span>
                <span className="text-paragraph mt-1 block text-sm">
                  Paste one prompt into Claude Code or Cursor. It reads the
                  guide, sets itself up, and maps the repository with you.
                </span>
              </span>
              {saving === OnboardingRunner.CodingAgent && (
                <Loader2 className="text-paragraph size-4 shrink-0 animate-spin" />
              )}
              {saving !== OnboardingRunner.CodingAgent && (
                <ArrowRight className="text-paragraph/50 group-hover:text-paragraph size-4 shrink-0 transition-colors" />
              )}
            </button>
          </div>

          <div className="mt-8">
            <Button
              preset="outline"
              className={cn(
                'h-11 rounded-[0.625rem] px-5',
                isSaving && 'pointer-events-none opacity-60'
              )}
              onClick={onBack}
            >
              <ArrowLeft /> Back
            </Button>
          </div>
        </div>

        <div className="hidden min-w-0 lg:block">
          <MappingRunAnimation />
        </div>
      </div>
    </OnboardingLayout>
  )
}
