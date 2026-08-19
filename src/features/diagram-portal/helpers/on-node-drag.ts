import { Node, ReactFlowInstance } from '@xyflow/react'
import { MouseEvent } from 'react'
import { isCollapsedFrame, isDescendantOf, isFrameNode } from './frame-nodes'

function getGroupChildNodes(node: Node) {
  return Array.isArray(node.data?.childNodes) ? node.data.childNodes : []
}

function updateGroupChildNodes(node: Node, childNodes: string[]) {
  return {
    ...node,
    data: {
      ...node.data,
      childNodes,
    },
  }
}

/** Frames nest, so `node.position` is parent-relative and unusable for hit testing. */
function getAbsolutePosition(node: Node, rf: ReactFlowInstance) {
  return (
    rf.getInternalNode(node.id)?.internals.positionAbsolute ?? node.position
  )
}

function getAbsoluteBounds(node: Node, rf: ReactFlowInstance) {
  const position = getAbsolutePosition(node, rf)

  const width = node.measured?.width ?? node.width ?? 0
  const height = node.measured?.height ?? node.height ?? 0

  return {
    left: position.x,
    top: position.y,
    right: position.x + width,
    bottom: position.y + height,
    area: width * height,
  }
}

/** The dragged node's own absolute position lags a frame behind, so derive it. */
function getDraggedAbsolutePosition(
  inputNode: Node,
  prevFrame: Node | undefined,
  rf: ReactFlowInstance
) {
  if (!prevFrame) return inputNode.position

  const framePosition = getAbsolutePosition(prevFrame, rf)

  return {
    x: inputNode.position.x + framePosition.x,
    y: inputNode.position.y + framePosition.y,
  }
}

export function handleOnNodeDrag(
  _event: MouseEvent,
  inputNode: Node,
  rf: ReactFlowInstance
) {
  const nodes = rf.getNodes()

  const prevFrame = nodes.find(
    (n) => n.id === inputNode.parentId && isFrameNode(n)
  )

  const absolutePosition = getDraggedAbsolutePosition(inputNode, prevFrame, rf)

  const nodeWidth = inputNode.measured?.width ?? inputNode.width ?? 0
  const nodeHeight = inputNode.measured?.height ?? inputNode.height ?? 0
  const nodeCenter = {
    x: absolutePosition.x + nodeWidth / 2,
    y: absolutePosition.y + nodeHeight / 2,
  }

  /** Boundaries nest by definition, so the innermost frame under the cursor wins. */
  let targetFrame: Node | undefined
  let targetArea = Infinity

  for (const n of nodes) {
    if (!isFrameNode(n)) continue
    if (n.id === inputNode.id) continue
    if (isCollapsedFrame(n)) continue
    if (isDescendantOf(nodes, n.id, inputNode.id)) continue

    const bounds = getAbsoluteBounds(n, rf)

    const contains =
      nodeCenter.x >= bounds.left &&
      nodeCenter.x <= bounds.right &&
      nodeCenter.y >= bounds.top &&
      nodeCenter.y <= bounds.bottom

    if (!contains) continue
    if (bounds.area >= targetArea) continue

    targetFrame = n
    targetArea = bounds.area
  }

  if (targetFrame) {
    if (inputNode.parentId === targetFrame.id) return

    const targetPosition = getAbsolutePosition(targetFrame, rf)

    return rf.setNodes((currentNodes) =>
      currentNodes.map((node) => {
        if (node.id === inputNode.id) {
          return {
            ...node,
            parentId: targetFrame.id,
            position: {
              x: absolutePosition.x - targetPosition.x,
              y: absolutePosition.y - targetPosition.y,
            },
          }
        }

        if (prevFrame && node.id === prevFrame.id) {
          return updateGroupChildNodes(
            node,
            getGroupChildNodes(node).filter(
              (childNodeId) => childNodeId !== inputNode.id
            )
          )
        }

        if (node.id === targetFrame.id) {
          return updateGroupChildNodes(node, [
            ...getGroupChildNodes(node).filter(
              (childNodeId) => childNodeId !== inputNode.id
            ),
            inputNode.id,
          ])
        }

        return node
      })
    )
  }

  if (!prevFrame) return

  rf.setNodes((currentNodes) =>
    currentNodes.map((node) => {
      if (node.id === inputNode.id) {
        return {
          ...node,
          parentId: undefined,
          position: absolutePosition,
        }
      }

      if (node.id === prevFrame.id) {
        return updateGroupChildNodes(
          node,
          getGroupChildNodes(node).filter(
            (childNodeId) => childNodeId !== inputNode.id
          )
        )
      }

      return node
    })
  )
}

export function handleOnGroupDrag(inputNode: Node, rf: ReactFlowInstance) {
  if (isCollapsedFrame(inputNode)) return

  const framePosition = getAbsolutePosition(inputNode, rf)
  const frameBounds = getAbsoluteBounds(inputNode, rf)

  rf.setNodes((currentNodes) => {
    const targetNodeIds = currentNodes
      .filter((node) => {
        if (node.id === inputNode.id || isFrameNode(node) || node.parentId) {
          return false
        }

        const nodeBounds = getAbsoluteBounds(node, rf)

        return (
          nodeBounds.left >= frameBounds.left &&
          nodeBounds.right <= frameBounds.right &&
          nodeBounds.top >= frameBounds.top &&
          nodeBounds.bottom <= frameBounds.bottom
        )
      })
      .map((node) => node.id)

    if (!targetNodeIds.length) {
      return currentNodes
    }

    const targetNodeIdsSet = new Set(targetNodeIds)

    return currentNodes.map((node) => {
      if (targetNodeIdsSet.has(node.id)) {
        return {
          ...node,
          parentId: inputNode.id,
          position: {
            x: node.position.x - framePosition.x,
            y: node.position.y - framePosition.y,
          },
        }
      }

      if (node.id === inputNode.id) {
        return updateGroupChildNodes(node, [
          ...getGroupChildNodes(node).filter(
            (childNodeId) => !targetNodeIdsSet.has(childNodeId)
          ),
          ...targetNodeIds,
        ])
      }

      return node
    })
  })
}
