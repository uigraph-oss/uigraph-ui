import { Node } from '@xyflow/react'

const MAX_PARENT_DEPTH = 32

export function isFrameNode(node: { type?: string }) {
  return node.type === 'group' || node.type === 'c4Boundary'
}

export function isCollapsedFrame(node: { type?: string; data?: unknown }) {
  if (!isFrameNode(node)) return false

  return (node.data as { collapsed?: boolean } | undefined)?.collapsed === true
}

export function isDescendantOf(
  nodes: Node[],
  nodeId: string,
  ancestorId: string
) {
  const nodesById = new Map(nodes.map((node) => [node.id, node]))

  let current = nodesById.get(nodeId)

  for (let hop = 0; hop < MAX_PARENT_DEPTH && current?.parentId; hop++) {
    if (current.parentId === ancestorId) return true
    current = nodesById.get(current.parentId)
  }

  return false
}

export function toggleFrameCollapsed(nodes: Node[], frameId: string) {
  const frame = nodes.find((node) => node.id === frameId)
  if (!frame) return nodes

  const collapsed = !isCollapsedFrame(frame)

  return nodes.map((node) => {
    if (node.id === frameId) {
      return { ...node, data: { ...node.data, collapsed } }
    }

    /** A hidden child must not stay selected and drive the properties panel. */
    if (collapsed && node.selected && isDescendantOf(nodes, node.id, frameId)) {
      return { ...node, selected: false }
    }

    return node
  })
}
