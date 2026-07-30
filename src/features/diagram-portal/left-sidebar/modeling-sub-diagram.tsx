import { Input } from '@/components/ui/input'
import { DIAGRAMS } from '@/features/dashboard-diagrams/api/diagrams'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import { cn } from '@/lib/utils'
import { useQuery } from '@apollo/client'
import { arrayNonNullable } from 'daily-code'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { useState } from 'react'
import { LuSearch } from 'react-icons/lu'
import { SUB_DIAGRAM_TOOL } from '../constants/c4-tools'
import { useFlowDiagramContext } from '../context/flow-diagram-context'
import { componentDragDataTransfer } from '../nodes/helpers/drag-data-transfer'
import { sidebarCategoryButtonClassName } from './sidebar-panel-styles'

export function ModelingSubDiagramSection() {
  const [isExpanded, setIsExpanded] = useState(true)
  const { organizationId, diagramId } = useFlowDiagramContext()

  const [search, setSearch] = useState('')
  const debouncedSearch = useDebouncedValue(search, 300)

  const { data, loading } = useQuery(DIAGRAMS, {
    variables: {
      orgId: organizationId!,
      search: debouncedSearch || undefined,
      limit: 20,
      offset: 0,
    },
    skip: !organizationId || !isExpanded,
    fetchPolicy: 'cache-and-network',
  })

  // A diagram embedding itself would render an infinite drill-down.
  const diagrams = arrayNonNullable(data?.diagrams?.items ?? []).filter(
    (diagram) => diagram.id !== diagramId
  )

  return (
    <>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(sidebarCategoryButtonClassName, 'mt-0.5')}
      >
        <span className="truncate">Sub Diagram</span>
        <ChevronDown
          className={cn(
            'size-3 transition-transform duration-200 ease-out',
            !isExpanded && '-rotate-90'
          )}
        />
      </button>

      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            key="category-sub-diagram"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="overflow-hidden"
          >
            <div className="flex flex-col gap-2 px-2 pt-2 pb-2">
              <div className="relative">
                <LuSearch className="text-paragraph absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2" />
                <Input
                  value={search}
                  placeholder="Search diagrams"
                  className="border-stock bg-input h-9 w-full rounded-md pl-8 text-sm"
                  onChange={(e) => setSearch(e.currentTarget.value)}
                />
              </div>

              <div className="flex max-h-72 min-w-0 flex-col gap-1 overflow-y-auto">
                {loading && diagrams.length === 0 && (
                  <p className="text-paragraph py-2 text-xs">
                    Loading diagrams…
                  </p>
                )}

                {!loading && diagrams.length === 0 && (
                  <p className="text-paragraph py-2 text-xs">
                    No diagrams found
                  </p>
                )}

                {diagrams.map((diagram) => {
                  const name = diagram.name ?? 'Untitled diagram'

                  return (
                    <div
                      key={diagram.id}
                      draggable
                      className="border-stock hover:bg-input flex w-full min-w-0 cursor-grab items-center gap-2 rounded-md border p-1.5 transition-colors active:cursor-grabbing"
                      onDragStart={(event: React.DragEvent) => {
                        componentDragDataTransfer(
                          event,
                          SUB_DIAGRAM_TOOL.nodeType,
                          {
                            ...SUB_DIAGRAM_TOOL.dragData,
                            diagramId: diagram.id,
                            diagramName: name,
                          },
                          { width: SUB_DIAGRAM_TOOL.recommendedSize.width },
                          name
                        )
                      }}
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
                    </div>
                  )
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
