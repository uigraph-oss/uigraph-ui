import { useAutoRef } from '@/hooks/use-auto-ref'
import { Edge, Node, ReactFlowInstance } from '@xyflow/react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ClipboardPaste,
  Copy,
  Files,
  Scan,
  Scissors,
  Trash2,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { useFlowDiagramContext } from './context/flow-diagram-context'
import {
  ToolbarButton,
  ToolbarSeparator,
  diagramToolbarContainerClassName,
} from './floating-canvas-toolbar'
import { beautifySequenceDiagram } from './helpers/beautify-sequence-diagram'
import { focusNodes } from './helpers/camera'
import { getNextParticipantColumn } from './helpers/sequence-diagram-authoring'
import { generateUUID } from './utils/uuid'

type ClipBoard = {
  targetNodes: Node[]
  targetEdges: Edge[]
  mode: 'copy' | 'cut'
}

const PASTE_OFFSET = 60

// Closes the row gap a deleted message (or participant) leaves behind, and
// regenerates any remaining messages' row-handle ids to match their
// (possibly shifted) new position. No-op unless a sequence node was
// actually among the deleted nodes.
function renumberAfterDelete(rf: ReactFlowInstance, deletedNodes: Node[]) {
  const hasSequenceNode = deletedNodes.some(
    (n) => n.type === 'sequenceParticipant' || n.id.startsWith('message-')
  )
  if (!hasSequenceNode) return

  const { nodes: beautifiedNodes, edges: beautifiedEdges } =
    beautifySequenceDiagram(rf.getNodes(), rf.getEdges())
  rf.setNodes(beautifiedNodes)
  rf.setEdges(beautifiedEdges)
}

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

    const nodesToDelete = selectedNodeIds
      .map((id) => rf.getNode(id)!)
      .filter(Boolean)

    await rf.deleteElements({
      edges: selectedEdgeIds.map((id) => rf.getEdge(id)!).filter(Boolean),
      nodes: nodesToDelete,
    })

    renumberAfterDelete(rf, nodesToDelete)
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
      // Preserve the `participant-`/`message-` id prefixes every sequence-
      // diagram detection check (`startsWith(...)`) relies on — a clone
      // with a plain UUID would silently stop being recognized as a
      // sequence node anywhere downstream.
      const prefix =
        node.type === 'sequenceParticipant'
          ? 'participant-'
          : node.id.startsWith('message-')
            ? 'message-'
            : ''
      idMap.set(node.id, `${prefix}${generateUUID()}`)
    })

    // Cloned participants must land on the column grid at y=0, not at a
    // flat +60/+60 offset — that's neither a valid column position nor the
    // canonical row-0 y every other participant is locked to, which is
    // exactly what previously produced an unaligned clone nobody could
    // drag back into place.
    const { x: startX, columnWidth } = getNextParticipantColumn(rf.getNodes())
    let nextParticipantX = startX

    const newNodes = targetNodes.map((node) => {
      const newId = idMap.get(node.id)!
      const childNodes = Array.isArray(node.data?.childNodes)
        ? node.data.childNodes.map(
            (childNodeId) => idMap.get(childNodeId) ?? childNodeId
          )
        : node.data?.childNodes

      let position =
        node.parentId && targetNodeIds.has(node.parentId)
          ? node.position
          : {
              x: node.position.x + PASTE_OFFSET,
              y: node.position.y + PASTE_OFFSET,
            }

      if (node.type === 'sequenceParticipant') {
        position = { x: nextParticipantX, y: 0 }
        nextParticipantX += columnWidth
      }

      return {
        ...node,
        id: newId,
        childNodes: undefined,
        data: {
          ...node.data,
          childNodes,
        },
        position,
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

    const hasSequenceClone = newNodes.some(
      (n) => n.type === 'sequenceParticipant' || n.id.startsWith('message-')
    )

    if (hasSequenceClone) {
      // Run the pasted diagram through a full beautify pass: it fixes row
      // spacing/X-centering for the clone (and, via renumberSequenceRows,
      // regenerates any row-handle-id edges the clone brought with it that
      // would otherwise still point at its original row).
      const newNodeIds = new Set<string>(newNodes.map((n) => n.id))
      const newEdgeIds = new Set<string>(newEdges.map((e) => e.id))
      const prevNodes = rf.getNodes().map((a) => ({ ...a, selected: false }))
      const prevEdges = rf.getEdges().map((a) => ({ ...a, selected: false }))

      const { nodes: beautifiedNodes, edges: beautifiedEdges } =
        beautifySequenceDiagram(
          [...prevNodes, ...newNodes],
          [...prevEdges, ...newEdges]
        )

      rf.setNodes(
        beautifiedNodes.map((n) =>
          newNodeIds.has(n.id) ? { ...n, selected: true } : n
        )
      )
      rf.setEdges(
        beautifiedEdges.map((e) =>
          newEdgeIds.has(e.id) ? { ...e, selected: true } : e
        )
      )
    } else {
      rf.setNodes((prevNodes) => [
        ...prevNodes.map((a) => ({ ...a, selected: false })),
        ...newNodes.map((a) => ({ ...a, selected: true })),
      ])

      rf.setEdges((prevEdges) => [
        ...prevEdges.map((a) => ({ ...a, selected: false })),
        ...newEdges.map((a) => ({ ...a, selected: true })),
      ])
    }

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

      renumberAfterDelete(rf, targetNodes)
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
          <div className={diagramToolbarContainerClassName}>
            {hasSelection && (
              <>
                <ToolbarButton
                  tooltip="Zoom to Selection"
                  tooltipPosition="bottom"
                  onClick={() =>
                    reactFlowInstance &&
                    focusNodes(reactFlowInstance, selectedNodeIds)
                  }
                >
                  <Scan size={18} />
                </ToolbarButton>

                <ToolbarSeparator />

                <ToolbarButton
                  tooltip="Cut Selection"
                  tooltipPosition="bottom"
                  onClick={() => handleCopy('cut')}
                >
                  <Scissors size={18} />
                </ToolbarButton>

                <ToolbarButton
                  tooltip="Copy Selection"
                  tooltipPosition="bottom"
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
                  onClick={() => handleDuplicate()}
                >
                  <Files size={18} />
                </ToolbarButton>

                <ToolbarButton
                  tooltip="Delete Selection"
                  tooltipPosition="bottom"
                  className="hover:text-destructive"
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
