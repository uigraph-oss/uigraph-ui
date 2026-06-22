import { useComponents } from '@/features/dashboard-pages/hooks/use-components'
import { getFocalPointComponentIcon } from '@/helpers/get-component-icon'
import { arrayNonNullable } from 'daily-code'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown, ChevronRight, ChevronUp } from 'lucide-react'
import { Fragment, useState } from 'react'
import { getFlowDiagramComponentIcon } from '../constants/flow-diagram-node'
import { useFlowDiagramComponents } from '../hooks/use-flow-diagram-components'
import { componentDragDataTransfer } from '../nodes/helpers/drag-data-transfer'
import { SidebarLayout } from './sidebar-layout'

export function SidebarComponents() {
  const { focalPointGroups, loading } = useComponents()
  const { flowDiagramGroups, loading: loadingFlowDiagram } =
    useFlowDiagramComponents()
  const [showBuilder, setShowBuilder] = useState(true)
  const [showFocal, setShowFocal] = useState(true)
  const [expandedBuilderCategories, setExpandedBuilderCategories] = useState<
    Set<string>
  >(new Set())
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set()
  )

  function toggleBuilderCategory(category: string) {
    const next = new Set(expandedBuilderCategories)
    if (next.has(category)) next.delete(category)
    else next.add(category)
    setExpandedBuilderCategories(next)
  }

  function toggleCategory(category: string) {
    const next = new Set(expandedCategories)
    if (next.has(category)) next.delete(category)
    else next.add(category)
    setExpandedCategories(next)
  }

  return (
    <SidebarLayout className="left-18">
      <div className="flex w-72 flex-col gap-3 p-2">
        <div className="flex flex-col gap-1.5">
          <button
            onClick={() => setShowBuilder((v) => !v)}
            className="border-stock bg-popover hover:bg-accent flex w-full items-center justify-between rounded-md border px-3 py-2 text-left text-sm font-semibold"
          >
            <span>Flow Diagram Components</span>
            {showBuilder ? (
              <ChevronUp className="size-4" />
            ) : (
              <ChevronDown className="size-4" />
            )}
          </button>

          <AnimatePresence initial={false}>
            {showBuilder && (
              <motion.div
                key="builder"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className="flex flex-col gap-2"
              >
                {loadingFlowDiagram && (
                  <div className="text-muted-foreground px-2 py-1 text-xs">
                    Loading...
                  </div>
                )}

                {!loadingFlowDiagram &&
                  flowDiagramGroups.map((group) => {
                    return (
                      <div key={group.name} className="flex flex-col gap-1">
                        <button
                          onClick={() => toggleBuilderCategory(group.name)}
                          className="group text-secondary-foreground hover:bg-accent flex h-8 w-full items-center justify-between rounded-md px-3 text-xs font-medium transition-colors"
                        >
                          <span className="truncate">{group.name}</span>
                          {expandedBuilderCategories.has(group.name) ? (
                            <ChevronDown className="size-4" />
                          ) : (
                            <ChevronRight className="size-4" />
                          )}
                        </button>

                        <AnimatePresence initial={false}>
                          {expandedBuilderCategories.has(group.name) && (
                            <motion.div
                              key={`builder-cat-${group.name}`}
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2, ease: 'easeOut' }}
                              className="border-stock ml-2 flex flex-col gap-1.5 border-l pl-1"
                            >
                              {group.components.map((type) => (
                                <div
                                  key={type.componentId}
                                  draggable
                                  className="hover:bg-accent flex min-h-10 cursor-grab items-center justify-between gap-2 rounded-[0.5rem] bg-transparent px-3 py-2 transition-all select-none active:cursor-grabbing"
                                  onDragStart={(event: React.DragEvent) => {
                                    componentDragDataTransfer(
                                      event.dataTransfer,
                                      'builder',
                                      {
                                        componentId: type.componentId ?? '',
                                        componentName: type.name ?? undefined,
                                        componentFields: arrayNonNullable(
                                          type.flowDiagramComponentFields
                                        ).map((field) => ({
                                          ...field,

                                          componentFieldId:
                                            field.flowDiagramComponentFieldId,

                                          data:
                                            field.label === 'Name'
                                              ? [{ value: type.name }]
                                              : field.data,
                                        })),
                                      }
                                    )
                                  }}
                                >
                                  <div className="flex items-center gap-2">
                                    <span className="flex items-center justify-center text-base">
                                      {getFlowDiagramComponentIcon(type.name)}
                                    </span>

                                    <span className="text-sm font-medium">
                                      {type.name}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    )
                  })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex flex-col gap-1.5">
          <button
            onClick={() => setShowFocal((v) => !v)}
            className="border-stock bg-popover hover:bg-accent flex w-full items-center justify-between rounded-md border px-3 py-2 text-left text-sm font-semibold"
          >
            <span>Focal Point Components</span>
            {showFocal ? (
              <ChevronUp className="size-4" />
            ) : (
              <ChevronDown className="size-4" />
            )}
          </button>

          <AnimatePresence initial={false}>
            {showFocal && (
              <motion.div
                key="focal"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className="flex flex-col gap-2"
              >
                {loading && (
                  <div className="text-muted-foreground px-2 py-1 text-xs">
                    Loading...
                  </div>
                )}

                {!loading &&
                  focalPointGroups.map((group) => {
                    if (group.name === 'Architecture & Flows') {
                      return <Fragment key={group.name} />
                    }

                    return (
                      <div key={group.name} className="flex flex-col gap-1">
                        <button
                          onClick={() => toggleCategory(group.name)}
                          className="group text-secondary-foreground hover:bg-accent flex h-8 w-full items-center justify-between rounded-md px-3 text-xs font-medium transition-colors"
                        >
                          <span className="truncate">{group.name}</span>
                          {expandedCategories.has(group.name) ? (
                            <ChevronDown className="size-4" />
                          ) : (
                            <ChevronRight className="size-4" />
                          )}
                        </button>

                        <AnimatePresence initial={false}>
                          {expandedCategories.has(group.name) && (
                            <motion.div
                              key={`cat-${group.name}`}
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2, ease: 'easeOut' }}
                              className="border-stock ml-2 flex flex-col gap-1.5 border-l pl-1"
                            >
                              {group.components.map((type) => (
                                <div
                                  key={type.componentId}
                                  draggable
                                  className="hover:bg-accent flex min-h-10 cursor-grab items-center justify-between gap-2 rounded-[0.5rem] bg-transparent px-3 py-2 transition-all select-none active:cursor-grabbing"
                                  onDragStart={(event: React.DragEvent) => {
                                    componentDragDataTransfer(
                                      event.dataTransfer,
                                      'builder',
                                      {
                                        componentId: type.componentId ?? '',
                                        componentName: type.name ?? undefined,
                                        componentFields: arrayNonNullable(
                                          type.componentFields
                                        ).map((field) => ({
                                          ...field,
                                          data:
                                            field.label === 'Name'
                                              ? [{ value: type.name }]
                                              : undefined,
                                        })),
                                      }
                                    )
                                  }}
                                >
                                  <div className="flex items-center gap-2">
                                    <span className="flex items-center justify-center text-xl">
                                      {getFocalPointComponentIcon({
                                        component: type.componentId,
                                        category: type.category,
                                      })}
                                    </span>

                                    <span className="text-sm font-medium">
                                      {type.name}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    )
                  })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </SidebarLayout>
  )
}
