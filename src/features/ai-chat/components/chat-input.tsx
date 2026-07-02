import { cn } from '@/lib/utils'
import { FormEvent, useRef } from 'react'
import { AiOutlineLoading3Quarters } from 'react-icons/ai'
import { FiArrowUp } from 'react-icons/fi'
import { useChatSession } from '../contexts/chat-session-context'

export function ChatInput() {
  const formRef = useRef<HTMLFormElement | null>(null)
  const { draft, setDraft, isSending, sendMessage } = useChatSession()

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    await sendMessage()
  }

  const canSend = !isSending && draft.trim().length > 0

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="px-4 py-3 pt-0">
      <div className="border-stock has-focus:border-primary/30 has-focus:ring-primary/10 bg-card mx-auto flex max-w-[52rem] items-end gap-2 rounded-xl border p-2 shadow-[0_-4px_6px_0_rgba(0,0,0,0.035)] ring-0 ring-transparent transition-all has-focus:ring-[3px]">
        <textarea
          // eslint-disable-next-line jsx-a11y/no-autofocus
          autoFocus
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
          placeholder="Ask about your architecture..."
          rows={1}
          disabled={isSending}
          className="placeholder:text-paragraph max-h-32 min-h-[3.75rem] flex-1 resize-none bg-transparent px-2 py-1.5 text-sm leading-relaxed outline-none disabled:cursor-not-allowed disabled:opacity-50"
          style={{ fieldSizing: 'content' } as React.CSSProperties}
        />

        <button
          type="submit"
          disabled={!canSend}
          className={cn(
            'flex size-10 shrink-0 items-center justify-center rounded-lg transition-colors',
            canSend
              ? 'bg-primary text-primary-foreground hover:bg-primary/90'
              : 'bg-stock/60 text-paragraph cursor-not-allowed'
          )}
        >
          {isSending ? (
            <AiOutlineLoading3Quarters className="size-4 animate-spin" />
          ) : (
            <FiArrowUp className="size-4" />
          )}
        </button>
      </div>
    </form>
  )
}
