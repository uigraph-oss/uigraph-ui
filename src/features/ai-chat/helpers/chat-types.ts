import type { UIMessage } from 'ai'

export type SourceRef = {
  artifactType: string
  artifactId: string
  artifactName: string
  chunkType: string
}

export type ChatSession = {
  sessionId: string
  orgId: string
  userId: string
  title: string
  isPinned: boolean
  messageCount: number
  createdAt: string
  updatedAt: string
}

export type ChatMessage = {
  messageId: string
  sessionId: string
  role: 'user' | 'assistant'
  content: string
  createdAt: string
  sources?: SourceRef[]
}

export type ChatMessageStatus = 'sent' | 'pending' | 'streaming' | 'failed'

export type DisplayChatMessage = {
  messageId: string
  sessionId: string
  role: 'user' | 'assistant'
  content: string
  parts?: UIMessage['parts']
  createdAt: string
  status: ChatMessageStatus
  isLocal?: boolean
  sources?: SourceRef[]
}
