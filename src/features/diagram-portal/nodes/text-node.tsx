import { cn } from '@/lib/utils'
import { buildMetaData } from '@uigraph/sdk'
import { Node, NodeProps, NodeResizer, useReactFlow } from '@xyflow/react'
import { useEffectState } from 'daily-code/react'
import { useRef } from 'react'
import TextareaAutosize from 'react-textarea-autosize'
import { StrokeFakeAnimation } from '../components/stroke-fake-animation'
import { useComponentField } from '../hooks/use-component-field'
import { NodeCard } from './components/node-card'
import { NodeDataGenerator } from './types/node.types'

export type TextNodeData = NodeDataGenerator<{
  fill?: string
  stroke?: string
  strokeWidth?: number
  strokeStyle?: 'solid' | 'dashed' | 'dotted'
  borderAnimationEnabled?: boolean
  borderRadius?: number
  fontSize?: number
  fontWeight?: number
  color?: string
  fontFamily?: string
  lineHeight?: number
}>

export type TTextNode = Node<TextNodeData, 'text'>

export function TextNode({ id, data, selected }: NodeProps<TTextNode>) {
  const { updateNodeData, updateNode } = useReactFlow()
  const text = useComponentField<string>(data.componentFields, {
    componentFieldId: 'text',
  })

  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const [localValue, setLocalValue] = useEffectState(text ?? '')

  function updateValue(value: string) {
    setLocalValue(value)

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = setTimeout(() => {
      updateNodeData(id, {
        componentFields: buildMetaData(data.componentFields ?? [], {
          text: value,
        }),
      })
    }, 1000)
  }

  return (
    <NodeCard
      className="relative isolate w-full rounded-[0.5rem] bg-transparent leading-0 outline-transparent"
      style={{ borderRadius: data?.borderRadius || 8 }}
      selected={selected}
      onWheel={(e) => {
        e.stopPropagation()
        e.nativeEvent.stopImmediatePropagation()
      }}
    >
      <NodeResizer
        isVisible={selected}
        handleClassName="z-10"
        onResize={(a, b) => {
          updateNode(id, { width: b.width, height: b.height })
        }}
      />

      <StrokeFakeAnimation
        className="pointer-events-none absolute inset-0 size-full"
        borderColor={data?.stroke}
        borderWidth={data?.strokeWidth}
        borderStyle={data?.strokeStyle}
        borderRadius={data?.borderRadius}
        borderAnimationEnabled={data?.borderAnimationEnabled}
      />

      <TextareaAutosize
        value={localValue}
        placeholder="Add text"
        onKeyDown={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        onChange={(e) => updateValue(e.currentTarget.value)}
        className={cn(
          'h-auto w-auto max-w-full cursor-grab resize-none bg-transparent px-3 py-2 outline-none',
          selected && 'cursor-text active:cursor-grabbing'
        )}
        style={{
          borderStyle: 'solid',
          borderColor: 'transparent',
          borderWidth: data?.strokeWidth,
          borderRadius: data?.borderRadius,
          fontSize: data?.fontSize || 14,
          fontWeight: data?.fontWeight || 400,
          lineHeight: data?.lineHeight || 1.5,
          fontFamily: data?.fontFamily || 'inherit',
          backgroundColor: data?.fill || 'transparent',
          color: data?.color || 'var(--foreground)',
        }}
        onWheel={(e) => {
          e.stopPropagation()
          e.nativeEvent.stopImmediatePropagation()
        }}
      />
    </NodeCard>
  )
}
