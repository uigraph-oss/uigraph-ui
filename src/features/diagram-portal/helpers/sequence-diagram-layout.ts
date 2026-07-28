import { SEQUENCE_LAYOUT } from '@uigraph/sdk'

export type SequenceConfig = {
  columnWidth: number
  rowHeight: number
  headerHeight: number
  messageNodeWidth: number
  messageNodeHeight: number
  selfLoopOffset: number
}

export const DEFAULT_CONFIG: SequenceConfig = {
  columnWidth: SEQUENCE_LAYOUT.COLUMN_WIDTH,
  rowHeight: SEQUENCE_LAYOUT.ROW_HEIGHT,
  headerHeight: SEQUENCE_LAYOUT.HEADER_HEIGHT,
  messageNodeWidth: SEQUENCE_LAYOUT.MESSAGE_NODE_WIDTH,
  messageNodeHeight: SEQUENCE_LAYOUT.MESSAGE_NODE_HEIGHT,
  selfLoopOffset: SEQUENCE_LAYOUT.SELF_LOOP_OFFSET,
}

export function getParticipantX(
  index: number,
  config = DEFAULT_CONFIG
): number {
  return index * config.columnWidth + config.columnWidth / 2
}

export function getRowY(rowIndex: number, config = DEFAULT_CONFIG): number {
  return (
    config.headerHeight + rowIndex * config.rowHeight + config.rowHeight / 2
  )
}

export function getLifelineHeight(
  rowCount: number,
  config = DEFAULT_CONFIG
): number {
  return rowCount * config.rowHeight
}

export function rowHandleId(
  rowIndex: number,
  side: 'left' | 'right',
  handleType: 'source' | 'target'
): string {
  return `row-${rowIndex}-${side}-${handleType}`
}
