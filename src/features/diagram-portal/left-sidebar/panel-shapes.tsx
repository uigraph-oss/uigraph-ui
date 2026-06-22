import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { ComponentInputType } from '@/features/component-meta'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { useState } from 'react'
import {
  SHAPE_CATEGORIES,
  SHAPE_CATEGORY_ORDER,
  getShapesByCategory,
  type ShapeCategory,
} from '../constants/shape-categories'
import { STANDARD_TOOLS } from '../constants/standard-tools'
import { SHAPE_COMPONENTS_LIST } from '../nodes'
import { componentDragDataTransfer } from '../nodes/helpers/drag-data-transfer'
import { SidebarLayout } from './sidebar-layout'

export function SidebarShapes() {
  const [expandedCategories, setExpandedCategories] = useState<
    Set<ShapeCategory>
  >(new Set(['standard', 'flowchart', 'shapes']))

  const shapesByCategory = getShapesByCategory(SHAPE_COMPONENTS_LIST)

  function toggleCategory(category: ShapeCategory) {
    const next = new Set(expandedCategories)
    if (next.has(category)) next.delete(category)
    else next.add(category)
    setExpandedCategories(next)
  }

  return (
    <SidebarLayout className="left-18">
      <div className="w-[10.5rem] p-2">
        <div className="text-muted-foreground mb-2 text-xs font-semibold">
          General
        </div>

        <div className="flex flex-col gap-2">
          {/* Standard Category */}
          <div className="flex flex-col gap-1">
            <button
              onClick={() => toggleCategory('standard')}
              className="group text-secondary-foreground hover:bg-accent flex h-7 w-full items-center justify-between rounded-md px-2 text-xs font-medium transition-colors"
            >
              <span className="truncate">Standard</span>
              {expandedCategories.has('standard') ? (
                <ChevronDown className="size-3" />
              ) : (
                <ChevronRight className="size-3" />
              )}
            </button>

            <AnimatePresence initial={false}>
              {expandedCategories.has('standard') && (
                <motion.div
                  key="category-standard"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                  className="overflow-hidden"
                >
                  <div className="grid grid-cols-2 gap-1.5">
                    {STANDARD_TOOLS.map((tool) => (
                      <TooltipProvider key={tool.id}>
                        <Tooltip>
                          <TooltipTrigger>
                            <div
                              draggable
                              className="bg-accent hover:bg-popover border-stock flex aspect-square w-full cursor-grab items-center justify-center rounded-[0.5rem] border p-2 transition-all select-none active:cursor-grabbing"
                              onDragStart={(event: React.DragEvent) => {
                                componentDragDataTransfer(
                                  event.dataTransfer,
                                  tool.nodeType,
                                  tool.dragData,
                                  tool.recommendedSize
                                )
                              }}
                            >
                              <div className="text-secondary-foreground flex items-center justify-center">
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

          {/* Flowchart and Shapes Categories */}
          {SHAPE_CATEGORY_ORDER.filter((key) => key !== 'standard').map(
            (categoryKey) => {
              const category = SHAPE_CATEGORIES[categoryKey]
              const shapes = shapesByCategory[categoryKey]
              const isExpanded = expandedCategories.has(categoryKey)

              if (shapes.length === 0) return null

              return (
                <div key={categoryKey} className="flex flex-col gap-1">
                  <button
                    onClick={() => toggleCategory(categoryKey)}
                    className="group text-secondary-foreground hover:bg-accent flex h-7 w-full items-center justify-between rounded-md px-2 text-xs font-medium transition-colors"
                  >
                    <span className="truncate">{category.label}</span>
                    {isExpanded ? (
                      <ChevronDown className="size-3" />
                    ) : (
                      <ChevronRight className="size-3" />
                    )}
                  </button>

                  <AnimatePresence initial={false}>
                    {isExpanded && (
                      <motion.div
                        key={`category-${categoryKey}`}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2, ease: 'easeOut' }}
                        className="overflow-hidden"
                      >
                        <div className="grid grid-cols-2 gap-1.5">
                          {shapes.map((s) => (
                            <TooltipProvider key={s.id}>
                              <Tooltip>
                                <TooltipTrigger>
                                  <div
                                    draggable
                                    className="bg-accent hover:bg-popover border-stock flex aspect-square w-full cursor-grab items-center justify-center rounded-[0.5rem] border p-2 transition-all select-none active:cursor-grabbing [&>svg]:h-full [&>svg]:w-full [&>svg]:object-contain"
                                    onDragStart={(event: React.DragEvent) => {
                                      componentDragDataTransfer(
                                        event.dataTransfer,
                                        'shape',
                                        {
                                          shape: s.id,
                                          componentFields: [
                                            {
                                              componentFieldId: 'name',
                                              type: ComponentInputType.TextInput,
                                              label: 'Name',
                                              isReadonly: true,
                                              data: [{ value: '' }],
                                            },
                                          ],
                                        },
                                        {
                                          width: s.recommendedWidth,
                                          height: s.recommendedHeight,
                                        }
                                      )
                                    }}
                                  >
                                    {<s.Component />}
                                  </div>
                                </TooltipTrigger>

                                <TooltipContent>{s.label}</TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )
            }
          )}
        </div>
      </div>
    </SidebarLayout>
  )
}
