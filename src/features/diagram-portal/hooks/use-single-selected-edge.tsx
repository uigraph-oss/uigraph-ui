import { Edge } from '@xyflow/react'
import { useRef } from 'react'
import { useFlowDiagramContext } from '../context/flow-diagram-context'

export function useSingleSelectedEdge<T extends Edge>() {
  const ctx = useFlowDiagramContext()

  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const edge =
    ctx.selectedEdgeIds.length === 1
      ? ((ctx.reactFlowInstance?.getEdge(ctx.selectedEdgeIds[0]) as T) ?? null)
      : null

  function updateEdge(newEdge: Partial<T>) {
    const edgeId = edge!.id!
    if (!edgeId) return

    const clonedEdge = structuredClone(newEdge)

    function runTimeout() {
      let merged: Edge | undefined

      ctx.setEdges((prevValue) => {
        return prevValue.map((prevEdge) => {
          if (prevEdge.id !== edgeId) return prevEdge
          merged = { ...prevEdge, ...clonedEdge }
          return merged
        })
      })

      if (merged) {
        console.log('Updating edge:', merged)
        ctx.reactFlowInstance?.updateEdge(edgeId!, merged)
      }
    }

    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(runTimeout, 100)
  }

  return { edge, updateEdge }
}
