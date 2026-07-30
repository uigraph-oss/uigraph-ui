import { cn } from '@/lib/utils'
import { buildMetaData, C4ElementKind, C4ElementShape } from '@uigraph/sdk'
import { Node, NodeProps, NodeResizer, useReactFlow } from '@xyflow/react'
import { useEffectState } from 'daily-code/react'
import { useRef } from 'react'
import { LuExternalLink } from 'react-icons/lu'
import TextareaAutosize from 'react-textarea-autosize'
import { useComponentField } from '../hooks/use-component-field'
import { NodeContainer } from './components/node-card'
import { NodeDataGenerator } from './types/node.types'

export type C4NodeData = NodeDataGenerator<{
  c4Kind: C4ElementKind
  c4Shape?: C4ElementShape
  isExternal?: boolean
  technology?: string
  description?: string
  fill?: string
  stroke?: string
  fontColor?: string
  /** Drill-down target opened in a new tab from the node badge. */
  subDiagramId?: string
}>

export type TC4Node = Node<C4NodeData, 'c4'>

export const C4_KIND_LABELS: Record<C4ElementKind, string> = {
  person: 'Person',
  system: 'System',
  container: 'Container',
  component: 'Component',
  node: 'Node',
}

const DEFAULT_FILL = '#1168BD'
const DEFAULT_STROKE = '#0B4884'
const CYLINDER_LIP = 14
const QUEUE_CAP = 16

export function C4Node({ id, data, selected }: NodeProps<TC4Node>) {
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

  const fill = data.fill ?? DEFAULT_FILL
  const stroke = data.stroke ?? DEFAULT_STROKE
  const fontColor = data.fontColor ?? '#FFFFFF'
  const shape = data.c4Shape ?? 'default'
  const isPerson = data.c4Kind === 'person'

  const shapeSuffix = shape === 'db' ? '_db' : shape === 'queue' ? '_queue' : ''
  const stereotype = `${data.isExternal ? 'external_' : ''}${data.c4Kind ?? 'system'}${shapeSuffix}`

  return (
    <NodeContainer
      selected={!!selected}
      className={cn(
        'relative size-full rounded-[0.25rem]',
        selected && 'outline-primary outline'
      )}
    >
      <NodeResizer
        minWidth={140}
        minHeight={60}
        isVisible={selected}
        onResize={(_, params) => {
          updateNode(id, { width: params.width, height: params.height })
        }}
      />

      {shape === 'default' && (
        <div
          className="absolute inset-0 rounded-[0.25rem]"
          style={{ backgroundColor: fill, border: `1px solid ${stroke}` }}
        />
      )}

      {shape === 'db' && (
        <svg
          className="absolute inset-0 size-full"
          preserveAspectRatio="none"
          viewBox="0 0 100 100"
        >
          <path
            d={`M0,${CYLINDER_LIP} A50,${CYLINDER_LIP} 0 0 1 100,${CYLINDER_LIP} L100,${100 - CYLINDER_LIP} A50,${CYLINDER_LIP} 0 0 1 0,${100 - CYLINDER_LIP} Z`}
            fill={fill}
            stroke={stroke}
            vectorEffect="non-scaling-stroke"
          />
          <path
            d={`M0,${CYLINDER_LIP} A50,${CYLINDER_LIP} 0 0 0 100,${CYLINDER_LIP}`}
            fill="none"
            stroke={stroke}
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      )}

      {shape === 'queue' && (
        <svg
          className="absolute inset-0 size-full"
          preserveAspectRatio="none"
          viewBox="0 0 100 100"
        >
          <path
            d={`M${QUEUE_CAP},0 L${100 - QUEUE_CAP},0 A${QUEUE_CAP},50 0 0 1 ${100 - QUEUE_CAP},100 L${QUEUE_CAP},100 A${QUEUE_CAP},50 0 0 1 ${QUEUE_CAP},0 Z`}
            fill={fill}
            stroke={stroke}
            vectorEffect="non-scaling-stroke"
          />
          <path
            d={`M${100 - QUEUE_CAP},0 A${QUEUE_CAP},50 0 0 0 ${100 - QUEUE_CAP},100`}
            fill="none"
            stroke={stroke}
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      )}

      <div
        className={cn(
          'relative flex size-full flex-col items-center justify-center gap-0.5 text-center',
          shape === 'queue' ? 'px-10 py-3' : 'px-4 py-3',
          shape === 'db' && 'py-6'
        )}
        style={{ color: fontColor }}
      >
        {isPerson && (
          <svg viewBox="0 0 24 24" className="size-6 shrink-0" fill={fontColor}>
            <circle cx="12" cy="7" r="4" />
            <path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8z" />
          </svg>
        )}

        <span className="text-[0.625rem] leading-tight italic opacity-80">
          &laquo;{stereotype}&raquo;
        </span>

        <TextareaAutosize
          value={localName}
          placeholder="Name"
          onKeyDown={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          onChange={(e) => updateName(e.currentTarget.value)}
          className={cn(
            'w-full cursor-grab resize-none bg-transparent text-center text-sm font-bold outline-none',
            selected && 'cursor-text active:cursor-grabbing'
          )}
          style={{ color: fontColor }}
        />

        {data.technology && (
          <span className="text-[0.625rem] leading-tight opacity-90">
            [{data.technology}]
          </span>
        )}

        {data.description && (
          <span className="text-[0.6875rem] leading-snug opacity-90">
            {data.description}
          </span>
        )}
      </div>

      {data.subDiagramId && (
        <button
          type="button"
          title="Open sub diagram in a new tab"
          className="absolute top-1.5 right-1.5 rounded-sm bg-black/30 p-1 text-white/90 transition-colors hover:bg-black/50"
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation()
            window.open(`/diagram/${data.subDiagramId}`, '_blank')
          }}
        >
          <LuExternalLink className="size-3" />
        </button>
      )}
    </NodeContainer>
  )
}
