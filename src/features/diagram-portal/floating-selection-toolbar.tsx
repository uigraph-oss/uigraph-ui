import { useAutoRef } from '@/hooks/use-auto-ref'
import { Edge, Node, ReactFlowInstance } from '@xyflow/react'
import { AnimatePresence, motion } from 'framer-motion'
import { ClipboardPaste, Copy, Files, Scissors, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useFlowDiagramContext } from './context/flow-diagram-context'
import { ToolbarButton, ToolbarSeparator } from './floating-canvas-toolbar'
import { generateUUID } from './utils/uuid'

type ClipBoard = {
  targetNodes: Node[]
  targetEdges: Edge[]
  mode: 'copy' | 'cut'
}

const PASTE_OFFSET = 60

export function FloatingSelectionToolbar() {
  const [clipBoard, setClipBoard] = useState<ClipBoard | null>(null)
  const {
    selectedEdgeIds,
    selectedNodeIds,
    setSelectedEdgeIds,
    setSelectedNodeIds,
    reactFlowInstance,
  } = useFlowDiagramContext()

  async function handleDelete() {
    const rf = reactFlowInstance!
    if (!rf) return

    await rf.deleteElements({
      edges: selectedEdgeIds.map((id) => rf.getEdge(id)!).filter(Boolean),
      nodes: selectedNodeIds.map((id) => rf.getNode(id)!).filter(Boolean),
    })
  }

  function getClipBoardNodes(rf: ReactFlowInstance) {
    const targetNodes = selectedNodeIds
      .map((id) => rf.getNode(id)!)
      .filter(Boolean)

    const targetEdges = selectedEdgeIds
      .map((id) => rf.getEdge(id)!)
      .filter(Boolean)

    const nodes = rf.getNodes()
    nodes.forEach((node) => {
      if (
        node.parentId &&
        !targetNodes.some((n) => n.id === node.id) &&
        targetNodes.some((n) => n.id === node.parentId)
      ) {
        console.log('adding node', node)
        targetNodes.push(node)
      }
    })

    const edges = rf.getEdges()
    edges.forEach((edge) => {
      if (
        !targetEdges.some((e) => e.id === edge.id) &&
        targetNodes.some((n) => n.id === edge.source) &&
        targetNodes.some((n) => n.id === edge.target)
      ) {
        console.log('adding edge', edge)
        targetEdges.push(edge)
      }
    })

    return { targetNodes, targetEdges }
  }

  function handleCopy(mode: 'copy' | 'cut') {
    const rf = reactFlowInstance!
    if (!rf) return

    setClipBoard({
      mode,
      ...getClipBoardNodes(rf),
    })

    setSelectedNodeIds([])
    setSelectedEdgeIds([])
  }

  async function handlePaste(cb = clipBoard) {
    const rf = reactFlowInstance!
    if (!rf || !cb) return

    const { targetNodes, targetEdges } = cb

    if (!targetNodes.length) return

    const idMap = new Map<string, string>()
    const targetNodeIds = new Set(targetNodes.map((node) => node.id))

    targetNodes.forEach((node) => {
      idMap.set(node.id, generateUUID())
    })

    const newNodes = targetNodes.map((node) => {
      const newId = idMap.get(node.id)!
      const childNodes = Array.isArray(node.data?.childNodes)
        ? node.data.childNodes.map(
            (childNodeId) => idMap.get(childNodeId) ?? childNodeId
          )
        : node.data?.childNodes

      return {
        ...node,
        id: newId,
        childNodes: undefined,
        data: {
          ...node.data,
          childNodes,
        },
        position:
          node.parentId && targetNodeIds.has(node.parentId)
            ? node.position
            : {
                x: node.position.x + PASTE_OFFSET,
                y: node.position.y + PASTE_OFFSET,
              },
      }
    })

    const newEdges = targetEdges.map((edge) => {
      const source = idMap.get(edge.source) || edge.source
      const target = idMap.get(edge.target) || edge.target

      return {
        ...edge,
        source,
        target,
        data: { ...edge.data },
        id: generateUUID(),
      }
    })

    newNodes.forEach((node) => {
      if (node.parentId) {
        const newParentId = idMap.get(node.parentId) || node.parentId
        node.parentId = newParentId
      }
    })

    const viewport = rf.getViewport()
    await rf.setViewport(
      {
        ...viewport,
        x: viewport.x - PASTE_OFFSET * viewport.zoom,
        y: viewport.y - PASTE_OFFSET * viewport.zoom,
      },
      {
        duration: 100,
      }
    )

    rf.setNodes((prevNodes) => [
      ...prevNodes.map((a) => ({ ...a, selected: false })),
      ...newNodes.map((a) => ({ ...a, selected: true })),
    ])

    rf.setEdges((prevEdges) => [
      ...prevEdges.map((a) => ({ ...a, selected: false })),
      ...newEdges.map((a) => ({ ...a, selected: true })),
    ])

    if (cb.mode === 'copy') {
      setClipBoard({
        mode: 'copy',
        targetNodes: newNodes,
        targetEdges: newEdges,
      })
    }

    if (cb.mode === 'cut') {
      await rf.deleteElements({
        edges: targetEdges,
        nodes: targetNodes,
      })

      setClipBoard(null)
    }
  }

  async function handleDuplicate() {
    const rf = reactFlowInstance!
    if (!rf) return

    await handlePaste({
      mode: 'copy',
      ...getClipBoardNodes(rf),
    })
  }

  const hasSelection = selectedNodeIds.length > 0 || selectedEdgeIds.length > 0
  const hasClipboard = !!clipBoard
  const autoRef = useAutoRef({
    handleDelete,
    handleDuplicate,
    handleCopy,
    handlePaste,
  })

  useEffect(() => {
    if (!hasSelection && !hasClipboard) return

    async function handleKeyDown(event: KeyboardEvent) {
      const { handleDelete, handleDuplicate, handleCopy, handlePaste } =
        autoRef.current

      const target = event.target as HTMLElement
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return
      }

      if (
        event.key === 'Delete' ||
        (event.key === 'Backspace' && hasSelection)
      ) {
        await handleDelete()
      }

      if (event.ctrlKey || event.metaKey) {
        if (event.key === 'd' && hasSelection) {
          event.preventDefault()
          handleDuplicate().catch(console.error)
        } else if (event.key === 'c' && hasSelection) {
          event.preventDefault()
          handleCopy('copy')
        } else if (event.key === 'v' && hasClipboard) {
          event.preventDefault()
          handlePaste().catch(console.error)
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [hasSelection, hasClipboard, autoRef])

  return (
    <AnimatePresence>
      {(hasSelection || clipBoard) && (
        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.75 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.75 }}
          transition={{ duration: 0.1, ease: 'easeOut' }}
          className="pointer-events-none absolute inset-x-0 bottom-3 flex items-center justify-center"
        >
          <div className="border-stock bg-card pointer-events-auto flex items-center gap-2 rounded-[0.75rem] border p-1 shadow-sm">
            {hasSelection && (
              <>
                <ToolbarButton
                  tooltip="Cut Selection"
                  tooltipPosition="bottom"
                  className="text-black/70"
                  onClick={() => handleCopy('cut')}
                >
                  <Scissors size={18} />
                </ToolbarButton>

                <ToolbarButton
                  tooltip="Copy Selection"
                  tooltipPosition="bottom"
                  className="text-black/70"
                  onClick={() => handleCopy('copy')}
                >
                  <Copy size={18} />
                </ToolbarButton>
              </>
            )}

            {!!clipBoard && (
              <>
                {hasSelection && <ToolbarSeparator />}
                <ToolbarButton
                  tooltip="Paste"
                  tooltipPosition="bottom"
                  className="text-black/70"
                  onClick={() => handlePaste()}
                >
                  <ClipboardPaste size={18} />
                </ToolbarButton>
              </>
            )}

            {hasSelection && (
              <>
                <ToolbarSeparator />
                <ToolbarButton
                  tooltip="Duplicate Selection"
                  tooltipPosition="bottom"
                  className="text-black/70"
                  onClick={() => handleDuplicate()}
                >
                  <Files size={18} />
                </ToolbarButton>

                <ToolbarButton
                  tooltip="Delete Selection"
                  tooltipPosition="bottom"
                  className="hover:text-destructive text-black/70"
                  onClick={handleDelete}
                >
                  <Trash2 size={18} />
                </ToolbarButton>
              </>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
