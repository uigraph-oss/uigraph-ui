import { cn } from '@/lib/utils'
import { AlertTriangle, ChevronRight, Sparkles, Wrench } from 'lucide-react'
import { formatDuration } from '../../lib/format-duration'
import { formatUsd } from '../lib/agent-session-format'

export type AgentSessionStepRow = {
  id: string
  seq: number
  kind: string
  name?: string | null
  modelName?: string | null
  input?: unknown
  output?: unknown
  text?: string | null
  finishReason?: string | null
  error?: string | null
  inputTokens?: number | null
  outputTokens?: number | null
  reasoningTokens?: number | null
  cachedInputTokens?: number | null
  cachedOutputTokens?: number | null
  costUsd?: number | null
  startedAt: string
  completedAt: string
  durationMs: number
}

export function AgentSessionSteps({ steps }: { steps: AgentSessionStepRow[] }) {
  if (steps.length === 0) {
    return (
      <p className="text-paragraph px-6 py-8 text-center text-sm">
        No steps recorded for this run.
      </p>
    )
  }

  const slowestStepMs = Math.max(...steps.map((step) => step.durationMs), 1)

  return (
    <ol>
      {steps.map((step, index) => (
        <li key={step.id} className="flex gap-4 px-6 py-4">
          <div className="flex shrink-0 flex-col items-center">
            <span
              className={cn(
                'flex size-8 items-center justify-center rounded-full',
                step.error
                  ? 'bg-destructive/10 text-destructive'
                  : step.kind === 'llm'
                    ? 'bg-muted/40 text-foreground'
                    : 'bg-muted/25 text-paragraph'
              )}
            >
              {step.error ? (
                <AlertTriangle className="size-4" />
              ) : step.kind === 'llm' ? (
                <Sparkles className="size-4" />
              ) : (
                <Wrench className="size-4" />
              )}
            </span>
            {index === steps.length - 1 ? null : (
              <span className="bg-stock mt-2 w-px flex-1" />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-start gap-3">
              <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-3 gap-y-1">
                <span className="text-paragraph font-mono text-xs tabular-nums">
                  {String(step.seq).padStart(2, '0')}
                </span>
                <span className="text-foreground text-sm font-medium">
                  {step.kind === 'llm'
                    ? (step.modelName ?? 'Model turn')
                    : (step.name ?? 'Tool call')}
                </span>
                {step.finishReason ? (
                  <span className="bg-muted/40 text-paragraph rounded-full px-2 py-0.5 font-mono text-[11px]">
                    {step.finishReason}
                  </span>
                ) : null}
                {step.costUsd === null || step.costUsd === undefined ? null : (
                  <span className="text-paragraph font-mono text-xs tabular-nums">
                    {formatUsd(step.costUsd)}
                  </span>
                )}
              </div>

              <span className="text-paragraph shrink-0 font-mono text-xs tabular-nums">
                {formatDuration(step.durationMs)}
              </span>
            </div>

            {step.kind === 'llm' ? (
              <p className="text-paragraph mt-2 font-mono text-xs tabular-nums">
                {[
                  formatTokens('in', step.inputTokens),
                  formatTokens('out', step.outputTokens),
                  formatTokens('reasoning', step.reasoningTokens),
                  formatTokens('cache read', step.cachedInputTokens),
                  formatTokens('cache write', step.cachedOutputTokens),
                ]
                  .filter((part) => part !== null)
                  .join('  ·  ')}
              </p>
            ) : null}

            {step.text ? (
              <p className="text-paragraph mt-2 text-sm whitespace-pre-wrap">
                {step.text}
              </p>
            ) : null}

            {step.error ? (
              <p className="text-destructive mt-2 text-sm break-words">
                {step.error}
              </p>
            ) : null}

            {step.input === null || step.input === undefined ? null : (
              <Payload label="Input" value={step.input} />
            )}

            {step.output === null || step.output === undefined ? null : (
              <Payload label="Output" value={step.output} />
            )}
          </div>
        </li>
      ))}
    </ol>
  )
}

function formatTokens(label: string, value: number | null | undefined) {
  if (value === null || value === undefined) {
    return null
  }

  return `${label} ${value.toLocaleString()}`
}

function Payload({ label, value }: { label: string; value: unknown }) {
  return (
    <details className="group mt-2">
      <summary className="text-paragraph hover:text-foreground flex cursor-pointer list-none items-center gap-1.5 font-mono text-xs select-none">
        <ChevronRight className="size-3 transition-transform group-open:rotate-90" />
        {label}
      </summary>
      <pre className="border-stock/60 bg-shading-gray/60 text-paragraph mt-2 max-h-64 overflow-auto rounded-md border p-3 font-mono text-xs">
        {JSON.stringify(value, null, 2)}
      </pre>
    </details>
  )
}
