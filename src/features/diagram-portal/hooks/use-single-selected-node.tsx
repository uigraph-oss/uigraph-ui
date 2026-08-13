import { Node, useReactFlow } from '@xyflow/react'
import { useRef } from 'react'
import { useFlowDiagramContext } from '../context/flow-diagram-context'

export function useSingleSelectedNode<T extends Node>() {
  const reactFlow = useReactFlow()
  const ctx = useFlowDiagramContext()
  const embed = ctx.activeEmbed

  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  function resolveNode() {
    if (embed) {
      if (embed.selectedNodeIds.length !== 1) return null

      const found = embed.mirror.nodes.find(
        (item) => item.id === embed.selectedNodeIds[0]
      )

      return (found as T) ?? null
    }

    if (ctx.selectedNodeIds.length !== 1) return null

    return (ctx.reactFlowInstance?.getNode(ctx.selectedNodeIds[0]) as T) ?? null
  }

  const node = resolveNode()

  const data = (node?.data as T['data']) ?? null

  function updateNode(newNode: Partial<T>, forcedUpdate?: boolean) {
    const nodeId = node!.id!
    if (!nodeId) return

    const clonedNode = structuredClone(newNode)

    function runTimeout() {
      if (embed) {
        return embed.patchNode(nodeId, clonedNode)
      }

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
      if (embed) {
        return embed.patchNodeData(
          nodeId,
          clonedData as Record<string, unknown>
        )
      }

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
    },
  }
}
