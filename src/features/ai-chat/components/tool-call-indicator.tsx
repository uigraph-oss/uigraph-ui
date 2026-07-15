import { AiOutlineLoading3Quarters } from 'react-icons/ai'
import { FiCheck, FiTool } from 'react-icons/fi'

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
  const parts: string[] = []
  for (const [key, value] of Object.entries(input as Record<string, unknown>)) {
    if (value === null || value === undefined || value === '') {
      continue
    }
    if (typeof value === 'object') {
      continue
    }
    parts.push(`${key}: ${String(value)}`)
  }
  return parts.join(', ')
}

export function ToolCallIndicator({ part }: { part: ToolPart }) {
  const name = toolName(part)
  const summary = paramSummary(part.input)
  const isRunning =
    part.state !== 'output-available' && part.state !== 'output-error'
  const isError = part.state === 'output-error'

  return (
    <div className="my-1 flex max-w-full items-center gap-2 text-[13px]">
      {isRunning ? (
        <AiOutlineLoading3Quarters className="size-3 shrink-0 animate-spin text-gray-400" />
      ) : isError ? (
        <FiTool className="size-3 shrink-0 text-red-400" />
      ) : (
        <FiCheck className="size-3 shrink-0 text-emerald-400" />
      )}

      <span className="text-muted-foreground shrink-0 font-mono text-xs">
        {name}
      </span>

      {summary && (
        <span className="text-muted-foreground/50 truncate font-mono text-xs">
          {summary}
        </span>
      )}
    </div>
  )
}
