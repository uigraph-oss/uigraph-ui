import { mintSessionToken } from '@/store/auth-store'
import type { Edge, Node } from '@xyflow/react'

export type BeautifyResult = {
  nodes: Node[]
  edges: Edge[]
  layout: 'LR' | 'TB' | 'none'
  theme: string
  summary: string
}

const ERROR_MESSAGES: Record<string, string> = {
  AI_PROVIDER_NOT_CONFIGURED:
    'The AI provider has not been set up yet. Ask your administrator to configure it.',
  MCP_NOT_CONFIGURED:
    'The MCP server has not been set up yet. Ask your administrator to configure it.',
  DIAGRAM_TOO_LARGE:
    'This diagram is too large to beautify with AI. Try it on a smaller diagram.',
  AI_INVALID_RESPONSE:
    'The AI returned an unusable style plan. Try again, or rephrase your prompt.',
}

export async function beautifyDiagramWithAI({
  prompt,
  nodes,
  edges,
}: {
  prompt: string
  nodes: Node[]
  edges: Edge[]
}): Promise<BeautifyResult> {
  const response = await fetch('/gateway/v1/ai/diagrams/beautify', {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${await mintSessionToken()}`,
    },
    body: JSON.stringify({ prompt: prompt.trim() || undefined, nodes, edges }),
  })

  const data = (await response.json()) as Partial<BeautifyResult> & {
    message?: string
    code?: string
  }

  if (!response.ok) {
    const known = data.code ? ERROR_MESSAGES[data.code] : undefined
    throw new Error(
      known ?? data.message ?? `Failed to beautify diagram (${response.status})`
    )
  }

  if (!Array.isArray(data.nodes) || !Array.isArray(data.edges)) {
    throw new Error('The AI returned an unusable diagram')
  }

  return {
    nodes: data.nodes,
    edges: data.edges,
    layout: data.layout ?? 'none',
    theme: data.theme ?? 'AI style',
    summary: data.summary ?? '',
  }
}
