import { cn } from '@/lib/utils'
import {
  AlertCircle,
  Check,
  FileCode2,
  Github,
  Loader2,
  Network,
} from 'lucide-react'
import type { ReactNode } from 'react'

const STAGES: { key: string; icon: ReactNode; label: string }[] = [
  {
    key: 'repository',
    icon: <Github className="size-5" />,
    label: 'Your repository',
  },
  {
    key: 'artifacts',
    icon: <FileCode2 className="size-5" />,
    label: 'Generating artifacts',
  },
  {
    key: 'uigraph',
    icon: <Network className="size-5" />,
    label: 'Publishing to UIGraph',
  },
]

// stage is the index of the stage that is genuinely in progress. A stage is
// only drawn as complete when the real work behind it has finished, so the
// animation loops in place rather than running ahead of GitHub.
export function PipelineIllustration({
  stage,
  done,
  failed,
}: {
  stage: number
  done: boolean
  failed: boolean
}) {
  return (
    <div className="border-stock bg-stock/20 flex items-center justify-center gap-2 rounded-2xl border px-4 py-8 sm:gap-4 sm:px-8">
      {STAGES.map((item, index) => {
        const complete = done || index < stage
        const active = !done && index === stage
        const errored = failed && index === stage

        return (
          <div key={item.key} className="flex items-center gap-2 sm:gap-4">
            {index > 0 && (
              <span className="relative flex h-px w-8 items-center sm:w-16">
                <span
                  className={cn(
                    'h-px w-full',
                    complete && 'bg-primary',
                    !complete && 'bg-stock'
                  )}
                />
                {active && !failed && (
                  <span className="bg-primary absolute left-1/2 size-1.5 -translate-x-1/2 animate-ping rounded-full" />
                )}
              </span>
            )}

            <div className="flex w-20 flex-col items-center gap-2 sm:w-28">
              <span
                className={cn(
                  'flex size-12 items-center justify-center rounded-2xl border transition-colors',
                  errored &&
                    'border-destructive/40 bg-destructive/10 text-destructive',
                  !errored &&
                    complete &&
                    'border-primary/40 bg-primary/10 text-primary',
                  !errored &&
                    active &&
                    'border-primary bg-primary/5 text-primary',
                  !errored &&
                    !complete &&
                    !active &&
                    'border-stock text-paragraph/50'
                )}
              >
                {errored && <AlertCircle className="size-5" />}
                {!errored && complete && <Check className="size-5" />}
                {!errored && active && (
                  <Loader2 className="size-5 animate-spin" />
                )}
                {!errored && !complete && !active && item.icon}
              </span>
              <span
                className={cn(
                  'text-center text-[0.6875rem] leading-tight',
                  active && 'text-foreground font-medium',
                  !active && 'text-paragraph'
                )}
              >
                {item.label}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
