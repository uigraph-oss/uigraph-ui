import { buildMetaData, C4BoundaryKind } from '@uigraph/sdk'
import { Node, NodeProps, NodeResizer, useReactFlow } from '@xyflow/react'
import { useEffectState } from 'daily-code/react'
import { useRef } from 'react'
import TextareaAutosize from 'react-textarea-autosize'
import { useComponentField } from '../hooks/use-component-field'
import { NodeDataGenerator } from './types/node.types'

export type C4BoundaryNodeData = NodeDataGenerator<{
  c4BoundaryKind: C4BoundaryKind
  boundaryType?: string
  description?: string
  backgroundColor?: string
  borderColor?: string
  fontColor?: string
}>

export type TC4BoundaryNode = Node<C4BoundaryNodeData, 'c4Boundary'>

const BOUNDARY_KIND_LABELS: Record<C4BoundaryKind, string> = {
  enterprise: 'ENTERPRISE',
  system: 'SYSTEM',
  container: 'CONTAINER',
  generic: 'BOUNDARY',
  node: 'NODE',
}

const DEFAULT_BACKGROUND = 'rgba(130, 141, 163, 0.06)'
const DEFAULT_BORDER = '#828DA3'

export function C4BoundaryNode({
  id,
  data,
  selected,
}: NodeProps<TC4BoundaryNode>) {
  const { updateNodeData, updateNode } = useReactFlow()

  const name = useComponentField<string>(data.componentFields, {
    componentFieldId: 'name',
  })

  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const [localName, setLocalName] = useEffectState(name ?? '')

  function updateName(value: string) {
    setLocalName(value)

    if (timeoutRef.current) clearTimeout(timeoutRef.current)

    timeoutRef.current = setTimeout(() => {
      updateNodeData(id, {
        componentFields: buildMetaData(data.componentFields ?? [], {
          name: value,
        }),
      })
    }, 1000)
  }

  const borderColor = data.borderColor ?? DEFAULT_BORDER
  const typeLabel =
    data.boundaryType ?? BOUNDARY_KIND_LABELS[data.c4BoundaryKind] ?? 'Boundary'

  return (
    <div
      className="size-full rounded-[0.25rem]"
      style={{
        backgroundColor: data.backgroundColor ?? DEFAULT_BACKGROUND,
        border: `1px dashed ${borderColor}`,
      }}
    >
      <NodeResizer
        minWidth={200}
        minHeight={140}
        isVisible={selected}
        onResize={(_, params) => {
          updateNode(id, { width: params.width, height: params.height })
        }}
      />

      <div className="flex flex-col items-center gap-0.5 px-3 pt-2">
        <TextareaAutosize
          value={localName}
          placeholder="Boundary"
          onKeyDown={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          onChange={(e) => updateName(e.currentTarget.value)}
          className="w-full cursor-text resize-none bg-transparent text-center text-sm font-bold outline-none"
          style={{ color: data.fontColor ?? borderColor }}
        />

        <span
          className="text-[0.625rem] leading-tight"
          style={{ color: data.fontColor ?? borderColor }}
        >
          [{typeLabel}]
        </span>

        {data.description && (
          <span
            className="max-w-full text-center text-[0.625rem] leading-tight whitespace-pre-line opacity-80"
            style={{ color: data.fontColor ?? borderColor }}
          >
            {data.description}
          </span>
        )}
      </div>
    </div>
  )
}
