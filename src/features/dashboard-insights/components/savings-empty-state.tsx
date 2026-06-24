export function SavingsEmptyState() {
  return (
    <div className="border-stock flex flex-col items-center gap-2 rounded-[12px] border px-6 py-16 text-center">
      <p className="text-foreground text-lg font-semibold">
        No MCP usage recorded yet
      </p>
      <p className="text-paragraph max-w-md text-sm">
        Connect Claude or Cursor to the uigraph MCP server to start tracking
        cost and token savings here.
      </p>
    </div>
  )
}
