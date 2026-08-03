import { cn } from '@/lib/utils'
import { AlertTriangle, Sparkles, Wrench } from 'lucide-react'
import { useState } from 'react'
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
  const [openPayload, setOpenPayload] = useState<string | null>(null)

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
        <li
          key={step.id}
          className={cn(
            'px-6 py-3.5',
            step.kind === 'llm' ? 'bg-transparent' : 'bg-shading-gray/10'
          )}
        >
          <div className="flex items-center gap-3">
            <div className="flex w-11 shrink-0 items-center gap-2">
              <span className="text-paragraph font-mono text-xs tabular-nums">
                {String(step.seq).padStart(2, '0')}
              </span>
              {step.error ? (
                <AlertTriangle className="text-destructive size-3.5" />
              ) : step.kind === 'llm' ? (
                <Sparkles className="text-foreground size-3.5" />
              ) : (
                <Wrench className="text-paragraph size-3.5" />
              )}
            </div>

            <span
              className={cn(
                'min-w-0 truncate text-sm',
                step.error ? 'text-destructive' : 'text-foreground'
              )}
            >
              {step.kind === 'llm'
                ? (step.modelName ?? 'Model turn')
                : (step.name ?? 'Tool call')}
            </span>

            {step.input === null || step.input === undefined ? null : (
              <PayloadButton
                label="Input"
                active={openPayload === `${step.id}-input`}
                onClick={() =>
                  setOpenPayload(
                    openPayload === `${step.id}-input`
                      ? null
                      : `${step.id}-input`
                  )
                }
              />
            )}

            {step.output === null || step.output === undefined ? null : (
              <PayloadButton
                label="Output"
                active={openPayload === `${step.id}-output`}
                onClick={() =>
                  setOpenPayload(
                    openPayload === `${step.id}-output`
                      ? null
                      : `${step.id}-output`
                  )
                }
              />
            )}

            <span className="text-paragraph ml-auto shrink-0 pl-4 font-mono text-xs tabular-nums">
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
            <p className="text-paragraph mt-2 pl-14 text-sm whitespace-pre-wrap">
              {step.text}
            </p>
          ) : null}

          {step.error ? (
            <p className="text-destructive mt-2 pl-14 text-sm break-words">
              {step.error}
            </p>
          ) : null}

          {openPayload === `${step.id}-input` ? (
            <Payload value={step.input} />
          ) : null}

          {openPayload === `${step.id}-output` ? (
            <Payload value={step.output} />
          ) : null}
        </li>
      ))}
    </ol>
  )
}

function PayloadButton({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'shrink-0 rounded border px-2 py-0.5 font-mono text-[11px] transition-colors',
        active
          ? 'border-stock bg-muted/50 text-foreground'
          : 'border-stock/70 text-paragraph hover:border-stock hover:text-foreground'
      )}
    >
      {label}
    </button>
  )
}

function Payload({ value }: { value: unknown }) {
  return (
    <pre className="border-stock bg-shading-gray/80 text-paragraph mt-2 ml-14 max-h-64 overflow-auto rounded-md border p-3 font-mono text-xs">
      {JSON.stringify(value, null, 2)}
    </pre>
  )
}
