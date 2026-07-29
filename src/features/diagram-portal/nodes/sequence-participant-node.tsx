import {
  buildMetaData,
  flattenMetaData,
  SEQUENCE_PARTICIPANT_COLOR,
} from '@uigraph/sdk'
import { Handle, Node, NodeProps, Position, useReactFlow } from '@xyflow/react'
import { Fragment, useRef } from 'react'
import TextareaAutosize from 'react-textarea-autosize'
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
  rowYs?: number[]
  lifelineHeight?: number
  lifelineStartRow?: number
  lifelineEndRow?: number
  activations?: Array<{ startRow: number; endRow: number }>
  style?: {
    baseColor?: string
  }
  titleFontSize?: number
}>

export type TSequenceParticipantNode = Node<
  SequenceParticipantNodeData,
  'sequenceParticipant'
>

export const DEFAULT_TITLE_FONT_SIZE = 18

const NODE_WIDTH = 10
const TITLE_WIDTH_INSET = 16
const LIFELINE_WIDTH = 1
const ACTIVATION_WIDTH = 4
const ACTIVATION_PADDING_RATIO = 0.3
const LIFELINE_OPACITY = 0.75

export function SequenceParticipantNode({
  id,
  data,
}: NodeProps<TSequenceParticipantNode>) {
  const { updateNodeData } = useReactFlow()
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const config = {
    ...DEFAULT_CONFIG,
    rowHeight: data.rowHeight ?? DEFAULT_CONFIG.rowHeight,
  }
  const { rowCount: dataRowCount } = data
  const name = useComponentField<string>(data.componentFields, {
    componentFieldId: 'name',
  })
  const label = name ?? data.label ?? ''
  const indicatorColor = data.style?.baseColor ?? SEQUENCE_PARTICIPANT_COLOR
  const titleFontSize = data.titleFontSize ?? DEFAULT_TITLE_FONT_SIZE
  const lifelineX = NODE_WIDTH / 2

  const explicitRowYs = data.rowYs
  const explicitActivations = data.activations

  const activationPadding = config.rowHeight * ACTIVATION_PADDING_RATIO
  const activations = (explicitActivations ?? []).map((activation) => ({
    top:
      (explicitRowYs?.[activation.startRow] ??
        getRowY(activation.startRow, config)) - activationPadding,
    bottom:
      (explicitRowYs?.[activation.endRow] ??
        getRowY(activation.endRow, config)) + activationPadding,
  }))

  const rowCount = explicitRowYs?.length ?? dataRowCount ?? 1

  const totalHeight =
    data.lifelineHeight ?? config.headerHeight + rowCount * config.rowHeight

  const lifelineTop =
    data.lifelineStartRow !== undefined && explicitRowYs
      ? (explicitRowYs[data.lifelineStartRow] ?? config.headerHeight) -
        config.rowHeight / 2
      : config.headerHeight
  const lifelineBottom =
    data.lifelineEndRow !== undefined && explicitRowYs
      ? (explicitRowYs[data.lifelineEndRow] ?? totalHeight) +
        config.rowHeight / 2
      : totalHeight

  return (
    <div
      className="relative overflow-visible"
      style={{
        width: NODE_WIDTH,
        height: totalHeight,
      }}
    >
      <div
        className="absolute top-0 left-1/2 -ml-0.5 flex items-end gap-1.5 pb-2"
        style={{ height: config.headerHeight, fontSize: titleFontSize }}
        onDoubleClick={() => inputRef.current?.focus()}
      >
        <div
          className="h-[1.2em] w-1 rounded-full"
          style={{ backgroundColor: indicatorColor }}
        />
        <TextareaAutosize
          ref={inputRef}
          value={label}
          rows={1}
          onKeyDown={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          style={{ width: config.columnWidth - TITLE_WIDTH_INSET }}
          className="text-foreground block resize-none overflow-hidden border-none bg-transparent p-0 text-[1em] leading-[1] font-medium break-words outline-none"
          onChange={(e) => {
            const fields = data.componentFields ?? []
            updateNodeData(id, {
              componentFields: buildMetaData(fields, {
                ...flattenMetaData(fields, fields),
                name: e.currentTarget.value,
              }),
            })
          }}
        />
      </div>
      <svg
        className="pointer-events-none absolute top-0 left-0 overflow-visible"
        width={NODE_WIDTH}
        height={totalHeight}
      >
        <line
          x1={lifelineX}
          y1={lifelineTop}
          x2={lifelineX}
          y2={lifelineBottom}
          stroke={indicatorColor}
          strokeOpacity={LIFELINE_OPACITY}
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
            fillOpacity={LIFELINE_OPACITY}
            rx={ACTIVATION_WIDTH / 2}
          />
        ))}
      </svg>
      {Array.from({ length: rowCount }, (_, i) => {
        const top = explicitRowYs?.[i] ?? getRowY(i, config)
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
