import { cn } from '@/lib/utils'
import { buildMetaData } from '@uigraph/sdk'
import type { Node, NodeProps } from '@xyflow/react'
import { Handle, NodeResizer, Position, useReactFlow } from '@xyflow/react'
import TextareaAutosize from 'react-textarea-autosize'
import { useFlowDiagramContext } from '../context/flow-diagram-context'
import { useComponentField } from '../hooks/use-component-field'
import { NodeDataGenerator } from './types/node.types'

export type GroupNodeData = NodeDataGenerator<{
  backgroundColor?: string
  borderColor?: string
  childNodes?: string[]
}>

export type TGroupNode = Node<GroupNodeData, 'group'>

const DEFAULT_GROUP_BACKGROUND = 'rgba(20, 25, 37, 0.35)'
const DEFAULT_GROUP_BORDER = '#828DA3'

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
  const { updateNodeData } = useReactFlow()
  const { isEdgeConnecting } = useFlowDiagramContext()
  const name = useComponentField<string>(data.componentFields, {
    componentFieldId: 'name',
  })

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
        isVisible={selected}
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
