import { SettingsIcon } from '@/assets/svgs'
import { CrossButton } from '@/components/cross-button'
import { cn } from '@/lib/utils'
import { AnimatePresence, motion } from 'framer-motion'
import {
  PointerEvent as ReactPointerEvent,
  useEffect,
  useRef,
  useState,
} from 'react'
import { CrossIcon } from '../components/icons'
import { useFlowDiagramContext } from '../context/flow-diagram-context'
import { useSingleSelectedEdge } from '../hooks/use-single-selected-edge'
import { useSingleSelectedNode } from '../hooks/use-single-selected-node'
import { ConfigurePropertiesModal } from './configure-properties'
import { DefaultNode } from './default-node'
import { EdgeConfigure } from './edge-configure'
import { NodeBuilderConfigure } from './node-builder-configure'
import { NodeCloudStyle } from './node-cloud-style'
import { NodeCodeStyle } from './node-code-style'
import { NodeDatabaseStyle } from './node-database-style'
import { NodeDatabaseTableProperties } from './node-database-table-properties'
import { NodeGroupStyle } from './node-group-style'
import { NodeShapeStyle } from './node-shape-style'
import { NodeTextStyle } from './node-text-style'
import { PropertiesLayout } from './properties-layout'
import { TableProperties } from './table-properties'
import { TableStyle } from './table-style'

const MIN_PANEL_WIDTH = 220
const MAX_PANEL_WIDTH = 640
const DEFAULT_PANEL_WIDTH = 238

const propertiesPanelHeaderClassName =
  'pointer-events-auto flex h-14 items-center justify-between rounded-t-[0.75rem] border border-[#2A3242] bg-[#141925] px-4 py-3'

function PropertiesTabButton({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'h-8 rounded-[0.375rem] px-3 text-sm font-normal transition-colors',
        active
          ? 'bg-[#141925] text-[#F4F7FC] shadow-sm'
          : 'text-[#828DA3] hover:text-[#F4F7FC]'
      )}
    >
      {children}
    </button>
  )
}

