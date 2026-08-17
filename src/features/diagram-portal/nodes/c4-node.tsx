import { cn } from '@/lib/utils'
import { buildMetaData, C4ElementKind, C4ElementShape } from '@uigraph/sdk'
import { Node, NodeProps, NodeResizer, useReactFlow } from '@xyflow/react'
import { useEffectState } from 'daily-code/react'
import { useRef } from 'react'
import { LuExternalLink } from 'react-icons/lu'
import TextareaAutosize from 'react-textarea-autosize'
import { useComponentField } from '../hooks/use-component-field'
import {
  C4BoxShape,
  C4CylinderShape,
  C4PersonShape,
  C4QueueShape,
  PERSON_BODY_TOP_RATIO,
  PERSON_HEAD_RATIO,
} from './components/c4-shapes'
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

/** The wording c4model.com uses inside a node's `[…]` meta line. */
const C4_META_LABELS: Record<C4ElementKind, string> = {
  person: 'Person',
  system: 'Software System',
  container: 'Container',
  component: 'Component',
  node: 'Deployment Node',
}

const DEFAULT_FILL = '#1168BD'
const DEFAULT_STROKE = '#0B4884'

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

  const kindLabel = C4_META_LABELS[data.c4Kind ?? 'system']
  const meta = data.technology ? `${kindLabel}: ${data.technology}` : kindLabel

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

      {isPerson && <C4PersonShape fill={fill} stroke={stroke} />}

      {!isPerson && shape === 'default' && (
        <C4BoxShape fill={fill} stroke={stroke} />
      )}

      {!isPerson && shape === 'db' && (
        <C4CylinderShape fill={fill} stroke={stroke} />
      )}

      {!isPerson && shape === 'queue' && (
        <C4QueueShape fill={fill} stroke={stroke} />
      )}

      <div
        className={cn(
          'relative flex size-full flex-col items-center justify-center gap-0.5 text-center',
          !isPerson && shape === 'queue' ? 'px-10 py-3' : 'px-4 py-3',
          !isPerson && shape === 'db' && 'py-6'
        )}
        style={{
          color: fontColor,
          paddingTop: isPerson
            ? `${(PERSON_HEAD_RATIO + PERSON_BODY_TOP_RATIO) * 100}%`
            : undefined,
        }}
      >
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

        <span className="text-[0.625rem] leading-tight opacity-90">
          [{meta}]
        </span>

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
