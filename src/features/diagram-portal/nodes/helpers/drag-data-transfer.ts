import { Node } from '@xyflow/react'
import {
  AnimatedNodeData,
  BuilderNodeData,
  CloudNodeData,
  DatabaseTableSQLNodeData,
  ImageNodeData,
  ShapeNodeData,
  TextNodeData,
  TNodeTypes,
} from '..'
import { TComponentField } from '../../types/component-fields'
import { generateUUID } from '../../utils/uuid'
import { TableNodeData } from '../table-node'

type BuilderNodeShell = Omit<Node, 'position'>

type NodeData<T extends TNodeTypes> = {
  [key: string]: unknown
  componentFields?: TComponentField[]
} & T extends 'shape'
  ? ShapeNodeData
  : T extends 'cloud'
    ? CloudNodeData
    : T extends 'gif'
      ? AnimatedNodeData
      : T extends 'builder'
        ? BuilderNodeData
        : T extends 'text'
          ? TextNodeData
          : T extends 'image'
            ? ImageNodeData
            : T extends 'databaseTableSQL'
              ? DatabaseTableSQLNodeData
              : T extends 'table'
                ? TableNodeData
                : never

export function componentDragDataTransfer<T extends TNodeTypes>(
  dataTransfer: DataTransfer,
  type: T,
  data: NodeData<T>,
  node?: Partial<Node>
) {
  const builderNode: BuilderNodeShell = {
    type: type,
    id: generateUUID(),
    data: { ...data, label: 'DEV' },
    ...node,
  }

  dataTransfer.setData('application/react-flow', JSON.stringify(builderNode))
  dataTransfer.effectAllowed = 'move'
}

export function componentDropDataTransfer(
  dataTransfer: DataTransfer
): BuilderNodeShell | null {
  const node = dataTransfer.getData('application/react-flow')

  if (!node) return null

  const parsedNode = JSON.parse(node)

  return {
    id: generateUUID(),
    ...parsedNode,
    data: {
      ...parsedNode.data,
      componentFields: parsedNode?.data?.componentFields ?? [],
    },
  }
}
