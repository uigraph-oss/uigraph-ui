'use client'

import { DashboardPageLayout } from '@/features/dashboard'
import { useCurrentOrganization } from '@/store/auth-store'
import {
  PropsWithChildren,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { ChatSidebar, type ChatSidebarSession } from './components/chat-sidebar'
import {
  createChatSession,
  deleteChatSession,
  listChatSessions,
  updateChatSession,
} from './helpers/chat-api'

export function AiChatLayout({ children }: PropsWithChildren) {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const organizationId = useCurrentOrganization()?.id
  const [sessions, setSessions] = useState<ChatSidebarSession[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreatingSession, setIsCreatingSession] = useState(false)
  const [mutatingSessionId, setMutatingSessionId] = useState('')
  const hasHandledFirstPathRefreshRef = useRef(false)
  const activeSessionId = pathname.startsWith('/dashboard/ai/')
    ? pathname.replace('/dashboard/ai/', '')
    : ''

  const fetchSessions = useCallback(
    async (showLoading: boolean) => {
      if (showLoading) setIsLoading(true)

      try {
        const data = await listChatSessions(organizationId)
        setSessions(data)
      } catch {
        toast.error('Failed to load AI sessions')
      } finally {
        if (showLoading) setIsLoading(false)
      }
    },
    [organizationId]
  )

  async function patchSession(
    sessionId: string,
    input: { title?: string; isPinned?: boolean }
  ) {
    setMutatingSessionId(sessionId)

    try {
      await updateChatSession(sessionId, input)
      await fetchSessions(false)
    } catch {
      toast.error('Could not update session')
    } finally {
      setMutatingSessionId('')
    }
  }

  async function handleDeleteSession(session: ChatSidebarSession) {
    setMutatingSessionId(session.sessionId)

    try {
      await deleteChatSession(session.sessionId)

      if (pathname === `/dashboard/ai/${session.sessionId}`) {
        void navigate('/dashboard/ai')
      }

      await fetchSessions(false)
    } finally {
      setMutatingSessionId('')
    }
  }

  async function handleCreateSession() {
    if (isCreatingSession) return

    setIsCreatingSession(true)

    try {
      const session = await createChatSession(organizationId)
      await fetchSessions(false)
      void navigate(`/dashboard/ai/${session.sessionId}`)
    } catch {
      toast.error('Could not create a new session')
    } finally {
      setIsCreatingSession(false)
    }
  }

  useEffect(() => {
    void fetchSessions(true)
  }, [fetchSessions])

  useEffect(() => {
    if (!hasHandledFirstPathRefreshRef.current) {
      hasHandledFirstPathRefreshRef.current = true
      return
    }

    void fetchSessions(false)
  }, [fetchSessions, pathname])

  useEffect(() => {
    function handleRefresh() {
      void fetchSessions(false)
    }
    window.addEventListener('ai-chat-sessions-refresh', handleRefresh)
    return () => {
      window.removeEventListener('ai-chat-sessions-refresh', handleRefresh)
    }
  }, [fetchSessions])

  return (
    <DashboardPageLayout crumbs={[{ to: '/dashboard/ai', label: 'Assist' }]}>
      <div className="grid h-full grid-cols-[250px_1fr] overflow-hidden">
        <ChatSidebar
          isLoading={isLoading}
          sessions={sessions}
          activeSessionId={activeSessionId}
          mutatingSessionId={mutatingSessionId}
          isCreatingSession={isCreatingSession}
          onOpenSession={(sessionId) => {
            void navigate(`/dashboard/ai/${sessionId}`)
          }}
          onPatchSession={patchSession}
          onDeleteSession={handleDeleteSession}
          onCreateSession={handleCreateSession}
        />

        <section className="flex min-h-0 flex-col bg-[#0B0E16]">
          {children}
        </section>
      </div>
    </DashboardPageLayout>
  )
}
