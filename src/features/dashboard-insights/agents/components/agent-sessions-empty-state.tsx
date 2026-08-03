export function AgentSessionsEmptyState() {
  return (
    <div className="border-stock flex flex-col items-center gap-2 rounded-[12px] border px-6 py-16 text-center">
      <p className="text-foreground text-lg font-semibold">
        No agent runs recorded yet
      </p>
      <p className="text-paragraph max-w-md text-sm">
        Give the agent a service account token and set{' '}
        <code className="bg-muted/40 rounded px-1 py-0.5 text-xs">
          UIGRAPH_API_URL
        </code>{' '}
        and{' '}
        <code className="bg-muted/40 rounded px-1 py-0.5 text-xs">
          UIGRAPH_TOKEN
        </code>{' '}
        where it runs. Every run then shows up here with its full step timeline.
      </p>
    </div>
  )
}
