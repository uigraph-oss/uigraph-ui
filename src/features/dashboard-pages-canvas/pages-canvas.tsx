import { GridScrollBody } from '@/components/grid-scroll-body'
import { FocalPointSidebarContextProvider } from '@/features/image-frame-canvas-sidebar/contexts/focal-point-sidebar-context'
import { GroupSidebar } from '@/features/image-frame-canvas-sidebar/group-sidebar/group-sidebar'
import { FocalPointSidebar } from '@/features/image-frame-canvas-sidebar/point-sidebar/focal-point-sidebar'
import { cn } from '@/lib/utils'
import {
  applyNodeChanges,
  Node,
  ReactFlow,
  ReactFlowInstance,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { arrayNonNullable } from 'daily-code'
import { useEffect, useMemo, useState } from 'react'
import { CanvasToolbar } from './canvas-toolbar'
import { CANVAS_IMAGE_DEFAULT_GAP, CANVAS_IMAGE_WIDTH } from './constants'
import {
  PagesCanvasContextInput,
  PagesCanvasContextProvider,
  usePagesCanvasContext,
} from './contexts/pages-canvas-context'
import { isNodesEqual } from './helpers/is-node-equal'
import { nodeTypes } from './react-flow-nodes'

export function PagesCanvas({ ...props }: PagesCanvasContextInput) {
  return (
    <PagesCanvasContextProvider {...props}>
      <PagesReactFlowCanvas />
    </PagesCanvasContextProvider>
  )
}

function PagesReactFlowCanvas() {
  const [rf, setRf] = useState<ReactFlowInstance | null>(null)

  const {
    zoom,
    setZoom,
    pageCanvasZoom,
    pages,
    pageCanvasItems,
    createPageCanvas,
    isCreatePageCanvasLoading,
    selectedFocalPoint,
    selectedFrameGroup,
    selectedFrameGroupPoints,
    updateFocalPoint,
    deleteFocalPoint,
    updateFrameGroup,
    deleteFrameGroup,
  } = usePagesCanvasContext()

  useEffect(() => {
    if (!rf || !pageCanvasZoom) return

    const currentZoom = rf.getZoom()
    if (currentZoom === pageCanvasZoom) return

    setZoom(pageCanvasZoom)
    void rf.fitView({
      maxZoom: pageCanvasZoom,
      minZoom: pageCanvasZoom,
      interpolate: 'linear',
      duration: 0,
    })
  }, [setZoom, pageCanvasZoom, rf])

  const memoizedBaseNodes = useMemo(() => {
    const savedItems = arrayNonNullable(pageCanvasItems)

    return pages.map<Node>((page, i) => {
      const savedItem = savedItems.find((p) => p.pageId === page.pageId)

      return {
        type: 'image',
        id: page.pageId!,
        position: {
          y: savedItems.length
            ? (savedItem?.position?.y ?? 0)
            : CANVAS_IMAGE_DEFAULT_GAP,

          x: savedItems.length
            ? (savedItem?.position?.x ?? 0)
            : CANVAS_IMAGE_WIDTH * i + (i + 1) * CANVAS_IMAGE_DEFAULT_GAP,
        },
        data: {},
      }
    })
  }, [pages, pageCanvasItems])

  const [nodes, setNodes] = useState(memoizedBaseNodes)

  const isLayoutSaved = useMemo(
    () => isNodesEqual(nodes, memoizedBaseNodes) && zoom === pageCanvasZoom,
    [nodes, memoizedBaseNodes, zoom, pageCanvasZoom]
  )

  const isSidebarOpen = Boolean(selectedFocalPoint || selectedFrameGroup)

  return (
    <div
      className={cn(
        'grid h-full transition-[grid-template-columns,gap]',
        isSidebarOpen
          ? 'grid-cols-[1fr_27.25rem] gap-2'
          : 'grid-cols-[1fr_0] gap-0'
      )}
    >
      <div className="bg-shading-gray relative isolate size-full flex-1 overflow-hidden rounded-3xl border border-[#E5E5E5]">
        <ReactFlow
          nodes={nodes}
          nodeTypes={nodeTypes}
          onNodesChange={(changes) => {
            setNodes((prevNodes) => applyNodeChanges(changes, prevNodes))
          }}
          className={cn(
            'absolute inset-0 size-full opacity-0',
            rf && 'opacity-100'
          )}
          minZoom={0.2}
          onInit={async (rf) => {
            await rf.fitView({ maxZoom: 1 })
            setZoom(rf.getZoom())
            setRf(rf)
          }}
          onWheelCapture={() => {
            if (!rf) return
            setZoom(rf.getZoom())
          }}
        />

        <CanvasToolbar
          zoom={zoom}
          onZoomIn={async () => {
            if (!rf) return
            await rf.zoomIn()
            setZoom(rf.getZoom())
          }}
          onZoomOut={async () => {
            if (!rf) return
            await rf.zoomOut()
            setZoom(rf.getZoom())
          }}
          isSaveLayoutDisabled={isLayoutSaved}
          isResetLayoutDisabled={isLayoutSaved}
          onResetLayout={() => setNodes(memoizedBaseNodes)}
          isSaveLayoutLoading={isCreatePageCanvasLoading}
          onSaveLayout={async () => {
            if (!rf) return

            await createPageCanvas(
              rf.getZoom(),
              nodes.map((n) => ({
                pageId: n.id,
                position: n.position,
              }))
            )
          }}
        />
      </div>

      {!selectedFrameGroup && selectedFocalPoint && (
        <div className="mt-[-66px]">
          <GridScrollBody className="border-stock h-full w-[27.25rem] rounded-[0.75rem] border bg-white">
            <FocalPointSidebarContextProvider focalPoint={selectedFocalPoint}>
              <FocalPointSidebar
                focalPoint={selectedFocalPoint}
                updateFocalPoint={async (focalPointId, input) => {
                  await updateFocalPoint(focalPointId, input)
                }}
                deleteFocalPoint={async (focalPointId) => {
                  await deleteFocalPoint(focalPointId)
                }}
              />
            </FocalPointSidebarContextProvider>
          </GridScrollBody>
        </div>
      )}

      {!selectedFocalPoint && selectedFrameGroup && (
        <div className="mt-[-66px]">
          <GridScrollBody className="border-stock h-full w-[27.25rem] rounded-[0.75rem] border bg-white">
            <GroupSidebar
              page={pages.find((p) => p.pageId === selectedFrameGroup.pageId)!}
              frameGroup={selectedFrameGroup}
              frameGroupPoints={selectedFrameGroupPoints}
              updateFrameGroup={async (input) => {
                await updateFrameGroup(selectedFrameGroup.pageGroupId!, input)
              }}
              deleteFrameGroup={async () => {
                await deleteFrameGroup(selectedFrameGroup.pageGroupId!)
              }}
            />
          </GridScrollBody>
        </div>
      )}
    </div>
  )
}
