import { buildMetaData, flattenMetaData } from '@uigraph/sdk'
import { Handle, Node, NodeProps, Position, useReactFlow } from '@xyflow/react'
import { Fragment, useRef } from 'react'
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
  /** Center Y of every row, when rows aren't a uniform grid (block frames). */
  rowYs?: number[]
  lifelineHeight?: number
  /** Row a `create participant` introduced this one at. */
  lifelineStartRow?: number
  /** Row a `destroy` removed it at. */
  lifelineEndRow?: number
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
const LIFELINE_OPACITY = 0.75
const INDICATOR_WIDTH = ACTIVATION_WIDTH

export function SequenceParticipantNode({
  id,
  data,
}: NodeProps<TSequenceParticipantNode>) {
  const { updateNodeData } = useReactFlow()
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
  // Hex typed into the color field used to be stored without its `#`, which is
  // not valid CSS — those saved values still have to render.
  const savedColor = color ?? data.color ?? '#f59e0b'
  const indicatorColor = /^[0-9a-f]{3,8}$/i.test(savedColor)
    ? `#${savedColor}`
    : savedColor
  const lifelineX = NODE_WIDTH / 2

  const explicitRowYs = data.rowYs
  const explicitActivations = data.activations

  // A bar means the participant is activated — `activate`/`deactivate` or the
  // `+`/`-` arrow shorthand — never merely that a message touches the lifeline
  // here. A diagram that never activates anyone draws no bars at all.
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

  // `create participant X` / `destroy X` clip the lifeline to the rows the
  // participant actually exists for, instead of the full diagram height.
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
            const fields = data.componentFields ?? []
            // buildMetaData rewrites every field from the map it's given, so
            // the other fields' current values have to be carried over or
            // renaming blanks them (the participant's color).
            updateNodeData(id, {
              componentFields: buildMetaData(fields, {
                ...flattenMetaData(fields, fields),
                name: e.target.value,
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
        {/* The lifeline is the participant's own color, dimmed — a fixed grey
            reads as a separate element from the name indicator above it. */}
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
        // Same coordinate frame as the SVG lifeline/activation rect above
        // (both live in this component's own 0..totalHeight box) — no
        // headerHeight subtraction here, or handles end up offset from the
        // message boxes and activation bar they're meant to connect to.
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
