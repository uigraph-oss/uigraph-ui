import { cn } from '@/lib/utils'
import { Handle, Position } from '@xyflow/react'
import { useFlowDiagramContext } from '../../context/flow-diagram-context'

const HANDLES = [
  { position: Position.Top, offset: '!-top-2' },
  { position: Position.Bottom, offset: '!-bottom-2' },
  { position: Position.Left, offset: '!-left-2' },
  { position: Position.Right, offset: '!-right-2' },
] as const

export function FrameHandles() {
  const { isEdgeConnecting } = useFlowDiagramContext()

  return HANDLES.flatMap(({ position, offset }) =>
    (['target', 'source'] as const).map((type) => (
      <Handle
        key={`${type}-${position}`}
        id={`${type}-${position}`}
        type={type}
        position={position}
        className={cn(offset, isEdgeConnecting && 'connection-enabled')}
        style={{ zIndex: 10, pointerEvents: 'auto' }}
      />
    ))
  )
}
