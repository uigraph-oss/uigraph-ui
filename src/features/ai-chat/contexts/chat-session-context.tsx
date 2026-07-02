'use client'

import { SectionLoader } from '@/components/section-loader'
import { SectionNotFound } from '@/components/section-not-found'
import { createContext } from 'daily-code/react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'
import { buildAiWebSocket, fetchChatSession } from '../helpers/chat-api'
import type {
  ChatMessage,
  ChatSession,
  DisplayChatMessage,
} from '../helpers/chat-types'

type ChatSessionInput = {
  sessionId: string
}

type WsFrame = {
  type: 'delta' | 'done' | 'error'
  text?: string
  messageId?: string
  sessionId?: string
  message?: string
}

function tempId() {
  return `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function wait(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms))
}

export const [ChatSessionProvider, useChatSession] = createContext(
  ({ sessionId }: ChatSessionInput) => {
    const [isSessionLoading, setIsSessionLoading] = useState(true)
    const [chatSession, setChatSession] = useState<ChatSession | null>(null)
    const [persistedMessages, setPersistedMessages] = useState<ChatMessage[]>(
      []
    )
    const [draft, setDraft] = useState('')
    const [isSending, setIsSending] = useState(false)
    const [lastSubmittedAt, setLastSubmittedAt] = useState(0)
    const [pendingUserMessage, setPendingUserMessage] =
      useState<DisplayChatMessage | null>(null)
    const [streamingAssistantMessage, setStreamingAssistantMessage] =
      useState<DisplayChatMessage | null>(null)

    const isSendingRef = useRef(false)
    const chatSessionRef = useRef<ChatSession | null>(null)
    const persistedCountRef = useRef(0)
    const autoSentSessionIdRef = useRef('')

    chatSessionRef.current = chatSession
    persistedCountRef.current = persistedMessages.length

    useEffect(() => {
      setDraft('')
      setIsSending(false)
      isSendingRef.current = false
      setPendingUserMessage(null)
      setStreamingAssistantMessage(null)
    }, [sessionId])

    useEffect(() => {
      if (!sessionId) {
        setChatSession(null)
        setPersistedMessages([])
        setIsSessionLoading(false)
        return
      }

      let isMounted = true

      void (async () => {
        setIsSessionLoading(true)

        try {
          const { session, messages } = await fetchChatSession(sessionId)

          if (isMounted) {
            setChatSession(session)
            setPersistedMessages(messages)
          }
        } catch {
          if (isMounted) {
            setChatSession(null)
            setPersistedMessages([])
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
    }, [sessionId])

    const displayMessages = useMemo<DisplayChatMessage[]>(() => {
      const messages: DisplayChatMessage[] = persistedMessages.map((msg) => ({
        ...msg,
        status: 'sent',
      }))

      if (pendingUserMessage) {
        if (pendingUserMessage.status === 'failed') {
          messages.push(pendingUserMessage)
        } else if (
          !messages.some(
            (m) =>
              m.role === 'user' &&
              m.content.trim() === pendingUserMessage.content.trim()
          )
        ) {
          messages.push(pendingUserMessage)
        }
      }

      if (streamingAssistantMessage) {
        if (streamingAssistantMessage.status === 'streaming') {
          messages.push(streamingAssistantMessage)
        } else if (
          !messages.some(
            (m) =>
              m.role === 'assistant' &&
              m.content.trim() === streamingAssistantMessage.content.trim()
          )
        ) {
          messages.push(streamingAssistantMessage)
        }
      }

      return messages
    }, [persistedMessages, pendingUserMessage, streamingAssistantMessage])

    const messageCount = displayMessages.length
    const displayUpdatedAt =
      displayMessages[displayMessages.length - 1]?.createdAt ??
      chatSession?.updatedAt ??
      new Date().toISOString()

    const reloadSession = useCallback(async (): Promise<ChatMessage[]> => {
      if (!sessionId) return []

      const { session, messages } = await fetchChatSession(sessionId)
      setChatSession(session)
      setPersistedMessages(messages)
      return messages
    }, [sessionId])

    const dispatchMessage = useCallback(
      async (message: string) => {
        if (!sessionId || !message.trim() || isSendingRef.current) return

        const orgId = chatSessionRef.current?.orgId
        if (!orgId) return

        const baseCount = persistedCountRef.current

        const userMsg: DisplayChatMessage = {
          messageId: tempId(),
          sessionId,
          role: 'user',
          content: message,
          createdAt: new Date().toISOString(),
          status: 'pending',
          isLocal: true,
        }
        const assistantMsg: DisplayChatMessage = {
          messageId: tempId(),
          sessionId,
          role: 'assistant',
          content: '',
          createdAt: new Date().toISOString(),
          status: 'streaming',
          isLocal: true,
        }

        setLastSubmittedAt(Date.now())
        isSendingRef.current = true
        setIsSending(true)
        setDraft('')
        setPendingUserMessage(userMsg)
        setStreamingAssistantMessage(assistantMsg)

        let ws: WebSocket | null = null

        try {
          ws = await buildAiWebSocket(orgId)

          let fullText = ''
          let doneMessageId = ''

          await new Promise<void>((resolve, reject) => {
            let settled = false
            function settle(fn: () => void) {
              if (settled) return
              settled = true
              clearTimeout(timeoutHandle)
              fn()
            }

            const timeoutHandle = setTimeout(() => {
              settle(() => reject(new Error('Response timed out')))
            }, 30_000)

            ws!.addEventListener('message', (event: MessageEvent) => {
              try {
                const frame = JSON.parse(String(event.data)) as WsFrame

                if (frame.type === 'delta') {
                  fullText += frame.text ?? ''
                  setStreamingAssistantMessage((prev) =>
                    prev
                      ? { ...prev, content: fullText, status: 'streaming' }
                      : prev
                  )
                } else if (frame.type === 'done') {
                  doneMessageId = frame.messageId ?? ''
                  settle(resolve)
                } else if (frame.type === 'error') {
                  settle(() =>
                    reject(new Error(frame.message ?? 'AI returned an error'))
                  )
                }
              } catch {
                // ignore malformed frames
              }
            })

            ws!.addEventListener('error', () =>
              settle(() => reject(new Error('WebSocket connection error')))
            )

            ws!.addEventListener('close', () => {
              settle(() => {
                if (doneMessageId) {
                  resolve()
                } else {
                  reject(new Error('WebSocket closed unexpectedly'))
                }
              })
            })

            ws!.send(JSON.stringify({ sessionId, content: message }))
          })

          setStreamingAssistantMessage((prev) =>
            prev ? { ...prev, content: fullText, status: 'sent' } : prev
          )

          // Reconcile optimistic messages with persisted state
          for (const delay of [0, 200, 400, 800]) {
            if (delay > 0) await wait(delay)

            try {
              const newMessages = await reloadSession()
              if (newMessages.length >= baseCount + 2) {
                setPendingUserMessage(null)
                setStreamingAssistantMessage(null)
                break
              }
            } catch {
              // continue retrying
            }
          }
        } catch {
          setPendingUserMessage((prev) =>
            prev ? { ...prev, status: 'failed' } : prev
          )
          setStreamingAssistantMessage(null)
          setDraft(message)
          toast.error('Could not send message to this session')
        } finally {
          ws?.close()
          isSendingRef.current = false
          setIsSending(false)
        }
      },
      [sessionId, reloadSession]
    )

    async function sendMessage() {
      await dispatchMessage(draft.trim())
    }

    async function retryFailedMessage(message: string) {
      await dispatchMessage(message.trim())
    }

    useEffect(() => {
      if (
        !sessionId ||
        !chatSession ||
        autoSentSessionIdRef.current === sessionId
      ) {
        return
      }

      const storageKey = `ai-chat-initial-message:${sessionId}`
      const rawPayload = window.sessionStorage.getItem(storageKey)

      if (!rawPayload) return

      window.sessionStorage.removeItem(storageKey)

      try {
        const payload = JSON.parse(rawPayload) as { message?: string }
        const msg = payload.message?.trim() ?? ''

        if (!msg) {
          autoSentSessionIdRef.current = sessionId
          return
        }

        autoSentSessionIdRef.current = sessionId
        void dispatchMessage(msg)
      } catch {
        autoSentSessionIdRef.current = sessionId
      }
    }, [chatSession, dispatchMessage, sessionId])

    return {
      sessionId,
      isSessionLoading,
      chatSession: chatSession!,
      draft,
      setDraft,
      isSending,
      sendMessage,
      retryFailedMessage,
      reloadSession,
      displayMessages,
      messageCount,
      displayUpdatedAt,
      lastSubmittedAt,
      streamingAssistantMessage,
      pendingUserMessage,
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
