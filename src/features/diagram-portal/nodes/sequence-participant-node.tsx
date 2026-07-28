import { buildMetaData } from '@uigraph/sdk'
import {
  Handle,
  Node,
  NodeProps,
  Position,
  useEdges,
  useNodes,
  useReactFlow,
} from '@xyflow/react'
import { Fragment, useMemo, useRef } from 'react'
import {
  DEFAULT_CONFIG,
  getRowY,
  rowHandleId,
} from '../helpers/sequence-diagram-layout'
import { useComponentField } from '../hooks/use-component-field'
import { NodeDataGenerator } from './types/node.types'

export type SequenceParticipantNodeData = NodeDataGenerator<{
  label: string
  rowCount?: number
  rowHeight?: number
  activations?: Array<{ startRow: number; endRow: number }>
  color?: string
}>

export type TSequenceParticipantNode = Node<
  SequenceParticipantNodeData,
  'sequenceParticipant'
>

const NODE_WIDTH = 10
const LIFELINE_WIDTH = 1
const ACTIVATION_WIDTH = 4
const ACTIVATION_PADDING_RATIO = 0.3
const INDICATOR_WIDTH = ACTIVATION_WIDTH

export function SequenceParticipantNode({
  id,
  data,
}: NodeProps<TSequenceParticipantNode>) {
  const { updateNodeData } = useReactFlow()
  const nodes = useNodes()
  const edges = useEdges()
  const inputRef = useRef<HTMLInputElement>(null)
  const config = {
    ...DEFAULT_CONFIG,
    rowHeight: data.rowHeight ?? DEFAULT_CONFIG.rowHeight,
  }
  const { rowCount: dataRowCount } = data
  const name = useComponentField<string>(data.componentFields, {
    componentFieldId: 'name',
  })
  const color = useComponentField<string>(data.componentFields, {
    componentFieldId: 'color',
  })
  const label = name ?? data.label ?? ''
  const indicatorColor = color ?? data.color ?? '#f59e0b'
  const lifelineX = NODE_WIDTH / 2

  const { activations, rowCount } = useMemo(() => {
    const connectedEdges = edges.filter(
      (e) => e.source === id || e.target === id
    )
    const messageNodeIds = new Set(
      connectedEdges
        .flatMap((e) => [e.source, e.target])
        .filter((nid) => nid.startsWith('message-'))
    )
    const selfY = nodes.find((n) => n.id === id)?.position.y ?? 0
    const centers = nodes
      .filter((n) => messageNodeIds.has(n.id))
      .map(
        (n) => n.position.y + (n.height ?? config.messageNodeHeight) / 2 - selfY
      )
      .sort((a, b) => a - b)
    const half = config.rowHeight * ACTIVATION_PADDING_RATIO
    const activations: Array<{ top: number; bottom: number }> = []
    centers.forEach((center) => {
      const last = activations[activations.length - 1]
      if (last && center - half <= last.bottom) {
        last.bottom = center + half
        return
      }
      activations.push({ top: center - half, bottom: center + half })
    })
    const maxRow =
      centers.length > 0
        ? Math.round(
            (centers[centers.length - 1] - config.headerHeight) /
              config.rowHeight
          )
        : 0
    const rowCount = centers.length > 0 ? maxRow + 2 : (dataRowCount ?? 1)
    return { activations, rowCount }
  }, [
    edges,
    nodes,
    id,
    config.headerHeight,
    config.rowHeight,
    config.messageNodeHeight,
    dataRowCount,
  ])

  const totalHeight = config.headerHeight + rowCount * config.rowHeight

  return (
    <div
      className="relative overflow-visible"
      style={{
        width: NODE_WIDTH,
        height: totalHeight,
      }}
    >
      <div
        className="absolute top-0 left-1/2 flex -translate-x-1/2 items-center gap-1.5"
        onDoubleClick={() => inputRef.current?.focus()}
      >
        <div
          className="h-5 rounded-full"
          style={{ width: INDICATOR_WIDTH, backgroundColor: indicatorColor }}
        />
        <input
          ref={inputRef}
          value={label}
          size={Math.max(label.length, 1)}
          className="text-foreground border-none bg-transparent text-sm font-medium outline-none"
          onChange={(e) => {
            updateNodeData(id, {
              componentFields: buildMetaData(data.componentFields ?? [], {
                name: e.target.value,
              }),
            })
          }}
        />
      </div>
      <svg
        className="text-muted-foreground/40 pointer-events-none absolute top-0 left-0 overflow-visible"
        width={NODE_WIDTH}
        height={totalHeight}
      >
        <line
          x1={lifelineX}
          y1={config.headerHeight}
          x2={lifelineX}
          y2={totalHeight}
          stroke="currentColor"
          strokeWidth={LIFELINE_WIDTH}
        />
        {activations.map((act) => (
          <rect
            key={act.top}
            x={lifelineX - ACTIVATION_WIDTH / 2}
            y={act.top}
            width={ACTIVATION_WIDTH}
            height={act.bottom - act.top}
            fill={indicatorColor}
            rx={ACTIVATION_WIDTH / 2}
          />
        ))}
      </svg>
      {Array.from({ length: rowCount }, (_, i) => {
        // Same coordinate frame as the SVG lifeline/activation rect above
        // (both live in this component's own 0..totalHeight box) — no
        // headerHeight subtraction here, or handles end up offset from the
        // message boxes and activation bar they're meant to connect to.
        const top = getRowY(i, config)
        const handleClass = '!w-1 !h-1 !opacity-0 !border-0 !bg-transparent'
        return (
          <Fragment key={i}>
            <Handle
              id={rowHandleId(i, 'left', 'target')}
              type="target"
              position={Position.Left}
              className={handleClass}
              style={{ top }}
            />
            <Handle
              id={rowHandleId(i, 'left', 'source')}
              type="source"
              position={Position.Left}
              className={handleClass}
              style={{ top }}
            />
            <Handle
              id={rowHandleId(i, 'right', 'target')}
              type="target"
              position={Position.Right}
              className={handleClass}
              style={{ top }}
            />
            <Handle
              id={rowHandleId(i, 'right', 'source')}
              type="source"
              position={Position.Right}
              className={handleClass}
              style={{ top }}
            />
          </Fragment>
        )
      })}
    </div>
  )
}
