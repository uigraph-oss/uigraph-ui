import { Edge, Node } from '@xyflow/react'
import isEqual from 'lodash/isEqual'
import { useCallback, useEffect, useRef } from 'react'

const MAX_HISTORY = 50

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

  useEffect(() => {
    if (!enabled) return

    if (nodes.some((node) => node.dragging)) return

    const snapshot = { nodes, edges }
    const history = historyRef.current
    const index = indexRef.current

    if (history.length === 0) {
      historyRef.current = [snapshot]
      indexRef.current = 0
      return
    }

    if (isEqual(snapshot, history[index])) return

    history.splice(index + 1)
    history.push(snapshot)
    indexRef.current = history.length - 1

    if (history.length > MAX_HISTORY) {
      history.shift()
      indexRef.current = history.length - 1
    }
  }, [nodes, edges, enabled])

  const undo = useCallback(() => {
    const index = indexRef.current

    if (index <= 0) return

    indexRef.current = index - 1
    const snapshot = historyRef.current[index - 1]
    setNodes(snapshot.nodes)
    setEdges(snapshot.edges)
  }, [setNodes, setEdges])

  const redo = useCallback(() => {
    const history = historyRef.current
    const index = indexRef.current

    if (index >= history.length - 1) return

    indexRef.current = index + 1
    const snapshot = history[index + 1]
    setNodes(snapshot.nodes)
    setEdges(snapshot.edges)
  }, [setNodes, setEdges])

  return { undo, redo }
}
