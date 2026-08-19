import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { RiOpenaiFill } from 'react-icons/ri'
import { SiClaude, SiCursor, SiGithub } from 'react-icons/si'
import { OnboardingRunner } from '../context/onboarding-context'
import { MappingRunAnimation } from './mapping-run-animation'
import { OnboardingLayout } from './onboarding-layout'
import { OnboardingTeamChip } from './onboarding-team-chip'
import { StepIntro } from './onboarding-ui'

const AGENT_ICONS = [
  { name: 'Claude', icon: SiClaude, size: 'size-5' },
  { name: 'Codex', icon: RiOpenaiFill, size: 'size-[1.5rem]' },
  { name: 'Cursor', icon: SiCursor, size: 'size-5' },
]

const AGENT_PLACES = [
  { x: 0, scale: 1, opacity: 1, filter: 'blur(0px)', zIndex: 2 },
  { x: 12, scale: 0.5, opacity: 0.18, filter: 'blur(1.5px)', zIndex: 1 },
  { x: -12, scale: 0.5, opacity: 0.18, filter: 'blur(1.5px)', zIndex: 1 },
]

function AgentIcons() {
  const [front, setFront] = useState(0)

  useEffect(() => {
    const timer = window.setInterval(
      () => setFront((current) => (current + 1) % AGENT_ICONS.length),
      2200
    )
    return () => window.clearInterval(timer)
  }, [])

  return (
    <span className="border-stock/70 text-paragraph relative flex size-11 shrink-0 items-center justify-center rounded-lg border">
      {AGENT_ICONS.map((agent, index) => (
        <motion.span
          key={agent.name}
          className="absolute flex items-center justify-center"
          animate={
            AGENT_PLACES[
              (index - front + AGENT_ICONS.length) % AGENT_ICONS.length
            ]
          }
          transition={{ duration: 0.7, ease: 'easeInOut' }}
        >
          <agent.icon className={agent.size} />
        </motion.span>
      ))}
    </span>
  )
}

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
                <SiGithub className="size-5" />
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
              <AgentIcons />
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-medium">
                  Start with a coding agent
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
