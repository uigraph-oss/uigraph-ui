export type SequenceConfig = {
  columnWidth: number
  rowHeight: number
  headerHeight: number
  messageNodeWidth: number
  messageNodeHeight: number
  selfLoopOffset: number
}

export const DEFAULT_CONFIG: SequenceConfig = {
  columnWidth: 200,
  rowHeight: 60,
  headerHeight: 40,
  messageNodeWidth: 140,
  messageNodeHeight: 32,
  selfLoopOffset: 80,
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
