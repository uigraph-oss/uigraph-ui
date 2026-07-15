import { TextShimmer } from '@/components/ui/text-shimmer'
import { cn } from '@/lib/utils'
import { useState } from 'react'
import { FiChevronRight } from 'react-icons/fi'

type ToolPart = {
  type: string
  toolName?: string
  state?: string
  input?: unknown
}

export function isToolPart(part: { type: string }): boolean {
  return part.type === 'dynamic-tool' || part.type.startsWith('tool-')
}

function toolName(part: ToolPart): string {
  if (part.type === 'dynamic-tool') {
    return part.toolName ?? 'tool'
  }
  return part.type.replace(/^tool-/, '')
}

function paramSummary(input: unknown): string {
  if (!input || typeof input !== 'object') {
    return ''
  }
  const keys: string[] = []
  for (const [key, value] of Object.entries(input as Record<string, unknown>)) {
    if (value === null || value === undefined || value === '') {
      continue
    }
    keys.push(key)
  }
  return keys.join(', ')
}

export function ToolCallGroup({ parts }: { parts: ToolPart[] }) {
  const [isOpen, setIsOpen] = useState(false)
  const label = parts.map(toolName).join(', ')
  const isRunning = parts.some(
    (part) => part.state !== 'output-available' && part.state !== 'output-error'
  )

  if (parts.length === 1) {
    const name = toolName(parts[0])
    const summary = paramSummary(parts[0].input)
    const single = summary ? `${name} · ${summary}` : name
    return (
      <div className="my-1">
        {isRunning ? (
          <TextShimmer as="span" duration={1.2} className="font-mono text-xs">
            {single}
          </TextShimmer>
        ) : (
          <span className="text-foreground/60 block font-mono text-xs">
            {single}
          </span>
        )}
      </div>
    )
  }

  return (
    <div className="my-1">
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className="text-foreground/70 hover:text-foreground flex items-start gap-1 text-left text-xs transition-colors"
      >
        <FiChevronRight
          className={cn(
            'mt-0.5 size-3 shrink-0 transition-transform',
            isOpen && 'rotate-90'
          )}
        />
        {isRunning ? (
          <TextShimmer as="span" duration={1.2} className="text-xs">
            {label}
          </TextShimmer>
        ) : (
          label
        )}
      </button>

      {isOpen && (
        <div className="mt-1 flex flex-col gap-0.5 pl-4">
          {parts.map((part, i) => {
            const name = toolName(part)
            const summary = paramSummary(part.input)
            return (
              <span
                key={i}
                className="text-foreground/60 block font-mono text-xs"
              >
                {summary ? `${name} · ${summary}` : name}
              </span>
            )
          })}
        </div>
      )}
    </div>
  )
}
