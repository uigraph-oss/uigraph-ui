'use client'

import { SectionLoader } from '@/components/section-loader'
import { SectionNotFound } from '@/components/section-not-found'
import { mintSessionToken } from '@/store/auth-store'
import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport, type UIMessage } from 'ai'
import { createContext } from 'daily-code/react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'
import {
  createUserMessage,
  fetchChatSession,
  resolveOrgId,
} from '../helpers/chat-api'
import type {
  ChatMessage,
  ChatMessageStatus,
  ChatSession,
  DisplayChatMessage,
} from '../helpers/chat-types'

type ChatSessionInput = {
  sessionId: string
}

function toUiMessage(m: ChatMessage): UIMessage {
  return {
    id: m.messageId,
    role: m.role,
    parts:
      m.parts && m.parts.length > 0
        ? m.parts
        : [{ type: 'text', text: m.content }],
    metadata: { createdAt: m.createdAt },
  }
}

function messageText(m: UIMessage): string {
  return m.parts
    .filter((p): p is { type: 'text'; text: string } => p.type === 'text')
    .map((p) => p.text)
    .join('')
}

export const [ChatSessionProvider, useChatSession] = createContext(
  ({ sessionId }: ChatSessionInput) => {
    const [isSessionLoading, setIsSessionLoading] = useState(true)
    const [chatSession, setChatSession] = useState<ChatSession | null>(null)
    const [draft, setDraft] = useState('')
    const [lastSubmittedAt, setLastSubmittedAt] = useState(0)

    const autoSentSessionIdRef = useRef('')
    const createdAtCacheRef = useRef<Map<string, string>>(new Map())
    const titleSyncedRef = useRef('')

    const transport = useMemo(
      () =>
        new DefaultChatTransport<UIMessage>({
          api: '/gateway/v1/ai/chat',
          credentials: 'include',
          prepareSendMessagesRequest: async () => ({
            headers: {
              Authorization: `Bearer ${await mintSessionToken()}`,
            },
            body: { orgId: resolveOrgId(), sessionId },
          }),
        }),
      [sessionId]
    )

    const { messages, sendMessage, setMessages, regenerate, status, error } =
      useChat<UIMessage>({
        id: sessionId,
        transport,
        experimental_throttle: 50,
        onFinish: () => {
          if (titleSyncedRef.current === sessionId) {
            return
          }
          titleSyncedRef.current = sessionId
          void (async () => {
            try {
              const { session } = await fetchChatSession(sessionId)
              setChatSession(session)
              window.dispatchEvent(new Event('ai-chat-sessions-refresh'))
            } catch {
              titleSyncedRef.current = ''
            }
          })()
        },
      })

    useEffect(() => {
      setDraft('')
      autoSentSessionIdRef.current = ''
      titleSyncedRef.current = ''
      createdAtCacheRef.current.clear()
    }, [sessionId])

    useEffect(() => {
      if (!sessionId) {
        setChatSession(null)
        setIsSessionLoading(false)
        return
      }

      let isMounted = true
      void (async () => {
        setIsSessionLoading(true)
        try {
          const { session, messages: loaded } =
            await fetchChatSession(sessionId)
          if (isMounted) {
            setChatSession(session)
            setMessages(loaded.map(toUiMessage))
          }
        } catch {
          if (isMounted) {
            setChatSession(null)
            toast.error('Failed to load AI inbox')
          }
        } finally {
          if (isMounted) {
            setIsSessionLoading(false)
          }
        }
      })()

      return () => {
        isMounted = false
      }
    }, [sessionId, setMessages])

    const isSending = status === 'submitted' || status === 'streaming'

    const displayMessages = useMemo<DisplayChatMessage[]>(() => {
      const cache = createdAtCacheRef.current
      const visible = messages.filter(
        (m) => m.role === 'user' || m.role === 'assistant'
      )
      return visible.map((m, index) => {
        const isLast = index === visible.length - 1

        const metaCreatedAt = (m.metadata as { createdAt?: string } | undefined)
          ?.createdAt
        let createdAt = metaCreatedAt ?? cache.get(m.id)
        if (!createdAt) {
          createdAt = new Date().toISOString()
          cache.set(m.id, createdAt)
        }

        let messageStatus: ChatMessageStatus = 'sent'
        if (m.role === 'assistant' && isLast && isSending) {
          messageStatus = 'streaming'
        }
        if (m.role === 'user' && isLast && status === 'error') {
          messageStatus = 'failed'
        }

        return {
          messageId: m.id,
          sessionId,
          role: m.role as 'user' | 'assistant',
          content: messageText(m),
          parts: m.parts,
          createdAt,
          status: messageStatus,
        }
      })
    }, [messages, isSending, status, sessionId])

    const messageCount = displayMessages.length
    const displayUpdatedAt =
      displayMessages[displayMessages.length - 1]?.createdAt ??
      chatSession?.updatedAt ??
      new Date().toISOString()

    const dispatchMessage = useCallback(
      async (message: string) => {
        const text = message.trim()
        if (!text || !sessionId || isSending) {
          return
        }

        setLastSubmittedAt(Date.now())
        setDraft('')

        try {
          await createUserMessage(sessionId, text)
        } catch {
          toast.error('Could not save your message')
          setDraft(text)
          return
        }

        try {
          await sendMessage({ text })
        } catch {
          toast.error('Could not send message to this session')
        }
      },
      [sessionId, isSending, sendMessage]
    )

    async function handleSendMessage() {
      await dispatchMessage(draft)
    }

    async function retryFailedMessage(_message?: string) {
      await regenerate()
    }

    useEffect(() => {
      if (error) {
        toast.error('The assistant ran into an error')
      }
    }, [error])

    useEffect(() => {
      if (
        !sessionId ||
        !chatSession ||
        isSessionLoading ||
        autoSentSessionIdRef.current === sessionId
      ) {
        return
      }

      const storageKey = `ai-chat-initial-message:${sessionId}`
      const rawPayload = window.sessionStorage.getItem(storageKey)
      autoSentSessionIdRef.current = sessionId

      if (!rawPayload) {
        return
      }
      window.sessionStorage.removeItem(storageKey)

      try {
        const payload = JSON.parse(rawPayload) as { message?: string }
        const msg = payload.message?.trim() ?? ''
        if (msg) {
          void dispatchMessage(msg)
        }
      } catch {
        return
      }
    }, [chatSession, dispatchMessage, isSessionLoading, sessionId])

    return {
      sessionId,
      isSessionLoading,
      chatSession: chatSession!,
      draft,
      setDraft,
      isSending,
      sendMessage: handleSendMessage,
      retryFailedMessage,
      displayMessages,
      messageCount,
      displayUpdatedAt,
      lastSubmittedAt,
    }
  },
  {
    useChildrenProvider(children, value) {
      if (value.isSessionLoading) {
        return <SectionLoader label="Loading chat session" className="h-full" />
      }

      if (!value.chatSession) {
        return (
          <SectionNotFound
            label="Session not found."
            plain
            className="h-full"
          />
        )
      }

      return children
    },
  }
)
