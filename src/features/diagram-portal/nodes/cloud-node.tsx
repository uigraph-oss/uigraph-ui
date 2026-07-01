import { Node, NodeProps, NodeResizer } from '@xyflow/react'
import { StrokeFakeAnimation } from '../components/stroke-fake-animation'
import { useComponentField } from '../hooks/use-component-field'
import { NodeBuilderFields } from './components/node-builder-fields'
import { NodeCard } from './components/node-card'
import { NodeDataGenerator } from './types/node.types'

export type CloudNodeData = NodeDataGenerator<{
  cloud: string
  iconSrc: string
  category: string
  fill?: string
  stroke?: string
  strokeWidth?: number
  strokeStyle?: 'solid' | 'dashed' | 'dotted'
  borderRadius?: number
  borderAnimationEnabled?: boolean
}>

export type TCloudNode = Node<CloudNodeData, 'cloud'>

export function CloudNode({ data, selected, width }: NodeProps<TCloudNode>) {
  const name = useComponentField<string>(data.componentFields, {
    componentFieldId: 'name',
  })

  return (
    <NodeCard
      selected={selected}
      className="relative isolate size-full min-h-fit border border-[#2A3242] bg-[#141925]"
      style={{ borderRadius: data?.borderRadius || 8 }}
    >
      <NodeResizer
        minWidth={125}
        minHeight={125}
        isVisible={selected}
        keepAspectRatio={false}
      />

      <StrokeFakeAnimation
        className="pointer-events-none absolute inset-0 size-full"
        borderColor={data?.stroke}
        borderStyle={data?.strokeStyle}
        borderWidth={data?.strokeWidth}
        borderRadius={data?.borderRadius}
        borderAnimationEnabled={data?.borderAnimationEnabled}
      />

      <div
        className="flex h-full flex-col items-center justify-center gap-3 overflow-hidden p-4"
        style={{
          backgroundColor:
            data?.fill && data.fill !== 'transparent' ? data.fill : '#1E2533',
          borderRadius: data?.borderRadius,
        }}
      >
        {data.iconSrc && (
          <div className="flex min-h-0 w-full flex-1 items-center justify-center">
            <img
              alt={name ?? ''}
              src={data.iconSrc}
              className="size-full object-contain"
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.src = '/placeholder.svg'
              }}
            />
          </div>
        )}

        {name && (
          <p
            className="shrink-0 text-center text-sm leading-tight font-medium break-words text-[#F4F7FC]"
            style={{
              fontSize: Math.max(12, (width ?? 0) / 10),
            }}
          >
            {name}
          </p>
        )}
      </div>

      <NodeBuilderFields fields={data.componentFields} />
    </NodeCard>
  )
}
