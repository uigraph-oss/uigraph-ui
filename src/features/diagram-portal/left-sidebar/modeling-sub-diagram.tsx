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
import { SUB_DIAGRAM_TOOL } from '../constants/c4-tools'
import { componentDragDataTransfer } from '../nodes/helpers/drag-data-transfer'
import {
  sidebarCategoryButtonClassName,
  sidebarTileClassName,
} from './sidebar-panel-styles'

export function ModelingSubDiagramSection() {
  const [isExpanded, setIsExpanded] = useState(true)

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
            <div className="grid grid-cols-4 gap-1.5 px-2 pt-2 pb-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <div
                      draggable
                      className={sidebarTileClassName}
                      onDragStart={(event: React.DragEvent) => {
                        componentDragDataTransfer(
                          event,
                          SUB_DIAGRAM_TOOL.nodeType,
                          SUB_DIAGRAM_TOOL.dragData,
                          { width: SUB_DIAGRAM_TOOL.recommendedSize.width },
                          SUB_DIAGRAM_TOOL.label
                        )
                      }}
                    >
                      <div className="flex items-center justify-center">
                        {SUB_DIAGRAM_TOOL.icon}
                      </div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>{SUB_DIAGRAM_TOOL.label}</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
