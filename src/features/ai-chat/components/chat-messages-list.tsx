import { SectionNotFound } from '@/components/section-not-found'
import { useCallback, useEffect, useRef } from 'react'
import { useChatSession } from '../contexts/chat-session-context'
import { ChatMessageItem } from './chat-message-item'

export function ChatMessagesList() {
  const {
    sessionId,
    displayMessages,
    messageCount,
    isSending,
    lastSubmittedAt,
  } = useChatSession()

  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const shouldAutoScrollRef = useRef(true)
  const scrollFrameRef = useRef<number | null>(null)
  const pendingScrollBehaviorRef = useRef<ScrollBehavior>('auto')
  const initialScrollSessionIdRef = useRef('')

  const scrollToBottom = useCallback((behavior: ScrollBehavior) => {
    const viewport = scrollContainerRef.current
    if (!viewport) {
      return
    }

    viewport.scrollTo({
      top: viewport.scrollHeight,
      behavior,
    })
  }, [])

  const scheduleScrollToBottom = useCallback(
    (behavior: ScrollBehavior) => {
      if (behavior === 'smooth') {
        pendingScrollBehaviorRef.current = 'smooth'
      }

      if (scrollFrameRef.current !== null) {
        return
      }

      scrollFrameRef.current = requestAnimationFrame(() => {
        scrollFrameRef.current = null
        const nextBehavior = pendingScrollBehaviorRef.current
        pendingScrollBehaviorRef.current = 'auto'
        scrollToBottom(nextBehavior)
      })
    },
    [scrollToBottom]
  )

  useEffect(() => {
    shouldAutoScrollRef.current = true
    initialScrollSessionIdRef.current = ''

    const viewport = scrollContainerRef.current
    if (!viewport) {
      return
    }

    function handleScroll() {
      const viewportElement = scrollContainerRef.current
      if (!viewportElement) {
        return
      }

      const distanceFromBottom =
        viewportElement.scrollHeight -
        viewportElement.scrollTop -
        viewportElement.clientHeight
      shouldAutoScrollRef.current = distanceFromBottom <= 2
    }

    viewport.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      viewport.removeEventListener('scroll', handleScroll)
    }
  }, [sessionId])

  useEffect(() => {
    if (!sessionId || messageCount === 0) {
      return
    }

    if (initialScrollSessionIdRef.current === sessionId) {
      return
    }

    initialScrollSessionIdRef.current = sessionId
    shouldAutoScrollRef.current = true
    scheduleScrollToBottom('auto')

    const timeoutId = window.setTimeout(() => {
      scrollToBottom('auto')
    }, 0)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [messageCount, scheduleScrollToBottom, scrollToBottom, sessionId])

  useEffect(() => {
    if (!lastSubmittedAt) {
      return
    }

    shouldAutoScrollRef.current = true
    scheduleScrollToBottom('smooth')
  }, [lastSubmittedAt, scheduleScrollToBottom])

  useEffect(() => {
    if (!shouldAutoScrollRef.current) {
      return
    }

    scheduleScrollToBottom(isSending ? 'auto' : 'smooth')
  }, [
    displayMessages,
    isSending,
    messageCount,
    scheduleScrollToBottom,
    sessionId,
  ])

  useEffect(() => {
    return () => {
      if (scrollFrameRef.current !== null) {
        cancelAnimationFrame(scrollFrameRef.current)
      }
    }
  }, [])

  return (
    <div
      ref={scrollContainerRef}
      className="better-scrollbar min-h-0 flex-1 overflow-y-auto px-4 py-4"
    >
      {displayMessages.length === 0 ? (
        <SectionNotFound
          label="No messages yet. Ask your first question to begin."
          plain
          className="h-full"
        />
      ) : (
        <div className="mx-auto grid max-w-[52rem] grid-cols-[minmax(0,1fr)] gap-5 p-4">
          {displayMessages.map((message) => (
            <ChatMessageItem key={message.messageId} message={message} />
          ))}
        </div>
      )}
    </div>
  )
}
