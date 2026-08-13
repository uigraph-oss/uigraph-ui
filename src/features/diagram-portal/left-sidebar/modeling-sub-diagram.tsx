import { cn } from '@/lib/utils'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { useState } from 'react'
import { DiagramPicker } from '../components/diagram-picker'
import { SUB_DIAGRAM_TOOL } from '../constants/c4-tools'
import { componentDragDataTransfer } from '../nodes/helpers/drag-data-transfer'
import { sidebarCategoryButtonClassName } from './sidebar-panel-styles'

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
            <div className="flex flex-col gap-2 px-2 pt-2 pb-2">
              <DiagramPicker
                onDragStart={(event, diagram) => {
                  const name = diagram.name ?? 'Untitled diagram'

                  componentDragDataTransfer(
                    event,
                    SUB_DIAGRAM_TOOL.nodeType,
                    {
                      ...SUB_DIAGRAM_TOOL.dragData,
                      diagramId: diagram.id,
                      diagramName: name,
                    },
                    {
                      width: SUB_DIAGRAM_TOOL.recommendedSize.width,
                      height: SUB_DIAGRAM_TOOL.recommendedSize.height,
                    },
                    name
                  )
                }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
