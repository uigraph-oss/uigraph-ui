import type { ChatSidebarSession } from '../components/chat-sidebar'
import type { ChatMessage, ChatSession } from './chat-types'

type StoreEntry = {
  session: ChatSession
  messages: ChatMessage[]
}

const demoStore = new Map<string, StoreEntry>()
let seeded = false

function isoNow() {
  return new Date().toISOString()
}

function isoMinutesAgo(minutes: number) {
  return new Date(Date.now() - minutes * 60_000).toISOString()
}

function randomId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function makeMessage(
  sessionId: string,
  role: 'user' | 'assistant',
  content: string,
  createdAt: string
): ChatMessage {
  return {
    messageId: randomId('msg'),
    sessionId,
    role,
    content,
    createdAt,
  }
}

function seedDemo(orgId: string) {
  if (seeded) return
  seeded = true

  const welcomeId = randomId('session')
  const welcomeCreated = isoMinutesAgo(120)
  const welcomeMessages: ChatMessage[] = [
    makeMessage(
      welcomeId,
      'user',
      'What can this AI assistant help me with?',
      isoMinutesAgo(119)
    ),
    makeMessage(
      welcomeId,
      'assistant',
      'I can help you explore your UI maps, services, APIs, and diagrams. Ask me about a component, an endpoint, or how parts of your system connect.',
      isoMinutesAgo(119)
    ),
  ]
  demoStore.set(welcomeId, {
    session: {
      sessionId: welcomeId,
      orgId,
      userId: 'demo-user',
      title: 'Getting started',
      isPinned: true,
      messageCount: welcomeMessages.length,
      createdAt: welcomeCreated,
      updatedAt: isoMinutesAgo(118),
    },
    messages: welcomeMessages,
  })

  const exploreId = randomId('session')
  const exploreCreated = isoMinutesAgo(45)
  const exploreMessages: ChatMessage[] = [
    makeMessage(
      exploreId,
      'user',
      'Summarize the checkout service.',
      isoMinutesAgo(44)
    ),
    makeMessage(
      exploreId,
      'assistant',
      'The checkout service exposes a few REST endpoints for carts and orders and connects to the payments service. This is demo data — connect the AI backend to see real answers.',
      isoMinutesAgo(44)
    ),
  ]
  demoStore.set(exploreId, {
    session: {
      sessionId: exploreId,
      orgId,
      userId: 'demo-user',
      title: 'Explore checkout service',
      isPinned: false,
      messageCount: exploreMessages.length,
      createdAt: exploreCreated,
      updatedAt: isoMinutesAgo(43),
    },
    messages: exploreMessages,
  })
}

function demoReplyFor(content: string) {
  return `Thanks for your message — you asked: "${content.trim()}". This is a demo response while the AI backend is being connected. Once it is live, I will answer using your organization's maps, services, and diagrams.`
}

export async function fetchChatSession(
  sessionId: string
): Promise<{ session: ChatSession; messages: ChatMessage[] }> {
  const entry = demoStore.get(sessionId)
  if (!entry) {
    throw new Error('Session not found')
  }
  return {
    session: { ...entry.session },
    messages: entry.messages.map((m) => ({ ...m })),
  }
}

export async function listChatSessions(
  orgId: string
): Promise<ChatSidebarSession[]> {
  seedDemo(orgId)
  return Array.from(demoStore.values())
    .filter((entry) => entry.session.orgId === orgId)
    .map((entry) => ({
      sessionId: entry.session.sessionId,
      title: entry.session.title,
      isPinned: entry.session.isPinned,
      createdAt: entry.session.createdAt,
      updatedAt: entry.session.updatedAt,
      messageCount: entry.session.messageCount,
    }))
}

export async function createChatSession(orgId: string): Promise<ChatSession> {
  seedDemo(orgId)
  const sessionId = randomId('session')
  const now = isoNow()
  const session: ChatSession = {
    sessionId,
    orgId,
    userId: 'demo-user',
    title: 'New chat',
    isPinned: false,
    messageCount: 0,
    createdAt: now,
    updatedAt: now,
  }
  demoStore.set(sessionId, { session, messages: [] })
  return { ...session }
}

export async function deleteChatSession(sessionId: string): Promise<void> {
  demoStore.delete(sessionId)
}

export async function updateChatSession(
  sessionId: string,
  input: { title?: string; isPinned?: boolean }
): Promise<ChatSession> {
  const entry = demoStore.get(sessionId)
  if (!entry) {
    throw new Error('Session not found')
  }
  if (input.title !== undefined) {
    entry.session.title = input.title
  }
  if (input.isPinned !== undefined) {
    entry.session.isPinned = input.isPinned
  }
  entry.session.updatedAt = isoNow()
  return { ...entry.session }
}

class DemoWebSocket extends EventTarget {
  send(data: string) {
    let parsed: { sessionId?: string; content?: string }
    try {
      parsed = JSON.parse(data) as { sessionId?: string; content?: string }
    } catch {
      return
    }

    const { sessionId, content } = parsed
    if (!sessionId || !content) return

    void this.respond(sessionId, content)
  }

  close() {
    this.dispatchEvent(new Event('close'))
  }

  private async respond(sessionId: string, content: string) {
    const entry = demoStore.get(sessionId)
    if (!entry) {
      this.dispatchEvent(
        new MessageEvent('message', {
          data: JSON.stringify({ type: 'error', message: 'Session not found' }),
        })
      )
      return
    }

    entry.messages.push(makeMessage(sessionId, 'user', content, isoNow()))

    const reply = demoReplyFor(content)
    const chunks = reply.match(/\S+\s*/g) ?? [reply]
    for (const chunk of chunks) {
      await new Promise<void>((resolve) => setTimeout(resolve, 35))
      this.dispatchEvent(
        new MessageEvent('message', {
          data: JSON.stringify({ type: 'delta', text: chunk }),
        })
      )
    }

    const assistantMessage = makeMessage(
      sessionId,
      'assistant',
      reply,
      isoNow()
    )
    entry.messages.push(assistantMessage)
    entry.session.messageCount = entry.messages.length
    entry.session.updatedAt = assistantMessage.createdAt

    this.dispatchEvent(
      new MessageEvent('message', {
        data: JSON.stringify({
          type: 'done',
          messageId: assistantMessage.messageId,
          sessionId,
        }),
      })
    )
  }
}

export async function buildAiWebSocket(_orgId: string): Promise<WebSocket> {
  const ws = new DemoWebSocket()
  await new Promise<void>((resolve) => setTimeout(resolve, 10))
  ws.dispatchEvent(new Event('open'))
  return ws as unknown as WebSocket
}
