import { Edge, Node } from '@xyflow/react'
import { isCollapsedFrame } from './frame-nodes'

export const COLLAPSED_FRAME_WIDTH = 240
/** Tall enough for the name, the kind and two clamped lines of description. */
export const COLLAPSED_FRAME_HEIGHT = 104

const MAX_PARENT_DEPTH = 32

/**
 * Derives the collapsed view of the diagram. Nothing here is persisted — only
 * `data.collapsed` lives in the saved document, so expanding restores the
 * original layout exactly.
 */
export function applyCollapsedFrames(
  nodes: Node[],
  edges: Edge[]
): { nodes: Node[]; edges: Edge[] } {
  if (!nodes.some((node) => isCollapsedFrame(node))) {
    return { nodes, edges }
  }

  const nodesById = new Map(nodes.map((node) => [node.id, node]))

  /** The outermost collapsed ancestor is what a hidden node folds into. */
  function outermostCollapsedAncestor(node: Node) {
    let collapsedId: string | undefined
    let parent = node.parentId ? nodesById.get(node.parentId) : undefined

    for (let hop = 0; hop < MAX_PARENT_DEPTH && parent; hop++) {
      if (isCollapsedFrame(parent)) collapsedId = parent.id
      parent = parent.parentId ? nodesById.get(parent.parentId) : undefined
    }

    return collapsedId
  }

  const foldedInto = new Map<string, string>()

  for (const node of nodes) {
    const ancestorId = outermostCollapsedAncestor(node)
    if (ancestorId) foldedInto.set(node.id, ancestorId)
  }

  const nextNodes = nodes.map((node) => {
    const ancestorId = foldedInto.get(node.id)

    if (ancestorId) return { ...node, hidden: true, selected: false }

    if (isCollapsedFrame(node)) {
      return {
        ...node,
        className: undefined,
        width: COLLAPSED_FRAME_WIDTH,
        height: COLLAPSED_FRAME_HEIGHT,
        style: {
          ...node.style,
          width: COLLAPSED_FRAME_WIDTH,
          height: COLLAPSED_FRAME_HEIGHT,
        },
      }
    }

    return node
  })

  const reroutedEndpoints = edges.map((edge) => ({
    source: foldedInto.get(edge.source) ?? edge.source,
    target: foldedInto.get(edge.target) ?? edge.target,
  }))

  /** Untouched edges keep their identity, so a rerouted duplicate folds into them. */
  const seen = new Set(
    edges
      .filter(
        (edge, index) =>
          reroutedEndpoints[index].source === edge.source &&
          reroutedEndpoints[index].target === edge.target
      )
      .map((edge) => `${edge.source}|${edge.target}`)
  )

  const nextEdges = edges.map((edge, index) => {
    const { source, target } = reroutedEndpoints[index]

    if (source === edge.source && target === edge.target) return edge

    if (source === target) return { ...edge, hidden: true }

    const key = `${source}|${target}`

    if (seen.has(key)) return { ...edge, hidden: true }
    seen.add(key)

    return {
      ...edge,
      source,
      target,
      sourceHandle: undefined,
      targetHandle: undefined,
      reconnectable: false,
    }
  })

  return { nodes: nextNodes, edges: nextEdges }
}