export function FloatingProperties() {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedTab, setSelectedTab] = useState<'data' | 'style'>('data')
  const [panelWidth, setPanelWidth] = useState(DEFAULT_PANEL_WIDTH)

  const isResizingRef = useRef(false)
  const panelRightRef = useRef(0)

  useEffect(() => {
    function handlePointerMove(event: PointerEvent) {
      if (!isResizingRef.current) return
      setPanelWidth(
        Math.min(
          MAX_PANEL_WIDTH,
          Math.max(MIN_PANEL_WIDTH, panelRightRef.current - event.clientX)
        )
      )
    }

    function stopResizing() {
      if (!isResizingRef.current) return
      isResizingRef.current = false
      document.body.style.userSelect = ''
      document.body.style.cursor = ''
    }

    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', stopResizing)

    return () => {
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', stopResizing)
      document.body.style.userSelect = ''
      document.body.style.cursor = ''
    }
  }, [])

  function handleResizeStart(event: ReactPointerEvent<HTMLButtonElement>) {
    event.preventDefault()
    isResizingRef.current = true
    panelRightRef.current =
      event.currentTarget.parentElement?.getBoundingClientRect().right ?? 0
    document.body.style.userSelect = 'none'
    document.body.style.cursor = 'ew-resize'
  }

  const { setSelectedNodeIds, setSelectedEdgeIds } = useFlowDiagramContext()
  const { node, updateData } = useSingleSelectedNode()
  const { edge } = useSingleSelectedEdge()

  return (
    <>
      <AnimatePresence>
        {node ? (
          <motion.div
            initial={{ opacity: 0, x: 16, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 16, scale: 0.95 }}
            transition={{ duration: 0.1, ease: 'easeOut' }}
            className="pointer-events-none absolute inset-4 left-auto grid max-h-full w-[14.875rem] grid-rows-[auto_1fr]"
            style={{ width: panelWidth }}
          >
            <header className={propertiesPanelHeaderClassName}>
              <div className="flex items-center rounded-md border border-[#2A3242] bg-[#1E2533] p-0.5">
                <PropertiesTabButton
                  active={selectedTab === 'data'}
                  onClick={() => setSelectedTab('data')}
                >
                  Data
                </PropertiesTabButton>
                <PropertiesTabButton
                  active={selectedTab === 'style'}
                  onClick={() => setSelectedTab('style')}
                >
                  Style
                </PropertiesTabButton>
              </div>

              <div className="flex items-center gap-1">
                <button
                  className="flex size-[1.375rem] items-center justify-center rounded-sm bg-transparent text-[#828DA3] transition-all hover:bg-[#1E2533] hover:text-[#F4F7FC]"
                  onClick={() => setIsEditModalOpen(true)}
                >
                  <SettingsIcon />
                </button>

                <CrossButton
                  onClick={() => setSelectedNodeIds([])}
                  className="size-[1.375rem] rounded-sm"
                />
              </div>
            </header>

            <PropertiesLayout className="w-full">
              <button
                type="button"
                aria-label="Resize properties panel"
                onPointerDown={handleResizeStart}
                className="before:bg-stock/30 hover:before:bg-paragraph/60 pointer-events-auto absolute top-0 -bottom-2 -left-1 z-20 w-2 cursor-ew-resize bg-transparent before:absolute before:inset-y-0 before:left-1/2 before:w-px before:-translate-x-1/2 before:transition-all"
              />

              {selectedTab === 'data' && (
                <>
                  {node.type === 'databaseTableSQL' ? (
                    <NodeDatabaseTableProperties />
                  ) : node.type === 'table' ? (
                    <TableProperties />
                  ) : (
                    <>
                      {(!node.type || node.type === 'default') && (
                        <DefaultNode />
                      )}
                      <NodeBuilderConfigure />
                    </>
                  )}
                </>
              )}

              {selectedTab === 'style' && (
                <>
                  {node.type === 'cloud' ? (
                    <NodeCloudStyle />
                  ) : node.type === 'group' ? (
                    <NodeGroupStyle />
                  ) : node.type === 'shape' ? (
                    <NodeShapeStyle />
                  ) : node.type === 'databaseTableSQL' ? (
                    <NodeDatabaseStyle />
                  ) : node.type === 'table' ? (
                    <TableStyle />
                  ) : node.type === 'text' ? (
                    <NodeTextStyle />
                  ) : node.type === 'code' ? (
                    <NodeCodeStyle />
                  ) : (
                    <p className="text-foreground/70 text-sm">
                      No style available
                    </p>
                  )}
                </>
              )}
            </PropertiesLayout>
          </motion.div>
        ) : edge ? (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.75 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.75 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="pointer-events-none absolute inset-4 left-auto grid max-h-full grid-rows-[auto_1fr]"
            style={{ width: panelWidth }}
          >
            <header className={propertiesPanelHeaderClassName}>
              <h3 className="text-sm font-bold text-[#F4F7FC]">
                Edge Properties
              </h3>

              <button
                onClick={() => setSelectedEdgeIds([])}
                className="hover:bg-destructive flex size-[1.375rem] items-center justify-center rounded-md bg-[#1E2533] text-sm text-[#828DA3] transition-all hover:text-white"
              >
                <CrossIcon />
              </button>
            </header>

            <PropertiesLayout className="w-full">
              <button
                type="button"
                aria-label="Resize properties panel"
                onPointerDown={handleResizeStart}
                className="before:bg-stock/30 hover:before:bg-paragraph/60 pointer-events-auto absolute top-0 -bottom-2 -left-1 z-20 w-2 cursor-ew-resize bg-transparent before:absolute before:inset-y-0 before:left-1/2 before:w-px before:-translate-x-1/2 before:transition-all"
              />

              <EdgeConfigure />
            </PropertiesLayout>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <ConfigurePropertiesModal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        // @ts-expect-error Ignore this
        initialComponentFields={node?.data.componentFields ?? []}
        onSubmit={async (componentFields) => {
          updateData({
            ...node?.data,
            componentFields,
          })

          setIsEditModalOpen(false)
        }}
      />
    </>
  )
}
