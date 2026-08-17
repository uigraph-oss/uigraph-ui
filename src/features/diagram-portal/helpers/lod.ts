import { Edge, Node } from '@xyflow/react'

export const LOD_HIDDEN_CLASS = 'lod-hidden'
export const LOD_COLLAPSED_CLASS = 'lod-collapsed'

const LOD_THRESHOLDS = [0.15, 0.3, 0.6]
const LOD_HYSTERESIS = 0.02
const MAX_PARENT_DEPTH = 32

export function resolveVisibleDepth(zoom: number, previousDepth: number) {
  for (let depth = 0; depth < LOD_THRESHOLDS.length; depth++) {
    const threshold = LOD_THRESHOLDS[depth]
    const limit =
      previousDepth <= depth ? threshold + LOD_HYSTERESIS : threshold

    if (zoom < limit) return depth
  }

  return Infinity
}

export function applyLevelOfDetail(
  nodes: Node[],
  edges: Edge[],
  visibleDepth: number
): { nodes: Node[]; edges: Edge[] } {
  const nodesById = new Map(nodes.map((node) => [node.id, node]))

  function boundaryDepthOf(node: Node) {
    let depth = 0
    let parent = node.parentId ? nodesById.get(node.parentId) : undefined

    for (let hop = 0; hop < MAX_PARENT_DEPTH && parent; hop++) {
      if (parent.type === 'c4Boundary') depth++
      parent = parent.parentId ? nodesById.get(parent.parentId) : undefined
    }

    return depth
  }

  const hiddenNodeIds = new Set<string>()

  const nextNodes = nodes.map((node) => {
    const depth = boundaryDepthOf(node)

    if (depth > visibleDepth) {
      hiddenNodeIds.add(node.id)
      return { ...node, className: LOD_HIDDEN_CLASS }
    }

    if (node.type === 'c4Boundary' && depth === visibleDepth) {
      return { ...node, className: LOD_COLLAPSED_CLASS }
    }

    return { ...node, className: undefined }
  })

  const nextEdges = edges.map((edge) => {
    if (hiddenNodeIds.has(edge.source) || hiddenNodeIds.has(edge.target)) {
      return { ...edge, className: LOD_HIDDEN_CLASS }
    }

    return { ...edge, className: undefined }
  })

  return { nodes: nextNodes, edges: nextEdges }
}
