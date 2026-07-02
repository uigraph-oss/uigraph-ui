import { cn } from '@/lib/utils'
import { buildMetaData } from '@uigraph/sdk'
import type { Node, NodeProps } from '@xyflow/react'
import {
  Handle,
  NodeResizer,
  Position,
  useReactFlow,
  useStore,
} from '@xyflow/react'
import { useEffect } from 'react'
import TextareaAutosize from 'react-textarea-autosize'
import { useFlowDiagramContext } from '../context/flow-diagram-context'
import { useComponentField } from '../hooks/use-component-field'
import { NodeDataGenerator } from './types/node.types'

export type GroupNodeData = NodeDataGenerator<{
  backgroundColor?: string
  borderColor?: string
  childNodes?: string[]
  autoLayout?: boolean
}>

export type TGroupNode = Node<GroupNodeData, 'group'>

const DEFAULT_GROUP_BACKGROUND = 'rgba(20, 25, 37, 0.35)'
const DEFAULT_GROUP_BORDER = '#828DA3'

const AUTO_LAYOUT_PAD_X = 16
const AUTO_LAYOUT_PAD_TOP = 36
const AUTO_LAYOUT_PAD_BOTTOM = 16

function computeGroupAutoLayout(nodes: Node[], groupId: string) {
  const group = nodes.find((node) => node.id === groupId)
  if (!group) return null

  const children = nodes.filter((node) => node.parentId === groupId)
  if (children.length === 0) return null

  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity

  for (const child of children) {
    const width = child.measured?.width ?? child.width ?? 0
    const height = child.measured?.height ?? child.height ?? 0
    minX = Math.min(minX, child.position.x)
    minY = Math.min(minY, child.position.y)
    maxX = Math.max(maxX, child.position.x + width)
    maxY = Math.max(maxY, child.position.y + height)
  }

  const shiftX = AUTO_LAYOUT_PAD_X - minX
  const shiftY = AUTO_LAYOUT_PAD_TOP - minY

  const nextWidth = maxX - minX + AUTO_LAYOUT_PAD_X * 2
  const nextHeight = maxY - minY + AUTO_LAYOUT_PAD_TOP + AUTO_LAYOUT_PAD_BOTTOM

  const currentWidth =
    group.width ??
    group.measured?.width ??
    (group.style?.width as number | undefined) ??
    0
  const currentHeight =
    group.height ??
    group.measured?.height ??
    (group.style?.height as number | undefined) ??
    0

  const isConverged =
    Math.abs(shiftX) < 0.5 &&
    Math.abs(shiftY) < 0.5 &&
    Math.abs(nextWidth - currentWidth) < 0.5 &&
    Math.abs(nextHeight - currentHeight) < 0.5

  if (isConverged) return null

  const childIds = new Set(children.map((child) => child.id))

  return nodes.map((node) => {
    if (node.id === groupId) {
      return {
        ...node,
        position: {
          x: node.position.x - shiftX,
          y: node.position.y - shiftY,
        },
        width: nextWidth,
        height: nextHeight,
        style: { ...node.style, width: nextWidth, height: nextHeight },
      }
    }

    if (childIds.has(node.id)) {
      return {
        ...node,
        position: {
          x: node.position.x + shiftX,
          y: node.position.y + shiftY,
        },
      }
    }

    return node
  })
}

function resolveGroupFrameStyles(data: GroupNodeData) {
  const backgroundColor = data.backgroundColor
  const borderColor = data.borderColor

  const isLegacyLightFrame =
    backgroundColor === '#FFFFFF' && (!borderColor || borderColor === '#000000')

  if (isLegacyLightFrame) {
    return {
      backgroundColor: DEFAULT_GROUP_BACKGROUND,
      borderColor: DEFAULT_GROUP_BORDER,
    }
  }

  return {
    backgroundColor: backgroundColor || DEFAULT_GROUP_BACKGROUND,
    borderColor: borderColor || DEFAULT_GROUP_BORDER,
  }
}

