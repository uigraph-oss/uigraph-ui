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
  'UiGraph AI Chat': {
    label: 'UiGraph AI Chat',
    iconUrl: '/icons/icon-blue-256.png',
  },
  'UiGraph Slack': {
    label: 'UiGraph Slack',
    iconUrl: 'https://svgl.app/library/slack.svg',
  },
  unknown: { label: 'Unknown' },
}

export function agentDisplay(clientName: string): AgentDisplay {
  if (AGENTS[clientName]) return AGENTS[clientName]
  return { label: clientName }
}
