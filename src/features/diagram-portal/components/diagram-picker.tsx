import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DIAGRAMS } from '@/features/dashboard-diagrams/api/diagrams'
import { TEAMS } from '@/features/dashboard-diagrams/api/teams'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import { cn } from '@/lib/utils'
import { useQuery } from '@apollo/client'
import { arrayNonNullable } from 'daily-code'
import { useState } from 'react'
import { LuCheck, LuSearch } from 'react-icons/lu'
import { useFlowDiagramContext } from '../context/flow-diagram-context'

const PAGE_SIZE = 20
const ALL_TEAMS = 'all'

export type PickerDiagram = {
  id: string
  name?: string | null
  previewImageUrl?: string | null
}

export function DiagramPicker({
  selectedDiagramId,
  onSelect,
  onDragStart,
}: {
  selectedDiagramId?: string
  onSelect?: (diagram: PickerDiagram) => void
  onDragStart?: (event: React.DragEvent, diagram: PickerDiagram) => void
}) {
  const { organizationId, diagramId } = useFlowDiagramContext()

  const [search, setSearch] = useState('')
  const debouncedSearch = useDebouncedValue(search, 300)
  const [teamId, setTeamId] = useState(ALL_TEAMS)
  const [limit, setLimit] = useState(PAGE_SIZE)

  const teamsQuery = useQuery(TEAMS, {
    variables: { orgId: organizationId! },
    skip: !organizationId,
  })

  const { data, loading } = useQuery(DIAGRAMS, {
    variables: {
      orgId: organizationId!,
      search: debouncedSearch || undefined,
      teamId: teamId === ALL_TEAMS ? undefined : teamId,
      limit,
      offset: 0,
    },
    skip: !organizationId,
    fetchPolicy: 'cache-and-network',
  })

  const teams = arrayNonNullable(teamsQuery.data?.teams ?? [])
  const items = arrayNonNullable(data?.diagrams?.items ?? [])

  const diagrams = items.filter((diagram) => diagram.id !== diagramId)
  const hasMore = items.length < (data?.diagrams?.totalCount ?? 0)

  return (
    <>
      {teams.length > 0 && (
        <Select
          value={teamId}
          onValueChange={(value) => {
            setTeamId(value)
            setLimit(PAGE_SIZE)
          }}
        >
          <SelectTrigger className="border-stock bg-input h-9 w-full rounded-md text-sm">
            <SelectValue placeholder="All teams" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_TEAMS}>All teams</SelectItem>
            {teams.map((team) => (
              <SelectItem key={team.id} value={team.id}>
                {team.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      <div className="relative">
        <LuSearch className="text-paragraph absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2" />
        <Input
          value={search}
          placeholder="Search diagrams"
          className="border-stock bg-input h-9 w-full rounded-md pl-8 text-sm"
          onChange={(e) => {
            setSearch(e.currentTarget.value)
            setLimit(PAGE_SIZE)
          }}
        />
      </div>

      <div className="flex max-h-72 min-w-0 flex-col gap-1 overflow-y-auto">
        {loading && diagrams.length === 0 && (
          <p className="text-paragraph py-2 text-xs">Loading diagrams…</p>
        )}

        {!loading && diagrams.length === 0 && (
          <p className="text-paragraph py-2 text-xs">No diagrams found</p>
        )}

        {diagrams.map((diagram) => {
          const name = diagram.name ?? 'Untitled diagram'
          const isSelected = diagram.id === selectedDiagramId

          return (
            <div
              key={diagram.id}
              draggable={!!onDragStart}
              onDragStart={(event) => onDragStart?.(event, diagram)}
              onClick={() => onSelect?.(diagram)}
              role={onSelect ? 'button' : undefined}
              tabIndex={onSelect ? 0 : undefined}
              onKeyDown={(event) => {
                if (event.key !== 'Enter' && event.key !== ' ') return
                event.preventDefault()
                onSelect?.(diagram)
              }}
              className={cn(
                'flex w-full min-w-0 items-center gap-2 rounded-md border p-1.5 text-left transition-colors',
                onDragStart && 'cursor-grab active:cursor-grabbing',
                !isSelected && 'border-stock hover:bg-input',
                isSelected && 'border-primary bg-primary/10'
              )}
            >
              <div className="bg-input h-8 w-12 shrink-0 overflow-hidden rounded-sm">
                {diagram.previewImageUrl && (
                  <img
                    src={diagram.previewImageUrl}
                    alt={name}
                    className="size-full object-cover"
                  />
                )}
              </div>

              <span className="min-w-0 flex-1 truncate text-xs text-[#F4F7FC]">
                {name}
              </span>

              {isSelected && (
                <LuCheck className="text-primary size-3.5 shrink-0" />
              )}
            </div>
          )
        })}

        {hasMore && (
          <button
            type="button"
            disabled={loading}
            onClick={() => setLimit(limit + PAGE_SIZE)}
            className="border-stock hover:bg-input text-paragraph mt-0.5 rounded-md border py-1.5 text-xs transition-colors disabled:opacity-60"
          >
            {loading ? 'Loading…' : 'Load more'}
          </button>
        )}
      </div>
    </>
  )
}
