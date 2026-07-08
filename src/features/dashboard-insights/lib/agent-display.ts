type AgentDisplay = { label: string; iconUrl?: string }

const AGENTS: Record<string, AgentDisplay> = {
  'claude-code': {
    label: 'Claude Code',
    iconUrl: 'https://svgl.app/library/claude-ai-icon.svg',
  },
  'codex-mcp-client': {
    label: 'Codex',
    iconUrl: 'https://svgl.app/library/codex_dark.svg',
  },
  opencode: {
    label: 'Opencode',
    iconUrl: 'https://svgl.app/library/opencode-dark.svg',
  },
  cursor: {
    label: 'Cursor',
    iconUrl: 'https://svgl.app/library/cursor_dark.svg',
  },
  unknown: { label: 'Unknown' },
}

export function agentDisplay(clientName: string): AgentDisplay {
  if (AGENTS[clientName]) return AGENTS[clientName]
  return { label: clientName }
}
