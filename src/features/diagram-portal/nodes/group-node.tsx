import { buildMetaData } from '@uigraph/sdk'
import type { Node, NodeProps } from '@xyflow/react'
import { NodeResizer, useReactFlow } from '@xyflow/react'
import TextareaAutosize from 'react-textarea-autosize'
import { useComponentField } from '../hooks/use-component-field'
import { useFrameAutoLayout } from '../hooks/use-frame-auto-layout'
import { FrameCollapseButton } from './components/frame-collapse-button'
import { FrameHandles } from './components/frame-handles'
import { NodeDataGenerator } from './types/node.types'

export type GroupNodeData = NodeDataGenerator<{
  backgroundColor?: string
  borderColor?: string
  childNodes?: string[]
  autoLayout?: boolean
  collapsed?: boolean
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
  const name = useComponentField<string>(data.componentFields, {
    componentFieldId: 'name',
  })

  const autoLayout = data.autoLayout ?? false
  const collapsed = data.collapsed ?? false

  useFrameAutoLayout(id, autoLayout && !collapsed, 'top')

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
        isVisible={selected && !autoLayout && !collapsed}
        minWidth={200}
        minHeight={150}
        keepAspectRatio={false}
      />

      <FrameHandles />

      {(selected || collapsed) && (
        <FrameCollapseButton
          id={id}
          collapsed={collapsed}
          color={frameStyles.borderColor}
        />
      )}

      {collapsed && (
        <div className="flex size-full items-center justify-center px-8 text-center text-sm font-medium wrap-anywhere text-[#F4F7FC]">
          {name || 'Frame'}
        </div>
      )}

      <TextareaAutosize
        value={name ?? ''}
        placeholder=""
        hidden={collapsed}
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
