export function TimelineEmptyState({ filtered }: { filtered: boolean }) {
  return (
    <div className="border-stock flex flex-col items-center gap-2 rounded-[12px] border px-6 py-16 text-center">
      <p className="text-foreground text-lg font-semibold">
        No timeline events{filtered ? ' match these filters' : ' yet'}
      </p>
      <p className="text-paragraph max-w-md text-sm">
        {filtered
          ? 'Try widening the date range or clearing the type filter.'
          : 'Releases, decisions (ADRs), and incident postmortems found in this repo will show up here, each linked to the parts of the graph they touch.'}
      </p>
    </div>
  )
}
