import { CopyButton } from '@/components/copy-button'
import { CustomStyle } from '@/components/custom-style'
import { Button } from '@/components/ui/button'
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card'
import { cn } from '@/lib/utils'
import { css } from '@/utils/raw'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { toast } from 'sonner'
import { useChatSession } from '../contexts/chat-session-context'
import { getMessageTimeLabel } from '../helpers/chat-format'
import { DisplayChatMessage } from '../helpers/chat-types'
import { resolveSources } from '../helpers/parse-source'
import { MARKDOWN_COMPONENTS } from './components'
import { SpinnerText } from './spinner-text'

export function ChatMessageItem({ message }: { message: DisplayChatMessage }) {
  const { retryFailedMessage, isSending } = useChatSession()

  const isUser = message.role === 'user'
  const isFailed = isUser && message.status === 'failed'

  if (isUser) {
    return (
      <div className="group ml-auto max-w-[min(80%,30rem)]">
        <div
          className={cn(
            'rounded-2xl px-4 py-2.5 text-sm leading-relaxed',
            isFailed
              ? 'border border-red-200 bg-red-50 text-red-900'
              : 'bg-[#111110] text-white'
          )}
        >
          <p className="whitespace-pre-wrap">{message.content}</p>

          {isFailed && (
            <div className="mt-2 flex items-center justify-between gap-3">
              <p className="text-xs font-medium text-red-700">Failed to send</p>
              <Button
                type="button"
                preset="ghost"
                size="sm"
                onClick={() => {
                  void retryFailedMessage(message.content)
                }}
                disabled={isSending}
                className="h-7 rounded-md border border-red-200 px-2 text-xs text-red-700 hover:bg-red-100"
              >
                Retry
              </Button>
            </div>
          )}
        </div>

        <div
          className={cn(
            'mt-1 flex items-center justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100'
          )}
        >
          <span className="text-paragraph text-[11px]">
            {getMessageTimeLabel(message.createdAt)}
          </span>
          <CopyButton
            text={message.content}
            onCopySuccess={() => toast.success('Message copied to clipboard')}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="group flex items-start gap-3">
      <div className="mt-0.5 flex size-7 shrink-0 overflow-hidden rounded-lg">
        <img
          src="/icons/icon-blue-256.png"
          alt="UIGraph AI"
          width={28}
          height={28}
          className="size-7 object-cover"
        />
      </div>

      <div className="min-w-0 flex-1">
        <div className="text-foreground text-[15px] leading-[1.75]">
          {message.content.trim().length > 0 ? (
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={MARKDOWN_COMPONENTS}
            >
              {message.content}
            </ReactMarkdown>
          ) : null}

          <CustomStyle jsx>{css`
            .step-list {
              counter-reset: step-counter;
              list-style: none;
              padding: 0;
              margin-top: 10px;
              margin-bottom: 10px;
              display: flex;
              flex-direction: column;
              gap: 10px;
            }

            .step-num {
              counter-increment: step-counter;
            }

            .step-num::after {
              content: counter(step-counter);
            }

            .step-body > p {
              margin: 0;
            }

            .step-body > p:not(:last-child) {
              margin-bottom: 6px;
            }
          `}</CustomStyle>
        </div>

        {message.status === 'streaming' && (
          <div className="mt-2">
            <SpinnerText />
          </div>
        )}

        <div className="mt-1 flex items-center gap-1">
          <div
            className={cn(
              'flex items-center gap-2 opacity-100 transition-opacity',
              message.status === 'streaming' && 'invisible! opacity-0!'
            )}
          >
            <span className="text-paragraph text-[11px]">
              {getMessageTimeLabel(message.createdAt)}
            </span>

            <CopyButton
              text={message.content}
              onCopySuccess={() => toast.success('Message copied to clipboard')}
            />

            {message.sources &&
              message.sources.length > 0 &&
              message.status !== 'streaming' && (
                <div className="bg-border mx-1 h-3 w-px" />
              )}
          </div>

          {(() => {
            const sourcesList =
              message.sources && message.status !== 'streaming'
                ? resolveSources(message.sources)
                : []

            if (sourcesList.length === 0) return null

            if (sourcesList.length === 1) {
              const source = sourcesList[0]

              return (
                <a
                  href={source.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-[13px] transition-colors"
                >
                  <span className="flex size-4 items-center justify-center">
                    {source.icon}
                  </span>
                  <span>{source.name}</span>
                </a>
              )
            }

            return (
              <HoverCard openDelay={100} closeDelay={200}>
                <HoverCardTrigger asChild>
                  <button
                    type="button"
                    className="text-muted-foreground hover:text-foreground inline-flex cursor-pointer items-center gap-1.5 text-[13px] transition-colors"
                  >
                    <span className="flex flex-row items-center">
                      {sourcesList.slice(0, 3).map((source, i, { length }) => (
                        <span
                          key={i}
                          className="border-border bg-muted relative -ml-1 flex size-5 items-center justify-center rounded-full border p-1"
                          style={{ zIndex: length - i }}
                        >
                          {source.icon}
                        </span>
                      ))}
                    </span>
                    <span>Sources</span>
                  </button>
                </HoverCardTrigger>

                <HoverCardContent
                  side="top"
                  align="start"
                  className="border-border bg-popover flex w-auto max-w-[260px] min-w-[140px] flex-col rounded-lg border p-1 shadow-lg"
                >
                  {sourcesList.map((source, i) => (
                    <a
                      key={i}
                      href={source.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-popover-foreground hover:bg-accent flex items-center gap-2 rounded-md px-2 py-1.5 text-[13px] transition-colors"
                    >
                      <span className="bg-muted flex size-5 shrink-0 items-center justify-center rounded-full text-[11px]">
                        {source.icon}
                      </span>

                      <span className="truncate">{source.name}</span>
                    </a>
                  ))}
                </HoverCardContent>
              </HoverCard>
            )
          })()}
        </div>
      </div>
    </div>
  )
}
