import { Button } from '@/components/ui/button'
import { BookOpen, Check, Copy } from 'lucide-react'
import { useState } from 'react'
import { LuTerminal } from 'react-icons/lu'
import { OnboardingLayout } from './onboarding-layout'
import { OnboardingTeamChip } from './onboarding-team-chip'
import { OnboardingActions, StepIntro } from './onboarding-ui'

const DOCS_URL = 'https://docs.uigraph.app/onboarding/repository'

const PROMPT = `Onboard this repository into UIGraph.

Read ${DOCS_URL} and follow it from start to finish. It names the UIGraph authoring skill and how to install it — install it yourself, then use it to map this repository.

When you are done I expect:
- .uigraph.yaml at the repository root
- the generated artifacts under .uigraph/
- npx uigraph-cli sync --dry-run passing
- all of it committed on a branch of its own, with no application code touched

Ask me whenever the repository is ambiguous about ownership, boundaries, or naming.`

export function CodingAgentStep({
  onBack,
  onDone,
}: {
  onBack: () => void
  onDone: () => Promise<void>
}) {
  const [copied, setCopied] = useState(false)
  const [isFinishing, setIsFinishing] = useState(false)

  async function handleCopy() {
    await navigator.clipboard.writeText(PROMPT)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1500)
  }

  return (
    <OnboardingLayout headerRightContent={<OnboardingTeamChip />}>
      <div className="mx-auto w-full max-w-2xl">
        <div className="border-stock bg-shading mb-5 flex size-10 items-center justify-center rounded-xl border">
          <LuTerminal className="size-5" />
        </div>

        <div className="flex items-start justify-between gap-6">
          <StepIntro
            title="Hand this prompt to your coding agent."
            description="Open the repository you want mapped in Claude Code or Cursor and paste this in. The agent installs the UIGraph skill on its own and takes it from there — nothing else to set up."
          />

          <Button
            preset="outline"
            asChild
            className="h-11 shrink-0 gap-2 rounded-[0.625rem] px-4 text-sm"
          >
            <a href={DOCS_URL} target="_blank" rel="noreferrer">
              <BookOpen className="size-4" />
              Docs
            </a>
          </Button>
        </div>

        <div className="border-stock bg-shading/40 mt-8 overflow-hidden rounded-xl border">
          <pre className="better-scrollbar max-h-80 overflow-auto px-4 py-4 font-mono text-xs leading-relaxed whitespace-pre-wrap">
            {PROMPT}
          </pre>
          <div className="border-stock bg-shading-gray/40 flex items-center justify-end border-t px-2.5 py-2.5">
            <Button
              preset="ghost"
              className="text-paragraph h-9 rounded-[0.625rem] px-3 text-[0.8125rem]"
              onClick={() => void handleCopy()}
            >
              {copied && <Check className="text-success size-3.5" />}
              {!copied && <Copy className="size-3.5" />}
              {copied ? 'Copied' : 'Copy prompt'}
            </Button>
          </div>
        </div>

        <div className="mt-6">
          <OnboardingActions
            onBack={onBack}
            primary={{
              label: 'Done',
              loading: isFinishing,
              onClick: () => {
                setIsFinishing(true)
                void onDone().finally(() => setIsFinishing(false))
              },
            }}
          />
        </div>
      </div>
    </OnboardingLayout>
  )
}
