import { Node } from '@xyflow/react'
import { DragEvent } from 'react'
import {
  AnimatedNodeData,
  BuilderNodeData,
  C4BoundaryNodeData,
  C4NodeData,
  CloudNodeData,
  DatabaseTableSQLNodeData,
  ImageNodeData,
  ShapeNodeData,
  SubDiagramNodeData,
  TextNodeData,
  TNodeTypes,
} from '..'
import { TComponentField } from '../../types/component-fields'
import { generateUUID } from '../../utils/uuid'
import { TableNodeData } from '../table-node'
import {
  setDiagramDragPreview,
  setDiagramImageDragPreview,
} from './drag-preview'

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
                : T extends 'c4'
                  ? C4NodeData
                  : T extends 'c4Boundary'
                    ? C4BoundaryNodeData
                    : T extends 'subDiagram'
                      ? SubDiagramNodeData
                      : never

export function componentDragDataTransfer<T extends TNodeTypes>(
  event: DragEvent,
  type: T,
  data: NodeData<T>,
  node?: Partial<Node>,
  previewLabel?: string,
  previewImageSrc?: string
) {
  const dataTransfer = event.dataTransfer
  const builderNode: BuilderNodeShell = {
    type: type,
    id: generateUUID(),
    data: { ...data },
    ...node,
  }

  dataTransfer.setData('application/react-flow', JSON.stringify(builderNode))
  dataTransfer.effectAllowed = 'move'

  if (previewImageSrc) {
    setDiagramImageDragPreview(event.nativeEvent, previewImageSrc)
    return
  }

  setDiagramDragPreview(
    event.nativeEvent,
    previewLabel ?? resolveDragPreviewLabel(data)
  )
}

function resolveDragPreviewLabel(data: Record<string, unknown>) {
  if (typeof data.componentName === 'string' && data.componentName) {
    return data.componentName
  }

  if (typeof data.name === 'string' && data.name) {
    return data.name
  }

  const fields = data.componentFields as TComponentField[] | undefined
  const nameField = fields?.find((field) => field.label === 'Name')
  const nameValue = (nameField?.data?.[0] as { value?: string } | undefined)
    ?.value

  if (nameValue) {
    return nameValue
  }

  return 'Component'
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
