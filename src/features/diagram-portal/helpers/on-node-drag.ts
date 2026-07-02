import { Node, ReactFlowInstance } from '@xyflow/react'
import { MouseEvent } from 'react'

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

function getNodeBounds(node: Node) {
  return {
    left: node.position.x,
    top: node.position.y,
    right: node.position.x + (node.measured?.width ?? node.width ?? 0),
    bottom: node.position.y + (node.measured?.height ?? node.height ?? 0),
  }
}

export function handleOnNodeDrag(
  event: MouseEvent,
  inputNode: Node,
  rf: ReactFlowInstance
) {
  const nodes = rf.getNodes()
  const position = rf.screenToFlowPosition({
    x: event.clientX,
    y: event.clientY,
  })

  const prevGroup = nodes.find(
    (n) => n.type === 'group' && n.id === inputNode.parentId
  )

  const groupArea = nodes.find((n) => {
    if (n.type !== 'group') return false

    const groupBounds = getNodeBounds(n)

    return (
      position.x >= groupBounds.left &&
      position.x <= groupBounds.right &&
      position.y >= groupBounds.top &&
      position.y <= groupBounds.bottom
    )
  })

  if (groupArea) {
    if (inputNode.parentId === groupArea.id) {
      return console.log('Node already in group', inputNode.id)
    }

    console.log('Updating node to group', inputNode.id, groupArea.id)
    return rf.setNodes((currentNodes) =>
      currentNodes.map((node) => {
        if (node.id === inputNode.id) {
          return {
            ...node,
            parentId: groupArea.id,
            position: prevGroup
              ? {
                  x:
                    inputNode.position.x +
                    prevGroup.position.x -
                    groupArea.position.x,
                  y:
                    inputNode.position.y +
                    prevGroup.position.y -
                    groupArea.position.y,
                }
              : {
                  x: inputNode.position.x - groupArea.position.x,
                  y: inputNode.position.y - groupArea.position.y,
                },
          }
        }

        if (prevGroup && node.id === prevGroup.id) {
          return updateGroupChildNodes(
            node,
            getGroupChildNodes(node).filter(
              (childNodeId) => childNodeId !== inputNode.id
            )
          )
        }

        if (node.id === groupArea.id) {
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

  if (!prevGroup) {
    return console.log('Node group not found', inputNode.id)
  }

  console.log('Updating node to no group', inputNode.id)
  rf.setNodes((currentNodes) =>
    currentNodes.map((node) => {
      if (node.id === inputNode.id) {
        return {
          ...node,
          parentId: undefined,
          position: {
            x: inputNode.position.x + prevGroup.position.x,
            y: inputNode.position.y + prevGroup.position.y,
          },
        }
      }

      if (node.id === prevGroup.id) {
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
  const groupBounds = getNodeBounds(inputNode)

  rf.setNodes((currentNodes) => {
    const targetNodeIds = currentNodes
      .filter((node) => {
        if (
          node.id === inputNode.id ||
          node.type === 'group' ||
          node.parentId
        ) {
          return false
        }

        const nodeBounds = getNodeBounds(node)

        return (
          nodeBounds.left >= groupBounds.left &&
          nodeBounds.right <= groupBounds.right &&
          nodeBounds.top >= groupBounds.top &&
          nodeBounds.bottom <= groupBounds.bottom
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
            x: node.position.x - inputNode.position.x,
            y: node.position.y - inputNode.position.y,
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
