import { BetterDeleteConfirmationModal } from '@/components/better-delete-confirmation-modal'
import {
  BetterDialogContent,
  BetterDialogProvider,
} from '@/components/better-dialog'
import { SectionLoader } from '@/components/section-loader'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { useMemo, useState } from 'react'
import { AiOutlineLoading3Quarters } from 'react-icons/ai'
import { FiEdit2, FiMoreVertical, FiTrash2 } from 'react-icons/fi'
import { LuPlus } from 'react-icons/lu'
import { RiPushpinLine, RiUnpinLine } from 'react-icons/ri'
import { toast } from 'sonner'

export type ChatSidebarSession = {
  sessionId: string
  title: string
  isPinned: boolean
  createdAt: string
  updatedAt: string
  messageCount: number
}

type ChatSidebarProps = {
  isLoading: boolean
  sessions: ChatSidebarSession[]
  activeSessionId: string
  mutatingSessionId: string
  isCreatingSession: boolean
  onOpenSession: (sessionId: string) => void
  onCreateSession: () => void
  onPatchSession: (
    sessionId: string,
    input: { title?: string; isPinned?: boolean }
  ) => void
  onDeleteSession: (session: ChatSidebarSession) => Promise<unknown>
}

export function ChatSidebar({
  isLoading,
  sessions,
  activeSessionId,
  mutatingSessionId,
  isCreatingSession,
  onOpenSession,
  onCreateSession,
  onPatchSession,
  onDeleteSession,
}: ChatSidebarProps) {
  const [renamingSession, setRenamingSession] =
    useState<ChatSidebarSession | null>(null)
  const [renamingValue, setRenamingValue] = useState('')
  const [deletingSession, setDeletingSession] =
    useState<ChatSidebarSession | null>(null)

  const resolvedSessions = useMemo(() => {
    return sessions.toSorted((a, b) =>
      a.isPinned
        ? -1
        : b.isPinned
          ? 1
          : new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    )
  }, [sessions])

  return (
    <aside className="border-stock bg-shading flex h-full min-h-0 flex-col border-r">
      <div className="flex items-center justify-between p-4">
        <h2 className="text-lg font-semibold text-[#F4F7FC]">Chats</h2>

        <Button
          type="button"
          onClick={onCreateSession}
          disabled={isCreatingSession}
          className="bg-primary text-primary-foreground hover:bg-primary/90 size-8! shrink-0 rounded-lg p-0!"
        >
          {isCreatingSession ? (
            <AiOutlineLoading3Quarters className="size-4 animate-spin" />
          ) : (
            <LuPlus className="size-4" />
          )}
        </Button>
      </div>

      {isLoading ? (
        <SectionLoader label="Loading sessions" className="h-full" />
      ) : (
        <ScrollArea className="min-h-0 flex-1">
          <div className="space-y-0.5 p-2">
            {resolvedSessions.map((item) => {
              const isActive = activeSessionId === item.sessionId
              const isMutating = mutatingSessionId === item.sessionId

              return (
                <div
                  key={item.sessionId}
                  className={cn(
                    'group flex cursor-pointer items-center gap-1 rounded-lg px-3 py-1.5 transition-colors',
                    isActive ? 'bg-white/12' : 'hover:bg-white/[0.04]'
                  )}
                >
                  <button
                    type="button"
                    onClick={() => onOpenSession(item.sessionId)}
                    className="flex min-w-0 flex-1 items-center text-left"
                  >
                    <p
                      className={cn(
                        'w-full truncate text-[13px] font-medium',
                        isActive ? 'text-[#F4F7FC]' : 'text-[#D2D9E6]'
                      )}
                    >
                      {item.isPinned ? (
                        <RiPushpinLine className="mr-1 inline size-3 text-amber-600" />
                      ) : null}
                      {item.title}
                    </p>
                  </button>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        type="button"
                        preset="ghost"
                        disabled={isMutating}
                        className="size-6! shrink-0 rounded-md p-0! opacity-0 group-hover:opacity-100"
                      >
                        {isMutating ? (
                          <AiOutlineLoading3Quarters className="size-3.5 animate-spin" />
                        ) : (
                          <FiMoreVertical className="size-3.5" />
                        )}
                      </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem
                        onSelect={() => {
                          onPatchSession(item.sessionId, {
                            isPinned: !item.isPinned,
                          })
                        }}
                      >
                        {item.isPinned ? (
                          <RiUnpinLine className="size-3.5" />
                        ) : (
                          <RiPushpinLine className="size-3.5" />
                        )}
                        {item.isPinned ? 'Unpin' : 'Pin'}
                      </DropdownMenuItem>

                      <DropdownMenuItem
                        onSelect={() => {
                          setRenamingSession(item)
                          setRenamingValue(item.title)
                        }}
                      >
                        <FiEdit2 className="size-3.5" />
                        Rename
                      </DropdownMenuItem>

                      <DropdownMenuItem
                        variant="destructive"
                        onSelect={() => {
                          setDeletingSession(item)
                        }}
                      >
                        <FiTrash2 className="size-3.5" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )
            })}

            {sessions.length === 0 && (
              <div className="text-paragraph p-3 text-xs">
                No sessions yet. Start a new chat.
              </div>
            )}
          </div>
        </ScrollArea>
      )}

      <BetterDialogProvider
        open={renamingSession !== null}
        onOpenChange={(open) => {
          if (!open) {
            setRenamingSession(null)
            setRenamingValue('')
          }
        }}
        className="sm:max-w-[28rem]"
      >
        <BetterDialogContent
          title="Rename conversation"
          description="Choose a clear title for this chat."
          footerCancel
          footerSubmit="Save"
          footerSubmitLoading={
            renamingSession !== null &&
            mutatingSessionId === renamingSession.sessionId
          }
          onFooterSubmitClick={() => {
            if (!renamingSession) {
              return
            }

            const nextTitle = renamingValue.trim()

            if (!nextTitle) {
              toast.error('Conversation title cannot be empty')
              return
            }

            if (nextTitle === renamingSession.title) {
              setRenamingSession(null)
              setRenamingValue('')
              return
            }

            onPatchSession(renamingSession.sessionId, { title: nextTitle })
            setRenamingSession(null)
            setRenamingValue('')
          }}
        >
          <div className="space-y-2">
            <p className="text-sm font-medium text-[#F4F7FC]">Title</p>
            <Input
              value={renamingValue}
              onChange={(event) => setRenamingValue(event.target.value)}
              placeholder="Conversation title"
              className="h-11 rounded-[12px] bg-transparent"
            />
          </div>
        </BetterDialogContent>
      </BetterDialogProvider>

      <BetterDeleteConfirmationModal
        open={deletingSession !== null}
        onOpenChange={(open) => {
          if (!open) {
            setDeletingSession(null)
          }
        }}
        onConfirm={async () => {
          if (!deletingSession) {
            return
          }

          await onDeleteSession(deletingSession)
        }}
        title="Delete conversation?"
        description={
          deletingSession
            ? `This will permanently delete "${deletingSession.title}".`
            : 'This will permanently delete this conversation.'
        }
        deleteButtonText="Delete conversation"
        errorMessage="Could not delete conversation"
      />
    </aside>
  )
}
