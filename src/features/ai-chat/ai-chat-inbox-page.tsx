'use client'

import { useParams } from 'react-router-dom'
import { ChatConfigErrorDialog } from './components/chat-config-error-dialog'
import { ChatInboxHeader } from './components/chat-inbox-header'
import { ChatInput } from './components/chat-input'
import { ChatMessagesList } from './components/chat-messages-list'
import { ChatSessionProvider } from './contexts/chat-session-context'

export function AiChatInboxPage() {
  const params = useParams()
  const sessionId = String(params.sessionId ?? '')

  return (
    <ChatSessionProvider sessionId={sessionId}>
      <div className="flex h-full min-h-0 flex-col">
        <ChatInboxHeader />
        <ChatMessagesList />
        <ChatInput />
      </div>
      <ChatConfigErrorDialog />
    </ChatSessionProvider>
  )
}