export function GroupNode({ id, data, selected }: NodeProps<TGroupNode>) {
  const { updateNodeData, getNodes, setNodes } = useReactFlow()
  const { isEdgeConnecting } = useFlowDiagramContext()
  const name = useComponentField<string>(data.componentFields, {
    componentFieldId: 'name',
  })

  const autoLayout = data.autoLayout ?? false

  const childrenSignature = useStore((store) => {
    let signature = ''
    store.nodeLookup.forEach((node) => {
      if (node.parentId !== id) return
      const width = node.measured?.width ?? node.width ?? 0
      const height = node.measured?.height ?? node.height ?? 0
      signature += `${node.id},${node.position.x},${node.position.y},${width},${height};`
    })
    return signature
  })

  useEffect(() => {
    if (!autoLayout) return

    const nodes = getNodes()
    const children = nodes.filter((node) => node.parentId === id)

    if (children.some((child) => child.measured?.width === undefined)) return

    const updated = computeGroupAutoLayout(nodes, id)

    setNodes(
      (updated ?? nodes).map((node) =>
        node.id === id
          ? { ...node, data: { ...node.data, autoLayout: undefined } }
          : node
      )
    )
  }, [autoLayout, childrenSignature, id, getNodes, setNodes])

  const frameStyles = resolveGroupFrameStyles(data)

  return (
    <div
      className="size-full rounded-[0.5rem]"
      style={{
        backgroundColor: frameStyles.backgroundColor,
        border: `2px dashed ${frameStyles.borderColor}`,
      }}
    >
      <NodeResizer
        isVisible={selected && !autoLayout}
        minWidth={200}
        minHeight={150}
        keepAspectRatio={false}
      />

      <Handle
        id="target-top"
        type="target"
        position={Position.Top}
        className={cn('!-top-2', isEdgeConnecting && 'connection-enabled')}
        style={{ zIndex: 10, pointerEvents: 'auto' }}
      />
      <Handle
        id="source-top"
        type="source"
        position={Position.Top}
        className={cn('!-top-2', isEdgeConnecting && 'connection-enabled')}
        style={{ zIndex: 10, pointerEvents: 'auto' }}
      />

      <Handle
        id="target-bottom"
        type="target"
        position={Position.Bottom}
        className={cn('!-bottom-2', isEdgeConnecting && 'connection-enabled')}
        style={{ zIndex: 10, pointerEvents: 'auto' }}
      />
      <Handle
        id="source-bottom"
        type="source"
        position={Position.Bottom}
        className={cn('!-bottom-2', isEdgeConnecting && 'connection-enabled')}
        style={{ zIndex: 10, pointerEvents: 'auto' }}
      />

      <Handle
        id="target-left"
        type="target"
        position={Position.Left}
        className={cn('!-left-2', isEdgeConnecting && 'connection-enabled')}
        style={{ zIndex: 10, pointerEvents: 'auto' }}
      />
      <Handle
        id="source-left"
        type="source"
        position={Position.Left}
        className={cn('!-left-2', isEdgeConnecting && 'connection-enabled')}
        style={{ zIndex: 10, pointerEvents: 'auto' }}
      />

      <Handle
        id="target-right"
        type="target"
        position={Position.Right}
        className={cn('!-right-2', isEdgeConnecting && 'connection-enabled')}
        style={{ zIndex: 10, pointerEvents: 'auto' }}
      />
      <Handle
        id="source-right"
        type="source"
        position={Position.Right}
        className={cn('!-right-2', isEdgeConnecting && 'connection-enabled')}
        style={{ zIndex: 10, pointerEvents: 'auto' }}
      />

      <TextareaAutosize
        value={name ?? ''}
        placeholder=""
        onKeyDown={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        className="pointer-events-auto absolute top-2 left-2 h-auto w-auto resize-none overflow-hidden border-none bg-transparent text-sm font-medium break-words text-[#F4F7FC] outline-none placeholder:text-[#828DA3]"
        onChange={(e) => {
          const value = e.currentTarget.value
          updateNodeData(id, {
            componentFields: buildMetaData(data.componentFields ?? [], {
              name: value,
            }),
          })
        }}
      />
    </div>
  )
}
