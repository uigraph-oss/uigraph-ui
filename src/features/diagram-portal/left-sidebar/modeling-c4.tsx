import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { useState } from 'react'
import {
  C4_BOUNDARY_TOOLS,
  C4_ELEMENT_TOOLS,
  C4Tool,
} from '../constants/c4-tools'
import { componentDragDataTransfer } from '../nodes/helpers/drag-data-transfer'
import {
  sidebarCategoryButtonClassName,
  sidebarTileClassName,
} from './sidebar-panel-styles'

type C4Group = 'elements' | 'boundaries'

const GROUPS: { id: C4Group; label: string; tools: C4Tool[] }[] = [
  { id: 'elements', label: 'Elements', tools: C4_ELEMENT_TOOLS },
  { id: 'boundaries', label: 'Boundaries', tools: C4_BOUNDARY_TOOLS },
]

export function ModelingC4Section() {
  const [isExpanded, setIsExpanded] = useState(true)

  return (
    <>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(sidebarCategoryButtonClassName, 'mt-0.5')}
      >
        <span className="truncate">C4 Model</span>
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
            key="category-c4"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="overflow-hidden"
          >
            <div className="flex flex-col gap-2 px-2 pt-2 pb-2">
              {GROUPS.map((group) => (
                <div key={group.id} className="flex flex-col gap-1.5">
                  <span className="text-xs font-medium text-[#828DA3]">
                    {group.label}
                  </span>

                  <div className="grid grid-cols-4 gap-1.5">
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
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
