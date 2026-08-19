import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { ArrowUpRight, BookOpen, Check, Copy } from 'lucide-react'
import { useState } from 'react'
import { OnboardingLayout } from './onboarding-layout'
import { OnboardingTeamChip } from './onboarding-team-chip'
import { OnboardingActions, StepIntro } from './onboarding-ui'

const DOCS_URL = 'https://docs.uigraph.app/uigraph-cli/skill-onboarding'

const PROMPT = `Onboard this project into UIGraph.

Read ${DOCS_URL} and follow it from start to finish. It names the UIGraph authoring skill and how to install it — install it yourself, then use it to generate and sync this project's artifacts.

When you are done I expect:
- .uigraph.yaml at the project root
- the generated artifacts under .uigraph/
- uigraph-cli sync --dry-run passing
- all of it committed on a branch of its own, with no application code touched

Ask me whenever the project is ambiguous about ownership, boundaries, or naming.`

const SCRIPT = [
  {
    comment: 'Install the UIGraph skill into Claude Code, Cursor, or Codex',
    command: 'npx skills add uigraph-oss/skills',
  },
  {
    comment: 'Point the agent at UIGraph, then sign in once',
    command: 'npm i -g @uigraph/mcp && uigraph-mcp init',
  },
  {
    comment: 'Install the CLI, then set UIGRAPH_TOKEN from your settings',
    command: 'go install github.com/uigraph-oss/uigraph-cli@latest',
  },
  {
    comment: 'Run the skill from your project root and approve the plan',
    command: '/uigraph',
  },
  {
    comment: 'Preview the push, then sync to this workspace',
    command: 'uigraph-cli sync --dry-run && uigraph-cli sync',
  },
]

const SCRIPT_TEXT = SCRIPT.map(
  (line) => `# ${line.comment}\n${line.command}`
).join('\n\n')

const MODES = [
  {
    id: 'prompt',
    title: 'Hand it to your agent',
    description:
      'Paste one prompt into Claude Code or Cursor. It installs the skill and the CLI itself, then does the rest with you.',
    label: 'Prompt',
  },
  {
    id: 'manual',
    title: 'Run the commands yourself',
    description:
      'The same five steps, from your project root. Reach for this when you want to see every install before it happens.',
    label: 'Commands',
  },
]

function useCopy() {
  const [copied, setCopied] = useState<string | null>(null)

  function copy(key: string, value: string) {
    void navigator.clipboard.writeText(value)
    setCopied(key)
    window.setTimeout(
      () => setCopied((current) => (current === key ? null : current)),
      1500
    )
  }

  return { copied, copy }
}

export function CodingAgentStep({
  onBack,
  onDone,
}: {
  onBack: () => void
  onDone: () => Promise<void>
}) {
  const { copied, copy } = useCopy()
  const [modeID, setModeID] = useState('prompt')
  const [isFinishing, setIsFinishing] = useState(false)

  const mode = MODES.find((entry) => entry.id === modeID) ?? MODES[0]
  const panelText = modeID === 'prompt' ? PROMPT : SCRIPT_TEXT

  return (
    <OnboardingLayout
      headerRightContent={<OnboardingTeamChip />}
      footer={
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
      }
    >
      <div className="mx-auto grid w-full max-w-6xl gap-x-16 gap-y-10 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] xl:items-stretch">
        <div className="flex min-w-0 flex-col">
          <StepIntro
            title="Add your project to UIGraph."
            description="Open your project in Claude Code or Cursor and let the agent do the setup. It writes the docs, diagrams, and API specs into .uigraph/ and syncs them here — your code never leaves your machine."
          />

          <div className="relative mt-7 pl-5">
            <span className="bg-stock absolute inset-y-0 left-0 w-0.5 rounded-full" />
            {MODES.map((entry) => (
              <button
                key={entry.id}
                type="button"
                aria-pressed={entry.id === modeID}
                onClick={() => setModeID(entry.id)}
                className="group relative block w-full py-3.5 text-left"
              >
                <span
                  className={cn(
                    'absolute inset-y-0 -left-5 w-0.5 rounded-full transition-colors',
                    entry.id === modeID && 'bg-primary',
                    entry.id !== modeID &&
                      'group-hover:bg-paragraph/40 bg-transparent'
                  )}
                />
                <span
                  className={cn(
                    'block text-sm font-medium transition-colors',
                    entry.id === modeID && 'text-foreground',
                    entry.id !== modeID &&
                      'text-paragraph group-hover:text-foreground'
                  )}
                >
                  {entry.title}
                </span>
                <span
                  className={cn(
                    'mt-1 block max-w-md text-sm leading-relaxed transition-colors',
                    entry.id === modeID && 'text-paragraph',
                    entry.id !== modeID && 'text-paragraph/60'
                  )}
                >
                  {entry.description}
                </span>
              </button>
            ))}
          </div>

          <a
            href={DOCS_URL}
            target="_blank"
            rel="noreferrer"
            className="group text-paragraph hover:text-foreground mt-7 inline-flex items-center gap-2 self-start text-sm transition-colors xl:mt-auto xl:pt-7"
          >
            <BookOpen className="size-4" />
            Read the onboarding guide
            <ArrowUpRight className="size-3.5 opacity-40 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100" />
          </a>
        </div>

        <div className="border-stock bg-shading/40 flex h-[26rem] min-w-0 flex-col overflow-hidden rounded-xl border">
          <div className="border-stock/70 flex shrink-0 items-center justify-between gap-4 border-b py-2 pr-2 pl-4">
            <span className="text-paragraph/70 text-xs">{mode.label}</span>
            <Button
              preset="ghost"
              onClick={() => copy('panel', panelText)}
              className="text-paragraph hover:text-foreground h-7 rounded-md px-2 text-xs"
            >
              {copied === 'panel' && (
                <Check className="text-success size-3.5" />
              )}
              {copied !== 'panel' && <Copy className="size-3.5" />}
              {copied === 'panel' && 'Copied'}
              {copied !== 'panel' && 'Copy'}
            </Button>
          </div>

          {modeID === 'prompt' && (
            <pre className="better-scrollbar text-foreground/85 flex-1 overflow-auto px-4 py-4 font-mono text-xs leading-relaxed whitespace-pre-wrap">
              {PROMPT}
            </pre>
          )}

          {modeID === 'manual' && (
            <div className="better-scrollbar flex-1 overflow-auto py-2">
              {SCRIPT.map((line) => (
                <button
                  key={line.command}
                  type="button"
                  onClick={() => copy(line.command, line.command)}
                  className="group/line hover:bg-stock/40 focus-visible:bg-stock/40 flex w-full items-start gap-3 px-4 py-2.5 text-left transition-colors focus-visible:outline-none"
                >
                  <span className="min-w-0 flex-1 font-mono text-xs leading-relaxed">
                    <span className="text-paragraph/50 block">
                      # {line.comment}
                    </span>
                    <span className="mt-1 flex gap-2">
                      <span className="text-paragraph/40 select-none">$</span>
                      <span className="text-foreground/85 min-w-0 break-all">
                        {line.command}
                      </span>
                    </span>
                  </span>
                  {copied === line.command && (
                    <Check className="text-success mt-4 size-3.5 shrink-0" />
                  )}
                  {copied !== line.command && (
                    <Copy className="text-paragraph/0 group-hover/line:text-paragraph/60 mt-4 size-3.5 shrink-0 transition-colors" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </OnboardingLayout>
  )
}
