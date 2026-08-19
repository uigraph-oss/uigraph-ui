import { cn } from '@/lib/utils'
import { buildMetaData, C4ElementKind } from '@uigraph/sdk'
import { Node, NodeProps, NodeResizer, useReactFlow } from '@xyflow/react'
import { useEffectState } from 'daily-code/react'
import { useLayoutEffect, useRef } from 'react'
import { LuExternalLink } from 'react-icons/lu'
import TextareaAutosize from 'react-textarea-autosize'
import { useFlowDiagramContext } from '../context/flow-diagram-context'
import { useComponentField } from '../hooks/use-component-field'
import {
  C4_SHAPE_INSETS,
  C4_SHAPES,
  C4PersonShape,
  C4Shape,
  PERSON_GAP_RATIO,
  PERSON_HEAD_RATIO,
} from './components/c4-shapes'
import { NodeContainer } from './components/node-card'
import { NodeDataGenerator } from './types/node.types'

export type C4NodeData = NodeDataGenerator<{
  c4Kind: C4ElementKind
  c4Shape?: C4Shape
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
const MIN_HEIGHT = 60
const HEIGHT_TOLERANCE = 1

export function C4Node({
  id,
  data,
  width,
  height,
  selected,
}: NodeProps<TC4Node>) {
  const { updateNodeData, updateNode } = useReactFlow()
  const { setNodes } = useFlowDiagramContext()

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

  const descriptionTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const [localDescription, setLocalDescription] = useEffectState(
    data.description ?? ''
  )

  function updateDescription(value: string) {
    setLocalDescription(value)

    if (descriptionTimeoutRef.current) {
      clearTimeout(descriptionTimeoutRef.current)
    }

    descriptionTimeoutRef.current = setTimeout(() => {
      updateNodeData(id, { description: value })
    }, 1000)
  }

  /** c4model.com draws elements as outlines, so the palette colour is the accent. */
  const accent = data.fill ?? DEFAULT_FILL
  const fontColor = data.fontColor ?? accent
  const shape: C4Shape = data.c4Shape ?? 'default'
  const isPerson = data.c4Kind === 'person'
  const ShapeComponent = C4_SHAPES[shape] ?? C4_SHAPES.default

  const kindLabel = C4_META_LABELS[data.c4Kind ?? 'system']
  const meta = data.technology ? `${kindLabel}: ${data.technology}` : kindLabel

  const contentRef = useRef<HTMLDivElement>(null)

  /**
   * The text block is `min-h-full`, so it overflows the node before it is
   * measured. Growing only — and never writing a height the node already has —
   * is what keeps this from feeding itself. The height goes through the
   * context, because the store holds LOD/collapse-derived nodes.
   */
  useLayoutEffect(() => {
    const content = contentRef.current
    if (!content) return

    const needed = Math.max(Math.ceil(content.scrollHeight), MIN_HEIGHT)
    if (needed <= (height ?? 0) + HEIGHT_TOLERANCE) return

    setNodes((prev) =>
      prev.map((node) => (node.id === id ? { ...node, height: needed } : node))
    )
  }, [
    id,
    width,
    height,
    shape,
    isPerson,
    localName,
    meta,
    localDescription,
    setNodes,
  ])

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
        minHeight={MIN_HEIGHT}
        isVisible={selected}
        onResize={(_, params) => {
          updateNode(id, { width: params.width, height: params.height })
        }}
      />

      {isPerson && <C4PersonShape color={accent} />}

      {!isPerson && <ShapeComponent color={accent} />}

      <div
        ref={contentRef}
        className={cn(
          'relative flex min-h-full w-full flex-col items-center justify-center gap-0.5 text-center',
          isPerson ? 'px-4 pb-4' : C4_SHAPE_INSETS[shape]
        )}
        style={{
          color: fontColor,
          paddingTop: isPerson
            ? `${(PERSON_HEAD_RATIO + PERSON_GAP_RATIO) * 100 + 8}%`
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
            'w-full cursor-grab resize-none bg-transparent text-center text-sm leading-5 font-bold outline-none',
            selected && 'cursor-text active:cursor-grabbing'
          )}
          style={{ color: fontColor }}
        />

        <span className="text-[0.625rem] leading-tight opacity-90">
          [{meta}]
        </span>

        <TextareaAutosize
          value={localDescription}
          placeholder="Description"
          onKeyDown={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          onChange={(e) => updateDescription(e.currentTarget.value)}
          className={cn(
            'w-full cursor-grab resize-none bg-transparent text-center text-[0.6875rem] leading-4 opacity-90 outline-none',
            selected && 'cursor-text active:cursor-grabbing'
          )}
          style={{ color: fontColor }}
        />
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
