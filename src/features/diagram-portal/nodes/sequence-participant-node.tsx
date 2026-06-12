import { Handle, Node, NodeProps, Position, useReactFlow } from '@xyflow/react'
import { Fragment, useMemo } from 'react'
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
  activations?: Array<{ startRow: number; endRow: number }>
  color?: string
}>

export type TSequenceParticipantNode = Node<
  SequenceParticipantNodeData,
  'sequenceParticipant'
>

const NODE_WIDTH = 10
const LIFELINE_STROKE = '#e5e7eb'
const LIFELINE_WIDTH = 1
const ACTIVATION_WIDTH = 2
const ACTIVATION_STROKE = '#d1d5db'
const INDICATOR_WIDTH = 3

export function SequenceParticipantNode({
  id,
  data,
}: NodeProps<TSequenceParticipantNode>) {
  const { getNodes, getEdges } = useReactFlow()
  const config = DEFAULT_CONFIG
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
    const edges = getEdges()
    const connectedEdges = edges.filter(
      (e) => e.source === id || e.target === id
    )
    const messageNodeIds = new Set(
      connectedEdges
        .flatMap((e) => [e.source, e.target])
        .filter((nid) => nid.startsWith('message-'))
    )
    const nodes = getNodes()
    const messageYs = nodes
      .filter((n) => messageNodeIds.has(n.id))
      .map((n) => n.position.y + (n.height ?? 36) / 2)
    const rowIndices = messageYs.map((y) =>
      Math.round((y - config.headerHeight) / config.rowHeight)
    )
    const minRow = rowIndices.length > 0 ? Math.min(...rowIndices) : 0
    const maxRow = rowIndices.length > 0 ? Math.max(...rowIndices) : 0
    const activations =
      rowIndices.length > 0 ? [{ startRow: minRow, endRow: maxRow }] : []
    const rowCount = rowIndices.length > 0 ? maxRow + 2 : (dataRowCount ?? 1)
    return { activations, rowCount }
  }, [
    getEdges,
    getNodes,
    id,
    config.headerHeight,
    config.rowHeight,
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
      <div className="absolute top-0 left-1/2 flex -translate-x-1/2 items-center gap-1.5">
        <div
          className="h-5 rounded-sm"
          style={{ width: INDICATOR_WIDTH, backgroundColor: indicatorColor }}
        />
        <span className="text-sm font-medium whitespace-nowrap">{label}</span>
      </div>
      <svg
        className="pointer-events-none absolute top-0 left-0 overflow-visible"
        width={NODE_WIDTH}
        height={totalHeight}
      >
        <line
          x1={lifelineX}
          y1={config.headerHeight}
          x2={lifelineX}
          y2={totalHeight}
          stroke={LIFELINE_STROKE}
          strokeWidth={LIFELINE_WIDTH}
          strokeDasharray="4 4"
        />
        {activations.map((act, i) => {
          const top =
            config.headerHeight +
            act.startRow * config.rowHeight +
            config.rowHeight / 2
          const height = (act.endRow - act.startRow + 1) * config.rowHeight
          return (
            <rect
              key={i}
              x={lifelineX - ACTIVATION_WIDTH / 2}
              y={top}
              width={ACTIVATION_WIDTH}
              height={height}
              fill={ACTIVATION_STROKE}
              rx={1}
            />
          )
        })}
      </svg>
      {Array.from({ length: rowCount }, (_, i) => {
        const top = getRowY(i, config) - config.headerHeight
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
