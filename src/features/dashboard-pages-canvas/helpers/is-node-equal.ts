import { Node } from '@xyflow/react'

function createNodeHash(nodes: Node[]) {
  return nodes
    .sort((a, b) => a.id.localeCompare(b.id))
    .map((n) => `${n.id}@${n.position.x}@${n.position.y}`)
    .join('|')
}

export function isNodesEqual(nodes1: Node[], nodes2: Node[]) {
  const node1Hash = createNodeHash(nodes1)
  const node2Hash = createNodeHash(nodes2)
  return node1Hash === node2Hash
}
