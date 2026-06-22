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
import {
  convertMermaidToReactFlow,
  convertMermaidToReactFlowWithContext,
  convertUiGraphToMermaid,
} from '@uigraph/sdk'
import { openFileExplorer } from 'daily-code/browser'
import { parse } from 'jsonc-parser'
import { ComponentProps, ReactNode, useState } from 'react'
import { LuImport } from 'react-icons/lu'
import { SiMermaid } from 'react-icons/si'
import { toast } from 'sonner'
import * as icons from './components/icons'
import { useFlowDiagramContext } from './context/flow-diagram-context'
import { applyAutoLayout } from './helpers/auto-layout'
import { downloadFlowDiagramImage } from './helpers/download-image'

export function FloatingCanvasToolbar() {
  const [isDownloading, setIsDownloading] = useState(false)

  const {
    nodes,
    edges,
    setNodes,
    setEdges,

    selectedGroup,
    reactFlowInstance,

    showGrid,
    setShowGrid,

    drawingMode,
    setDrawingMode,

    tempDiagramState,

    diagramName,
  } = useFlowDiagramContext()

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
    const [...files] = await openFileExplorer({
      multiple: true,
      accept: '.mmd,.txt,.json,.jsonc',
    })

    const mermaidFile =
      files.find((file) => file.name.toLowerCase().endsWith('.mmd')) ??
      files.find((file) => file.name.toLowerCase().endsWith('.txt'))

    if (!mermaidFile) {
      return toast.error('No Mermaid file found')
    }

    const contextFile =
      files.find((file) => file.name.toLowerCase().endsWith('.json')) ??
      files.find((file) => file.name.toLowerCase().endsWith('.jsonc'))

    try {
      const mermaidText = await mermaidFile.text()

      if (contextFile) {
        const parsedContext: unknown = parse(await contextFile.text())

        if (
          parsedContext === null ||
          typeof parsedContext !== 'object' ||
          Array.isArray(parsedContext)
        ) {
          return toast.error('Invalid Mermaid context file')
        }

        const diagram = await convertMermaidToReactFlowWithContext(
          mermaidText,
          parsedContext,
          { repositionNodes: true }
        )

        if (diagram === null) {
          return toast.error('Failed to convert Mermaid diagram to React Flow')
        }

        setNodes(diagram.nodes)
        setEdges(diagram.edges)
        return
      }

      const diagram = await convertMermaidToReactFlow(mermaidText)

      if (diagram === null) {
        return toast.error('Failed to convert Mermaid diagram to React Flow')
      }

      setNodes(diagram.nodes)
      setEdges(diagram.edges)
    } catch {
      toast.error('Failed to import Mermaid diagram')
    }
  }

  function handleExportMermaid() {
    try {
      const exported = convertUiGraphToMermaid({ nodes, edges })

      const baseName =
        diagramName
          .trim()
          .replace(/[\\/:*?"<>|]+/g, '-')
          .replace(/\s+/g, ' ') || 'uigraph-diagram'

      const mermaidBlob = new Blob([exported.mermaid], {
        type: 'text/plain;charset=utf-8',
      })
      const mermaidUrl = URL.createObjectURL(mermaidBlob)
      const mermaidLink = document.createElement('a')
      mermaidLink.href = mermaidUrl
      mermaidLink.download = `${baseName}.mmd`
      mermaidLink.click()

      const contextBlob = new Blob(
        [JSON.stringify(exported.context, null, 2)],
        {
          type: 'application/json;charset=utf-8',
        }
      )
      const contextUrl = URL.createObjectURL(contextBlob)
      const contextLink = document.createElement('a')
      contextLink.href = contextUrl
      contextLink.download = `${baseName}-context.json`
      contextLink.click()

      URL.revokeObjectURL(mermaidUrl)
      URL.revokeObjectURL(contextUrl)

      toast.success('Mermaid and context exported successfully')
    } catch {
      toast.error('Failed to export Mermaid and context files')
    }
  }

  return (
    <div className="pointer-events-none absolute inset-x-0 top-3 flex items-center justify-center">
      <div className="border-stock bg-card pointer-events-auto flex items-center gap-2 rounded-[0.75rem] border p-1 shadow-sm">
        {/* <ToolbarButton onClick={() => alert('Coming soon!')}>
          <icons.HandIcon />
        </ToolbarButton>

        <ToolbarButton onClick={() => alert('Coming soon!')}>
          <icons.CursorIcon />
        </ToolbarButton> */}

        {/* <ToolbarSeparator /> */}

        <ToolbarButton
          onClick={() => reactFlowInstance?.zoomIn()}
          delayDuration={100}
          tooltipPosition="top"
          tooltip="Zoom in"
        >
          <icons.ZoomInIcon />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => reactFlowInstance?.zoomOut()}
          delayDuration={100}
          tooltipPosition="top"
          tooltip="Zoom out"
        >
          <icons.ZoomOutIcon />
        </ToolbarButton>

        {/*        <ToolbarButton onClick={() => reactFlowInstance?.fitView()}>
          <icons.FullScreenIcon />
        </ToolbarButton> */}

        <ToolbarSeparator />

        <ToolbarButton
          delayDuration={100}
          tooltipPosition="top"
          tooltip={selectedGroup ? 'Ungroup nodes' : 'Group nodes'}
          disabled={tempDiagramState !== null}
          isActive={drawingMode || !!selectedGroup}
          onClick={() => {
            if (selectedGroup) {
              const childNodesSet = new Set(
                (selectedGroup.data?.childNodes as string[]) ?? []
              )

              setNodes((prev) => {
                return prev
                  .filter((node) => node.id !== selectedGroup.id)
                  .map((node) => {
                    if (childNodesSet.has(node.id)) {
                      return {
                        ...node,
                        selected: false,
                        parentId: undefined,
                        position: {
                          x: node.position.x + selectedGroup.position.x,
                          y: node.position.y + selectedGroup.position.y,
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
          tooltip="Auto layout left-to-right"
          disabled={tempDiagramState !== null}
          onClick={() => {
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
          tooltip="Auto layout top-to-bottom"
          disabled={tempDiagramState !== null}
          onClick={() => {
            const laid = applyAutoLayout(nodes, edges, 'TB')
            setNodes(laid)
            setTimeout(() => reactFlowInstance?.fitView({ padding: 0.2 }), 50)
          }}
        >
          <icons.LayoutTBIcon />
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

          <DropdownMenuContent align="center">
            <DropdownMenuItem
              onClick={() => void handleImportMermaid()}
              disabled={tempDiagramState !== null}
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
          tooltip="Export diagram"
          onClick={handleExport}
          disabled={isDownloading}
        >
          {isDownloading ? (
            <SuperCircleLoader className={'text-sm'} />
          ) : (
            <icons.DownloadIcon />
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
            'border-stock bg-card text-foreground flex size-10 items-center justify-center rounded-[0.5rem] border text-[1.0625rem] transition-all',

            !disabled && [
              isActive && 'border-primary/40 bg-primary/15 text-primary',
              !isActive && 'hover:bg-accent',
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
  return <div className={'bg-stock h-[1.625rem] w-[1px]'} />
}
