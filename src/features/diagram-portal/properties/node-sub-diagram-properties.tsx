import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DIAGRAMS } from '@/features/dashboard-diagrams/api/diagrams'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import { cn } from '@/lib/utils'
import { useQuery } from '@apollo/client'
import { arrayNonNullable } from 'daily-code'
import { useState } from 'react'
import { LuExternalLink, LuSearch } from 'react-icons/lu'
import { useFlowDiagramContext } from '../context/flow-diagram-context'
import { useSingleSelectedNode } from '../hooks/use-single-selected-node'
import { openSubDiagram, TSubDiagramNode } from '../nodes/sub-diagram-node'
import { Field } from './field'

export function NodeSubDiagramProperties() {
  const { data, updateData } = useSingleSelectedNode<TSubDiagramNode>()
  const { organizationId, diagramId } = useFlowDiagramContext()

  const [search, setSearch] = useState('')
  const debouncedSearch = useDebouncedValue(search, 300)

  const { data: queryData, loading } = useQuery(DIAGRAMS, {
    variables: {
      orgId: organizationId!,
      search: debouncedSearch || undefined,
      limit: 20,
      offset: 0,
    },
    skip: !organizationId,
    fetchPolicy: 'cache-and-network',
  })

  if (!data) return null

  // A diagram embedding itself would render an infinite drill-down.
  const diagrams = arrayNonNullable(queryData?.diagrams?.items ?? []).filter(
    (diagram) => diagram.id !== diagramId
  )

  return (
    <>
      <Field label="Linked Diagram">
        <div className="relative">
          <LuSearch className="text-paragraph absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2" />
          <Input
            value={search}
            placeholder="Search diagrams"
            className="border-stock bg-input h-9 rounded-md pl-8 text-sm"
            onChange={(e) => setSearch(e.currentTarget.value)}
          />
        </div>
      </Field>

      <div className="flex max-h-72 flex-col gap-1 overflow-y-auto">
        {loading && diagrams.length === 0 && (
          <p className="text-paragraph py-2 text-xs">Loading diagrams…</p>
        )}

        {!loading && diagrams.length === 0 && (
          <p className="text-paragraph py-2 text-xs">No diagrams found</p>
        )}

        {diagrams.map((diagram) => {
          const isSelected = diagram.id === data.diagramId

          return (
            <button
              key={diagram.id}
              type="button"
              onClick={() =>
                updateData({
                  diagramId: diagram.id,
                  diagramName: diagram.name ?? 'Untitled diagram',
                  thumbnailUrl: diagram.previewImageUrl ?? undefined,
                })
              }
              className={cn(
                'flex items-center gap-2 rounded-md border p-1.5 text-left transition-colors',
                isSelected
                  ? 'border-primary/50 bg-primary/10'
                  : 'border-stock hover:bg-input'
              )}
            >
              <div className="bg-input h-8 w-12 shrink-0 overflow-hidden rounded-sm">
                {diagram.previewImageUrl && (
                  <img
                    src={diagram.previewImageUrl}
                    alt={diagram.name ?? ''}
                    className="size-full object-cover"
                  />
                )}
              </div>

              <span className="truncate text-xs text-[#F4F7FC]">
                {diagram.name ?? 'Untitled diagram'}
              </span>
            </button>
          )
        })}
      </div>

      {data.diagramId && (
        <Button
          type="button"
          variant="outline"
          className="border-stock bg-input h-9 w-full rounded-md text-sm"
          onClick={() => openSubDiagram(data.diagramId!)}
        >
          <LuExternalLink className="size-3.5" />
          Open in new tab
        </Button>
      )}
    </>
  )
}
