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

  return (
    <ol className="space-y-1.5 p-4">
      {steps.map((step) => (
        <li
          key={step.id}
          className="border-stock bg-shading-gray/50 rounded-lg border px-4 py-2.5"
        >
          <div className="flex items-center gap-3">
            <span className="text-paragraph shrink-0 font-mono text-xs tabular-nums">
              {String(step.seq).padStart(2, '0')}
            </span>

            {step.error ? (
              <AlertTriangle className="text-destructive size-3.5 shrink-0" />
            ) : step.kind === 'llm' ? (
              <Sparkles className="text-foreground size-3.5 shrink-0" />
            ) : (
              <Wrench className="text-paragraph size-3.5 shrink-0" />
            )}

            <span className="text-foreground min-w-0 flex-1 truncate text-sm">
              {step.kind === 'llm'
                ? (step.modelName ?? 'Model turn')
                : (step.name ?? 'Tool call')}
            </span>

            <span className="text-paragraph shrink-0 font-mono text-xs tabular-nums">
              {[
                step.finishReason,
                step.costUsd === null || step.costUsd === undefined
                  ? null
                  : formatUsd(step.costUsd),
                step.kind === 'llm'
                  ? `${((step.inputTokens ?? 0) + (step.outputTokens ?? 0)).toLocaleString()} tok`
                  : null,
                formatDuration(step.durationMs),
              ]
                .filter((part) => part !== null)
                .join('  ·  ')}
            </span>
          </div>

          {step.text ? (
            <p className="text-paragraph mt-1.5 pl-8 text-sm whitespace-pre-wrap">
              {step.text}
            </p>
          ) : null}

          {step.error ? (
            <p className="text-destructive mt-1.5 pl-8 font-mono text-xs break-words">
              {step.error}
            </p>
          ) : null}

          {step.input === null || step.input === undefined ? null : (
            <Payload label="Input" value={step.input} />
          )}

          {step.output === null || step.output === undefined ? null : (
            <Payload label="Output" value={step.output} />
          )}
        </li>
      ))}
    </ol>
  )
}

function Payload({ label, value }: { label: string; value: unknown }) {
  return (
    <details className="group mt-1.5 pl-8">
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
