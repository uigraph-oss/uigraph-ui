import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { useState } from 'react'
import {
  C4_BOUNDARY_TOOLS,
  C4_ELEMENT_TOOLS,
  C4Tool,
  SUB_DIAGRAM_TOOL,
} from '../constants/c4-tools'
import { componentDragDataTransfer } from '../nodes/helpers/drag-data-transfer'
import {
  sidebarCategoryButtonClassName,
  sidebarNestedCategoryButtonClassName,
  sidebarTileClassName,
} from './sidebar-panel-styles'

type C4Group = 'elements' | 'boundaries' | 'sub-diagrams'

const GROUPS: { id: C4Group; label: string; tools: C4Tool[] }[] = [
  { id: 'elements', label: 'Elements', tools: C4_ELEMENT_TOOLS },
  { id: 'boundaries', label: 'Boundaries', tools: C4_BOUNDARY_TOOLS },
  { id: 'sub-diagrams', label: 'Sub Diagrams', tools: [SUB_DIAGRAM_TOOL] },
]

export function ModelingC4Section() {
  const [isExpanded, setIsExpanded] = useState(true)
  const [expandedGroups, setExpandedGroups] = useState<Set<C4Group>>(
    new Set(['elements', 'boundaries', 'sub-diagrams'])
  )

  function toggleGroup(group: C4Group) {
    const next = new Set(expandedGroups)
    if (next.has(group)) next.delete(group)
    else next.add(group)
    setExpandedGroups(next)
  }

  return (
    <>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={sidebarCategoryButtonClassName}
      >
        <span className="truncate">C4 Model</span>
        {isExpanded ? (
          <ChevronDown className="size-3" />
        ) : (
          <ChevronRight className="size-3" />
        )}
      </button>

      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            key="category-c4"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="overflow-hidden"
          >
            <div className="flex flex-col gap-1 px-1 pb-1">
              {GROUPS.map((group) => {
                const isGroupExpanded = expandedGroups.has(group.id)

                return (
                  <div key={group.id} className="flex flex-col gap-1">
                    <button
                      onClick={() => toggleGroup(group.id)}
                      className={sidebarNestedCategoryButtonClassName}
                    >
                      <span className="truncate text-[#828DA3]">
                        {group.label}
                      </span>
                      {isGroupExpanded ? (
                        <ChevronDown className="size-3" />
                      ) : (
                        <ChevronRight className="size-3" />
                      )}
                    </button>

                    <AnimatePresence initial={false}>
                      {isGroupExpanded && (
                        <motion.div
                          key={`c4-group-${group.id}`}
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2, ease: 'easeOut' }}
                          className="overflow-hidden"
                        >
                          <div className="grid grid-cols-4 gap-1.5 px-2 pb-1">
                            {group.tools.map((tool) => (
                              <TooltipProvider key={tool.id}>
                                <Tooltip>
                                  <TooltipTrigger>
                                    <div
                                      draggable
                                      className={sidebarTileClassName}
                                      onDragStart={(event: React.DragEvent) => {
                                        componentDragDataTransfer(
                                          event,
                                          tool.nodeType,
                                          tool.dragData,
                                          tool.recommendedSize,
                                          tool.label
                                        )
                                      }}
                                    >
                                      <div className="flex items-center justify-center">
                                        {tool.icon}
                                      </div>
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent>{tool.label}</TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
