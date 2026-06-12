import { privateClient } from '@/api/apollo-client'
import type { ChatSidebarSession } from '../components/chat-sidebar'
import {
  CREATE_CHAT_SESSION,
  type CreateChatSessionResponse,
  DELETE_CHAT_SESSION,
  GET_CHAT_SESSION,
  type GetChatSessionResponse,
  type GqlAiChatMessage,
  type GqlAiChatSession,
  LIST_CHAT_SESSIONS,
  type ListChatSessionsResponse,
  UPDATE_CHAT_SESSION,
  type UpdateChatSessionResponse,
} from './chat-gql'
import type { ChatMessage, ChatSession } from './chat-types'

function toSession(s: GqlAiChatSession): ChatSession {
  return {
    sessionId: s.sessionId,
    orgId: s.orgId,
    userId: s.userId,
    title: s.title,
    isPinned: s.isPinned,
    messageCount: s.messageCount,
    createdAt: s.createdAt,
    updatedAt: s.updatedAt,
  }
}

function toMessage(m: GqlAiChatMessage): ChatMessage {
  return {
    messageId: m.messageId,
    sessionId: m.sessionId,
    role: m.role as 'user' | 'assistant',
    content: m.content,
    createdAt: m.createdAt,
    sources: m.sources?.map((s) => ({
      artifactType: s.artifactType,
      artifactId: s.artifactId,
      artifactName: s.artifactName,
      chunkType: s.chunkType,
    })),
  }
}

export async function fetchChatSession(
  sessionId: string
): Promise<{ session: ChatSession; messages: ChatMessage[] }> {
  const result = await privateClient.query<GetChatSessionResponse>({
    query: GET_CHAT_SESSION,
    variables: { sessionId },
    fetchPolicy: 'no-cache',
  })

  const data = result.data.v1AiGetChatSession
  return {
    session: toSession(data.session),
    messages: data.messages.map(toMessage),
  }
}

export async function listChatSessions(
  orgId: string
): Promise<ChatSidebarSession[]> {
  const result = await privateClient.query<ListChatSessionsResponse>({
    query: LIST_CHAT_SESSIONS,
    variables: { orgId },
    fetchPolicy: 'no-cache',
  })

  return result.data.v1AiListChatSessions.sessions.map((s) => ({
    sessionId: s.sessionId,
    title: s.title,
    isPinned: s.isPinned,
    createdAt: s.createdAt,
    updatedAt: s.updatedAt,
    messageCount: s.messageCount,
  }))
}

export async function createChatSession(orgId: string): Promise<ChatSession> {
  const result = await privateClient.mutate<CreateChatSessionResponse>({
    mutation: CREATE_CHAT_SESSION,
    variables: { orgId },
  })

  return toSession(result.data!.v1AiCreateChatSession)
}

export async function deleteChatSession(sessionId: string): Promise<void> {
  await privateClient.mutate({
    mutation: DELETE_CHAT_SESSION,
    variables: { sessionId },
  })
}

export async function updateChatSession(
  sessionId: string,
  input: { title?: string; isPinned?: boolean }
): Promise<ChatSession> {
  const result = await privateClient.mutate<UpdateChatSessionResponse>({
    mutation: UPDATE_CHAT_SESSION,
    variables: { sessionId, input },
  })

  return toSession(result.data!.v1AiUpdateChatSession)
}

const AI_WS_URL = process.env.NEXT_PUBLIC_AI_WS_URL

export async function buildAiWebSocket(orgId: string): Promise<WebSocket> {
  if (!AI_WS_URL) {
    throw new Error('NEXT_PUBLIC_AI_WS_URL is not configured')
  }

  const token = 'mock-token'

  const ws = new WebSocket(
    `${AI_WS_URL}?token=${encodeURIComponent(token)}&orgId=${encodeURIComponent(orgId)}`
  )

  return new Promise<WebSocket>((resolve, reject) => {
    ws.addEventListener('open', () => resolve(ws))
    ws.addEventListener('error', () =>
      reject(new Error('WebSocket connection failed'))
    )
  })
}
