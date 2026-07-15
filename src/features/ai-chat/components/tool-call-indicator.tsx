import { TextShimmer } from '@/components/ui/text-shimmer'

type ToolPart = {
  type: string
  toolName?: string
  state?: string
  input?: unknown
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

export function ToolCallIndicator({ part }: { part: ToolPart }) {
  const name = toolName(part)
  const summary = paramSummary(part.input)
  const label = summary ? `${name} · ${summary}` : name
  const isRunning =
    part.state !== 'output-available' && part.state !== 'output-error'

  if (isRunning) {
    return (
      <TextShimmer
        as="span"
        duration={1.2}
        className="my-0.5 block max-w-full truncate font-mono text-xs"
      >
        {label}
      </TextShimmer>
    )
  }

  return (
    <span className="text-foreground/70 my-0.5 block max-w-full truncate font-mono text-xs">
      {label}
    </span>
  )
}
