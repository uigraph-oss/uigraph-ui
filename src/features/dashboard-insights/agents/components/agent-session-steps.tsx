import { cn } from '@/lib/utils'
import { AlertTriangle, Sparkles, Wrench } from 'lucide-react'
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

  return (
    <ol className="divide-stock divide-y">
      {steps.map((step) => (
        <li key={step.id} className="flex gap-4 px-6 py-4">
          <span
            className={cn(
              'flex size-8 shrink-0 items-center justify-center rounded-full',
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

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <span className="text-foreground text-sm font-medium">
                {step.kind === 'llm'
                  ? (step.modelName ?? 'Model turn')
                  : (step.name ?? 'Tool call')}
              </span>
              <span className="text-paragraph text-xs">
                #{step.seq} · {formatDuration(step.durationMs)}
              </span>
              {step.finishReason ? (
                <span className="bg-muted/40 text-paragraph rounded-full px-2 py-0.5 text-xs">
                  {step.finishReason}
                </span>
              ) : null}
              {step.costUsd === null || step.costUsd === undefined ? null : (
                <span className="text-paragraph text-xs tabular-nums">
                  {formatUsd(step.costUsd)}
                </span>
              )}
            </div>

            {step.kind === 'llm' ? (
              <p className="text-paragraph mt-2 text-xs tabular-nums">
                {formatTokens('in', step.inputTokens)}
                {formatTokens('out', step.outputTokens)}
                {formatTokens('reasoning', step.reasoningTokens)}
                {formatTokens('cache read', step.cachedInputTokens)}
                {formatTokens('cache write', step.cachedOutputTokens)}
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

  return `${label} ${value.toLocaleString()}  `
}

function Payload({ label, value }: { label: string; value: unknown }) {
  return (
    <details className="mt-2">
      <summary className="text-paragraph cursor-pointer text-xs select-none">
        {label}
      </summary>
      <pre className="bg-muted/20 text-paragraph mt-2 max-h-64 overflow-auto rounded-md p-3 text-xs">
        {JSON.stringify(value, null, 2)}
      </pre>
    </details>
  )
}
