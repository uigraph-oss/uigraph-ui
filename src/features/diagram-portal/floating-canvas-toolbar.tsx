import { SuperCircleLoader } from '@/components/loader'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { isSequenceDiagram } from '@uigraph/sdk'
import { useNodesInitialized } from '@xyflow/react'
import { ComponentProps, ReactNode, useState } from 'react'
import { BsCamera } from 'react-icons/bs'
import { LuImport } from 'react-icons/lu'
import { SiMermaid } from 'react-icons/si'
import { toast } from 'sonner'
import * as icons from './components/icons'
import { useFlowDiagramContext } from './context/flow-diagram-context'
import { applyAutoLayout } from './helpers/auto-layout'
import { beautifyDiagram } from './helpers/beautify-diagram'
import { ZOOM_STEP, zoomBy } from './helpers/camera'
import { downloadFlowDiagramImage } from './helpers/download-image'
import {
  exportDiagramToMermaid,
  importMermaidFromFilePicker,
} from './helpers/import-export'

export const diagramToolbarContainerClassName =
  'pointer-events-auto flex items-center gap-2 rounded-[0.75rem] border border-[#2A3242] bg-[#141925] p-1 shadow-sm'

export function FloatingCanvasToolbar() {
  const [isDownloading, setIsDownloading] = useState(false)
  const nodesInitialized = useNodesInitialized()

  const {
    nodes,
    edges,
    setNodes,
    setEdges,

    selectedFrame,
    reactFlowInstance,

    cursorMode,
    setCursorMode,

    showGrid,
    setShowGrid,

    drawingMode,
    setDrawingMode,

    isPreviewing,

    diagramName,
  } = useFlowDiagramContext()

  const isSequence = isSequenceDiagram(nodes)

  async function handleExport() {
    setIsDownloading(true)

    try {
      await downloadFlowDiagramImage(nodes, diagramName)

      toast.success('Diagram exported successfully')
    } catch {
      toast.error('Failed to export diagram image')
    } finally {
      setIsDownloading(false)
    }
  }

  async function handleImportMermaid() {
    try {
      const diagram = await importMermaidFromFilePicker()

      setNodes(diagram.nodes)
      setEdges(diagram.edges)
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Failed to import Mermaid diagram'
      )
    }
  }

  function handleExportMermaid() {
    try {
      exportDiagramToMermaid(nodes, edges, diagramName)

      toast.success('Diagram exported successfully')
    } catch {
      toast.error('Failed to export the diagram')
    }
  }

  return (
    <div className="pointer-events-none absolute inset-x-0 top-3 flex items-center justify-center">
      <div className={diagramToolbarContainerClassName}>
        <ToolbarButton
          delayDuration={100}
          tooltipPosition="top"
          tooltip={
            cursorMode === 'pan'
              ? 'Hand tool (switch to select)'
              : 'Select tool (switch to pan)'
          }
          isActive={cursorMode === 'pan'}
          onClick={() => setCursorMode(cursorMode === 'pan' ? 'select' : 'pan')}
        >
          {cursorMode === 'pan' && <icons.HandIcon />}
          {cursorMode === 'select' && <icons.CursorIcon />}
        </ToolbarButton>

        <ToolbarSeparator />

        <ToolbarButton
          onClick={() =>
            reactFlowInstance && zoomBy(reactFlowInstance, 1 / ZOOM_STEP)
          }
          delayDuration={100}
          tooltipPosition="top"
          tooltip="Zoom out"
        >
          <icons.ZoomOutIcon />
        </ToolbarButton>

        <ToolbarButton
          onClick={() =>
            reactFlowInstance && zoomBy(reactFlowInstance, ZOOM_STEP)
          }
          delayDuration={100}
          tooltipPosition="top"
          tooltip="Zoom in"
        >
          <icons.ZoomInIcon />
        </ToolbarButton>

        <ToolbarSeparator />

        <ToolbarButton
          delayDuration={100}
          tooltipPosition="top"
          tooltip={selectedFrame ? 'Ungroup nodes' : 'Group nodes'}
          disabled={isPreviewing}
          isActive={drawingMode || !!selectedFrame}
          onClick={() => {
            if (selectedFrame) {
              const childNodesSet = new Set(
                (selectedFrame.data?.childNodes as string[]) ?? []
              )

              /** A nested frame hands its children up to its own parent. */
              const parentId = selectedFrame.parentId

              setNodes((prev) => {
                return prev
                  .filter((node) => node.id !== selectedFrame.id)
                  .map((node) => {
                    if (childNodesSet.has(node.id)) {
                      return {
                        ...node,
                        selected: false,
                        parentId,
                        position: {
                          x: node.position.x + selectedFrame.position.x,
                          y: node.position.y + selectedFrame.position.y,
                        },
                      }
                    }

                    if (parentId && node.id === parentId) {
                      const siblings = (node.data?.childNodes as string[]) ?? []

                      return {
                        ...node,
                        data: {
                          ...node.data,
                          childNodes: [
                            ...siblings.filter(
                              (childNodeId) =>
                                childNodeId !== selectedFrame.id &&
                                !childNodesSet.has(childNodeId)
                            ),
                            ...childNodesSet,
                          ],
                        },
                      }
                    }

                    return node
                  })
              })
            } else {
              setDrawingMode((prev) => !prev)
            }
          }}
        >
          <icons.View3DIcon />
        </ToolbarButton>

        {/* <ToolbarSeparator /> */}

        <ToolbarButton
          delayDuration={100}
          tooltipPosition="top"
          tooltip={showGrid ? 'Hide grid' : 'Show grid'}
          isActive={showGrid}
          onClick={() => setShowGrid((prev) => !prev)}
        >
          <icons.GridTableIcon />
        </ToolbarButton>

        {/*    <ToolbarButton
          isActive={showMinimap}
          onClick={() => setShowMinimap((prev) => !prev)}
        >
          <icons.EyeIcon />
        </ToolbarButton> */}

        <ToolbarSeparator />

        <ToolbarButton
          delayDuration={100}
          tooltipPosition="top"
          tooltip={
            isSequence
              ? 'Auto layout is unavailable for sequence diagrams'
              : 'Auto layout left-to-right'
          }
          disabled={isPreviewing || isSequence}
          onClick={() => {
            if (isSequence) {
              return
            }

            const laid = applyAutoLayout(nodes, edges, 'LR')
            setNodes(laid)
            setTimeout(() => reactFlowInstance?.fitView({ padding: 0.2 }), 50)
          }}
        >
          <icons.LayoutLRIcon />
        </ToolbarButton>

        <ToolbarButton
          delayDuration={100}
          tooltipPosition="top"
          tooltip={
            isSequence
              ? 'Auto layout is unavailable for sequence diagrams'
              : 'Auto layout top-to-bottom'
          }
          disabled={isPreviewing || isSequence}
          onClick={() => {
            if (isSequence) {
              return
            }

            const laid = applyAutoLayout(nodes, edges, 'TB')
            setNodes(laid)
            setTimeout(() => reactFlowInstance?.fitView({ padding: 0.2 }), 50)
          }}
        >
          <icons.LayoutTBIcon />
        </ToolbarButton>

        <ToolbarButton
          delayDuration={100}
          tooltipPosition="top"
          tooltip="Beautify Layout"
          disabled={isPreviewing || !nodesInitialized || nodes.length === 0}
          onClick={() => {
            if (!nodesInitialized) {
              toast.info('Diagram is still rendering — try again in a moment')
              return
            }

            const { nodes: beautified, edges: beautifiedEdges } =
              beautifyDiagram(nodes, edges, 'LR')
            setNodes(beautified)
            setEdges(beautifiedEdges)
            setTimeout(() => reactFlowInstance?.fitView({ padding: 0.2 }), 50)
          }}
        >
          <icons.BeautifyIcon />
        </ToolbarButton>

        <ToolbarSeparator />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <ToolbarButton
              delayDuration={100}
              tooltipPosition="top"
              tooltip="Mermaid Diagram"
            >
              <SiMermaid className="text-base" />
            </ToolbarButton>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="center"
            className="border border-[#2A3242] bg-[#141925] text-[#F4F7FC]"
          >
            <DropdownMenuItem
              onClick={() => void handleImportMermaid()}
              disabled={isPreviewing}
            >
              <LuImport className="size-4" />
              Import Mermaid
            </DropdownMenuItem>

            <DropdownMenuItem onClick={handleExportMermaid}>
              <LuImport className="size-4 rotate-180" />
              Export To Mermaid
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <ToolbarButton
          delayDuration={100}
          tooltipPosition="top"
          tooltip="Export Image"
          onClick={handleExport}
          disabled={isDownloading}
        >
          {isDownloading ? (
            <SuperCircleLoader className={'text-sm'} />
          ) : (
            <BsCamera className="mb-0.5 text-[1.2rem]" />
          )}
        </ToolbarButton>

        {/* <ToolbarButton onClick={handleImport}>
          <icons.UploadIcon />
        </ToolbarButton> */}
      </div>
    </div>
  )
}

export function ToolbarButton({
  tooltipPosition,
  className,
  isActive,
  disabled,
  tooltip,
  delayDuration,
  ...props
}: ComponentProps<'button'> & {
  isActive?: boolean
  tooltip?: ReactNode
  delayDuration?: number
  tooltipPosition?: 'top' | 'bottom'
}) {
  return (
    <Tooltip
      delayDuration={delayDuration ?? 500}
      disableHoverableContent
      open={tooltip ? undefined : false}
    >
      <TooltipTrigger asChild>
        <button
          className={cn(
            'flex size-10 items-center justify-center rounded-[0.5rem] border border-[#2A3242] bg-transparent text-[1.0625rem] text-[#F4F7FC] transition-all',

            !disabled && [
              isActive && 'border-primary/30 bg-primary/10 text-primary',
              !isActive && 'hover:bg-[#1E2533]',
            ],

            disabled && 'cursor-not-allowed opacity-50',

            className
          )}
          {...props}
        />
      </TooltipTrigger>

      <TooltipContent side={tooltipPosition}>{tooltip}</TooltipContent>
    </Tooltip>
  )
}

export function ToolbarSeparator() {
  return <div className="h-[1.625rem] w-[1px] bg-[#2A3242]" />
}
