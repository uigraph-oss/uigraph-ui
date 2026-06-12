import { Node, useReactFlow } from '@xyflow/react'
import { useRef } from 'react'
import { useFlowDiagramContext } from '../context/flow-diagram-context'

export function useSingleSelectedNode<T extends Node>() {
  const reactFlow = useReactFlow()
  const ctx = useFlowDiagramContext()

  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const node =
    ctx.selectedNodeIds.length === 1
      ? ((ctx.reactFlowInstance?.getNode(ctx.selectedNodeIds[0]) as T) ?? null)
      : null

  const data = (node?.data as T['data']) ?? null

  function updateNode(newNode: Partial<T>, forcedUpdate?: boolean) {
    const nodeId = node!.id!
    if (!nodeId) return

    const clonedNode = structuredClone(newNode)

    function runTimeout() {
      if (forcedUpdate) {
        return reactFlow.updateNode(nodeId, clonedNode)
      }

      let merged: Node | undefined

      ctx.setNodes((prevValue) => {
        return prevValue.map((prevNode) => {
          if (prevNode.id !== clonedNode.id) return prevNode
          merged = mergeNode(prevNode, clonedNode)
          return merged
        })
      })

      if (merged) {
        reactFlow.updateNode(nodeId, merged)
      }
    }

    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(runTimeout, 100)
  }

  function updateData(newData: Partial<T['data']>, forcedUpdate?: boolean) {
    const nodeId = node!.id!
    if (!nodeId) return

    const clonedData = structuredClone(newData)

    function runTimeout() {
      if (forcedUpdate) {
        return reactFlow.updateNodeData(nodeId, newData)
      }

      let merged: Node | undefined

      ctx.setNodes((prevValue) => {
        return prevValue.map((prevNode) => {
          if (prevNode.id !== nodeId) return prevNode
          merged = mergeNode(prevNode, { data: clonedData })
          return merged
        })
      })

      if (merged) {
        reactFlow.updateNodeData(nodeId, merged.data)
      }
    }

    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(runTimeout, 100)
  }

  return {
    node,
    data,
    updateNode,
    updateData,
  }
}

function mergeNode(node: Node, newNode: Partial<Node>) {
  return {
    ...node,
    ...newNode,

    data: {
      ...node.data,
      ...newNode.data,

      hide: {
        ...(node.data.hide ?? {}),
        ...(newNode.data?.hide ?? {}),
      },
    },
  }
}
