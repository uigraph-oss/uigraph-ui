import { CodeMirrorRaw } from '@/components/code-mirror'
import { css } from '@/utils/raw'
import { buildMetaData } from '@uigraph/sdk'
import { Node, NodeProps, NodeResizer, useReactFlow } from '@xyflow/react'
import { useEffectState } from 'daily-code/react'
import { useRef } from 'react'
import { StrokeFakeAnimation } from '../components/stroke-fake-animation'
import { useComponentField } from '../hooks/use-component-field'
import { NodeCard } from './components/node-card'
import { NodeDataGenerator } from './types/node.types'

export type CodeNodeData = NodeDataGenerator<{
  stroke?: string
  strokeWidth?: number
  strokeStyle?: 'solid' | 'dashed' | 'dotted'
  borderAnimationEnabled?: boolean
  borderRadius?: number
  fontSize?: number
  lineHeight?: number
}>

export type TCodeNode = Node<CodeNodeData, 'code'>

export function CodeNode({ id, data, selected }: NodeProps<TCodeNode>) {
  const { updateNodeData, updateNode } = useReactFlow()
  const code = useComponentField<string>(data.componentFields, {
    componentFieldId: 'code',
  })

  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const [localValue, setLocalValue] = useEffectState(code ?? '')

  function updateValue(value: string) {
    setLocalValue(value)

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = setTimeout(() => {
      updateNodeData(id, {
        componentFields: buildMetaData(data.componentFields ?? [], {
          code: value,
        }),
      })
    }, 1000)
  }

  return (
    <NodeCard
      className="relative isolate w-full rounded-[0.5rem] bg-transparent leading-0 outline-transparent"
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

      <CodeMirrorRaw
        id={`code-mirror-${id}`}
        value={localValue}
        onChange={updateValue}
        fontSize={data?.fontSize || 14}
        lineHeight={data?.lineHeight || 2}
        className="overflow-hidden rounded-[0.5rem]"
        style={{
          fontSize: data?.fontSize || 14,
          lineHeight: data?.lineHeight || 2,
          borderRadius: data?.borderRadius || 0,
        }}
      />

      <style
        dangerouslySetInnerHTML={{
          __html: css`
            #code-mirror-${id} .cm-editor {
              padding: ${data.strokeWidth}px;
            }
          `,
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
    </NodeCard>
  )
}
