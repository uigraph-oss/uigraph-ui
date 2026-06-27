'use client'

import { ComponentInputType } from '@/features/component-meta'
import { Node } from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { GroupNodeData } from '../nodes'
import { generateUUID } from '../utils/uuid'

export function createGroupNode(
  bounds: { x: number; y: number; width: number; height: number },
  childNodeIds: string[]
): Node {
  return {
    id: generateUUID(),
    type: 'group',
    position: { x: bounds.x, y: bounds.y },
    data: {
      childNodes: childNodeIds,
      backgroundColor: 'rgba(20, 25, 37, 0.35)',
      borderColor: '#828DA3',
      componentFields: [
        {
          componentFieldId: 'name',
          type: ComponentInputType.TextInput,
          label: 'Name',
          isReadonly: true,
          data: [{ value: 'Group' }],
        },
      ],
    } satisfies GroupNodeData,
    style: {
      width: bounds.width + 20,
      height: bounds.height + 50,
    },
  }
}

export function getGroupChildNodes(node: Node): string[] {
  if (node.type !== 'group') return []
  return (node.data?.childNodes ?? []) as string[]
}

export function isGroupNode(node: Node): node is Node & {
  data: { childNodes: string[]; lastPosition?: { x: number; y: number } }
} {
  return (
    node.type === 'group' &&
    node.data &&
    Array.isArray((node.data as Record<string, unknown>).childNodes)
  )
}
