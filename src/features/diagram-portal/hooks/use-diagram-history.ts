import { Edge, Node } from '@xyflow/react'
import isEqual from 'lodash/isEqual'
import { useCallback, useEffect, useRef } from 'react'

const MAX_HISTORY = 100
const COMMIT_DELAY = 500

type Snapshot = {
  nodes: Node[]
  edges: Edge[]
}

type UseDiagramHistoryProps = {
  nodes: Node[]
  edges: Edge[]
  setNodes: (nodes: Node[]) => void
  setEdges: (edges: Edge[]) => void
  enabled: boolean
}

export function useDiagramHistory({
  nodes,
  edges,
  setNodes,
  setEdges,
  enabled,
}: UseDiagramHistoryProps) {
  const historyRef = useRef<Snapshot[]>([])
  const indexRef = useRef(-1)
  const pendingRef = useRef<Snapshot | null>(null)

  const commitPending = useCallback(() => {
    const snapshot = pendingRef.current

    if (!snapshot) return

    pendingRef.current = null

    const history = historyRef.current
    const index = indexRef.current

    if (isEqual(snapshot, history[index])) return

    history.splice(index + 1)
    history.push(snapshot)
    indexRef.current = history.length - 1

    if (history.length > MAX_HISTORY) {
      history.shift()
      indexRef.current = history.length - 1
    }
  }, [])

  useEffect(() => {
    if (!enabled) return

    if (nodes.some((node) => node.dragging)) return

    const snapshot = { nodes, edges }
    const history = historyRef.current

    if (history.length === 0) {
      historyRef.current = [snapshot]
      indexRef.current = 0
      return
    }

    if (isEqual(snapshot, history[indexRef.current])) return

    pendingRef.current = snapshot
    const timeout = setTimeout(commitPending, COMMIT_DELAY)

    return () => clearTimeout(timeout)
  }, [nodes, edges, enabled, commitPending])

  const undo = useCallback(() => {
    if (!enabled) return

    commitPending()

    const index = indexRef.current

    if (index <= 0) return

    indexRef.current = index - 1
    const snapshot = historyRef.current[index - 1]
    setNodes(snapshot.nodes)
    setEdges(snapshot.edges)
  }, [enabled, setNodes, setEdges, commitPending])

  const redo = useCallback(() => {
    if (!enabled) return

    commitPending()

    const history = historyRef.current
    const index = indexRef.current

    if (index >= history.length - 1) return

    indexRef.current = index + 1
    const snapshot = history[index + 1]
    setNodes(snapshot.nodes)
    setEdges(snapshot.edges)
  }, [enabled, setNodes, setEdges, commitPending])

  return { undo, redo }
}
