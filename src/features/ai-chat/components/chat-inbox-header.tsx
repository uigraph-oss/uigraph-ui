import { useChatSession } from '../contexts/chat-session-context'
import { getUpdatedLabel } from '../helpers/chat-format'

export function ChatInboxHeader() {
  const { chatSession, messageCount, displayUpdatedAt } = useChatSession()

  return (
    <div className="border-stock bg-shading flex items-center justify-between border-b px-4 py-3">
      <p className="text-sm font-semibold text-[#111110]">
        {chatSession.title}
      </p>

      <p className="text-paragraph text-xs">
        {messageCount} messages • {getUpdatedLabel(displayUpdatedAt)}
      </p>
    </div>
  )
}
