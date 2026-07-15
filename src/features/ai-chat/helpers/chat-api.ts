import { apolloClientGQL } from '@/api/client'
import { useAuthStore } from '@/store/auth-store'
import {
  CHAT_SESSION,
  CHAT_SESSIONS,
  CREATE_CHAT_MESSAGE,
  CREATE_CHAT_SESSION,
  DELETE_CHAT_SESSION,
  UPDATE_CHAT_SESSION,
} from '../api/chat'
import type { ChatSidebarSession } from '../components/chat-sidebar'
import type { ChatMessage, ChatSession } from './chat-types'

type ApiSession = {
  id: string
  orgId: string
  ownerUserId: string
  title: string
  isPinned: boolean
  messageCount: number
  createdAt: string
  updatedAt: string
}

type ApiMessage = {
  id: string
  chatSessionId: string
  role: string
  content: string
  createdAt: string
}

export function resolveOrgId(orgId?: string): string {
  if (orgId) {
    return orgId
  }
  const state = useAuthStore.getState()
  const current = state.organizations.find(
    (o) => o.id === state.currentOrganizationId
  )
  const resolved = current?.id ?? state.organizations[0]?.id
  if (!resolved) {
    throw new Error('No active organization')
  }
  return resolved
}

function toSession(s: ApiSession): ChatSession {
  return {
    sessionId: s.id,
    orgId: s.orgId,
    userId: s.ownerUserId,
    title: s.title,
    isPinned: s.isPinned,
    messageCount: s.messageCount,
    createdAt: s.createdAt,
    updatedAt: s.updatedAt,
  }
}

function toMessage(m: ApiMessage): ChatMessage {
  return {
    messageId: m.id,
    sessionId: m.chatSessionId,
    role: m.role === 'assistant' ? 'assistant' : 'user',
    content: m.content,
    createdAt: m.createdAt,
  }
}

export async function fetchChatSession(
  sessionId: string
): Promise<{ session: ChatSession; messages: ChatMessage[] }> {
  const orgId = resolveOrgId()
  const { data } = await apolloClientGQL.query({
    query: CHAT_SESSION,
    variables: { orgId, id: sessionId },
    fetchPolicy: 'network-only',
  })
  return {
    session: toSession(data.chatSession.session),
    messages: data.chatSession.messages.map(toMessage),
  }
}

export async function listChatSessions(
  orgId: string
): Promise<ChatSidebarSession[]> {
  const { data } = await apolloClientGQL.query({
    query: CHAT_SESSIONS,
    variables: { orgId: resolveOrgId(orgId) },
    fetchPolicy: 'network-only',
  })
  return data.chatSessions.map((s) => ({
    sessionId: s.id,
    title: s.title,
    isPinned: s.isPinned,
    createdAt: s.createdAt,
    updatedAt: s.updatedAt,
    messageCount: s.messageCount,
  }))
}

export async function createChatSession(orgId: string): Promise<ChatSession> {
  const { data } = await apolloClientGQL.mutate({
    mutation: CREATE_CHAT_SESSION,
    variables: { orgId: resolveOrgId(orgId), input: {} },
  })
  if (!data?.createChatSession) {
    throw new Error('Failed to create session')
  }
  return toSession(data.createChatSession)
}

export async function deleteChatSession(sessionId: string): Promise<void> {
  await apolloClientGQL.mutate({
    mutation: DELETE_CHAT_SESSION,
    variables: { orgId: resolveOrgId(), id: sessionId },
  })
}

export async function updateChatSession(
  sessionId: string,
  input: { title?: string; isPinned?: boolean }
): Promise<ChatSession> {
  const { data } = await apolloClientGQL.mutate({
    mutation: UPDATE_CHAT_SESSION,
    variables: { orgId: resolveOrgId(), id: sessionId, input },
  })
  if (!data?.updateChatSession) {
    throw new Error('Failed to update session')
  }
  return toSession(data.updateChatSession)
}

export async function createUserMessage(
  sessionId: string,
  content: string
): Promise<ChatMessage> {
  const { data } = await apolloClientGQL.mutate({
    mutation: CREATE_CHAT_MESSAGE,
    variables: {
      orgId: resolveOrgId(),
      sessionId,
      input: { role: 'user', content },
    },
  })
  if (!data?.createChatMessage) {
    throw new Error('Failed to persist message')
  }
  return toMessage(data.createChatMessage)
}
