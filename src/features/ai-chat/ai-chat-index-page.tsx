'use client'

import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useOrganizationContext } from '@/contexts'
import { AnimatePresence, motion } from 'framer-motion'
import { FormEvent, useRef, useState } from 'react'
import { AiOutlineLoading3Quarters } from 'react-icons/ai'
import {
  LuBrain,
  LuDatabase,
  LuGitBranch,
  LuLayoutDashboard,
  LuSend,
  LuUsers,
} from 'react-icons/lu'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { createChatSession } from './helpers/chat-api'

const suggestions = [
  {
    icon: LuUsers,
    label: 'Ownership',
    prompt: 'Who owns the authentication module and its dependencies?',
  },
  {
    icon: LuGitBranch,
    label: 'API Routes',
    prompt: 'Show me all API endpoints and their request/response types',
  },
  {
    icon: LuDatabase,
    label: 'Database',
    prompt: 'Explain the database schema and table relationships',
  },
  {
    icon: LuLayoutDashboard,
    label: 'UI Flows',
    prompt: 'Map out the navigation flow between dashboard pages',
  },
]

export function AiChatIndexPage() {
  const navigate = useNavigate()
  const { organizationId } = useOrganizationContext()
  const formRef = useRef<HTMLFormElement | null>(null)
  const [draft, setDraft] = useState('')
  const [isSending, setIsSending] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()

    const message = draft.trim()
    if (!message || isSending) return

    setIsSending(true)

    try {
      const session = await createChatSession(organizationId)
      window.sessionStorage.setItem(
        `ai-chat-initial-message:${session.sessionId}`,
        JSON.stringify({ message })
      )
      navigate(`/dashboard/ai/${session.sessionId}`)
    } catch {
      toast.error('Could not start a new chat')
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-8 overflow-y-auto p-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="flex flex-col items-center gap-3 text-center"
        >
          <div className="bg-primary/8 mb-1 flex size-14 items-center justify-center rounded-2xl">
            <LuBrain strokeWidth={1.5} className="size-8 text-blue-900" />
          </div>
          <h2 className="text-xl font-semibold tracking-tight text-[#111110]">
            What can I help you explore?
          </h2>
          <p className="text-paragraph max-w-md text-sm leading-relaxed">
            Ask about ownership, APIs, database structure, or UI flow
            dependencies across your codebase.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.4,
            delay: 0.1,
            ease: [0.25, 0.46, 0.45, 0.94],
          }}
          className="grid w-full max-w-2xl grid-cols-2 gap-2.5"
        >
          {suggestions.map((s) => (
            <button
              key={s.label}
              type="button"
              disabled={isSending}
              onClick={() => {
                setDraft(s.prompt)
                formRef.current?.querySelector('textarea')?.focus()
              }}
              className="group border-stock hover:border-primary/25 flex items-start gap-3 rounded-xl border bg-white p-3.5 text-left transition-all hover:shadow-sm disabled:opacity-50"
            >
              <div className="bg-shading text-paragraph group-hover:text-primary group-hover:bg-primary/8 flex size-8 shrink-0 items-center justify-center rounded-lg transition-colors">
                <s.icon className="size-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[13px] font-medium text-[#111110]">
                  {s.label}
                </p>
                <p className="text-paragraph mt-0.5 line-clamp-1 text-xs">
                  {s.prompt}
                </p>
              </div>
            </button>
          ))}
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.4,
          delay: 0.2,
          ease: [0.25, 0.46, 0.45, 0.94],
        }}
        className="p-4"
      >
        <form
          ref={formRef}
          onSubmit={handleSubmit}
          className="relative mx-auto max-w-[46rem]"
        >
          <div className="relative">
            <Textarea
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={(event) => {
                if (
                  event.key === 'Enter' &&
                  !event.shiftKey &&
                  !event.ctrlKey &&
                  !event.metaKey &&
                  !event.altKey
                ) {
                  event.preventDefault()
                  formRef.current?.requestSubmit()
                }
              }}
              placeholder="Ask anything about your UiGraph..."
              className="border-stock focus-visible:border-primary/30 focus-visible:ring-primary/10 min-h-[80px] resize-none rounded-xl bg-white pr-14 text-sm shadow-none"
              disabled={isSending}
            />
            <div className="absolute right-2.5 bottom-2.5">
              <AnimatePresence mode="wait">
                {isSending ? (
                  <motion.div
                    key="loading"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="text-primary flex size-9 items-center justify-center"
                  >
                    <AiOutlineLoading3Quarters className="size-4.5 animate-spin" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="send"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <Button
                      type="submit"
                      disabled={draft.trim().length === 0}
                      className="bg-primary hover:bg-primary/90 disabled:bg-primary/30 size-9 rounded-lg p-0 shadow-none transition-colors"
                    >
                      <LuSend className="size-4 text-white" />
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="mt-2.5 flex items-center justify-end">
            <p className="text-paragraph/60 text-xs">
              Press{' '}
              <kbd className="border-stock bg-shading rounded border px-1.5 py-0.5 font-mono text-[10px]">
                Enter
              </kbd>{' '}
              to send
            </p>
          </div>
        </form>
      </motion.div>
    </div>
  )
}
