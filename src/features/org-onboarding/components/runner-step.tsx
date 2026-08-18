import { OnboardingRunner } from '@/api/.gql/graphql'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { ArrowLeft, ArrowRight, Check, Loader2 } from 'lucide-react'
import { type ReactNode, useState } from 'react'
import { LuCloud, LuGithub } from 'react-icons/lu'
import { MappingRunAnimation } from './mapping-run-animation'
import { OnboardingLayout } from './onboarding-layout'
import {
  OnboardingStepTicks,
  OnboardingStepTitle,
  StepIntro,
} from './onboarding-ui'

export function RunnerStep({
  headerRight,
  runner,
  onBack,
  onNext,
}: {
  headerRight: ReactNode
  runner: OnboardingRunner | null
  onBack: () => void
  onNext: (runner: OnboardingRunner) => Promise<void>
}) {
  const [isSaving, setIsSaving] = useState(false)

  async function handleChoose(chosen: OnboardingRunner) {
    if (isSaving) return
    setIsSaving(true)
    await onNext(chosen)
    setIsSaving(false)
  }

  return (
    <OnboardingLayout
      headerLeftContent={<OnboardingStepTitle current={0} />}
      headerCenterContent={<OnboardingStepTicks current={0} />}
      headerRightContent={headerRight}
    >
      <div className="mx-auto grid w-full max-w-5xl gap-x-12 gap-y-8 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] lg:items-center">
        <div className="min-w-0">
          <StepIntro
            title="Where should the mapping run?"
            description="UIGraph reads your repository, builds the graph, and pushes the artifacts back on a branch of its own."
          />

          <div className="mt-8 space-y-3">
            <button
              type="button"
              disabled={isSaving}
              className="group border-stock bg-shading hover:border-primary/50 hover:bg-primary/[0.06] focus-visible:ring-primary/40 flex w-full items-center gap-4 rounded-xl border p-4 text-left transition-colors focus-visible:ring-2 focus-visible:outline-none"
              onClick={() => void handleChoose(OnboardingRunner.GithubActions)}
            >
              <span className="border-stock bg-shading-gray group-hover:border-primary/40 group-hover:text-primary flex size-11 shrink-0 items-center justify-center rounded-lg border transition-colors">
                <LuGithub className="size-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex flex-wrap items-center gap-2 text-sm font-medium">
                  GitHub Actions
                  {runner === OnboardingRunner.GithubActions && (
                    <span className="border-success/40 bg-success/10 text-success inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[0.625rem]">
                      <Check className="size-2.5" /> Chosen
                    </span>
                  )}
                </span>
                <span className="text-paragraph mt-1 block text-sm">
                  Runs on your own runners, so your code never leaves GitHub.
                </span>
              </span>
              {isSaving && (
                <Loader2 className="text-primary size-4 shrink-0 animate-spin" />
              )}
              {!isSaving && (
                <ArrowRight className="text-paragraph group-hover:text-primary size-4 shrink-0 transition-all group-hover:translate-x-0.5" />
              )}
            </button>

            <div className="border-stock/60 flex w-full items-center gap-4 rounded-xl border border-dashed p-4 opacity-55">
              <span className="border-stock/60 flex size-11 shrink-0 items-center justify-center rounded-lg border border-dashed">
                <LuCloud className="size-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex flex-wrap items-center gap-2 text-sm font-medium">
                  UIGraph Sandbox
                  <span className="border-stock text-paragraph rounded border px-1.5 py-0.5 font-mono text-[0.625rem]">
                    Coming soon
                  </span>
                </span>
                <span className="text-paragraph mt-1 block text-sm">
                  Runs in a UIGraph-hosted sandbox, with no workflow files
                  added.
                </span>
              </span>
            </div>
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
