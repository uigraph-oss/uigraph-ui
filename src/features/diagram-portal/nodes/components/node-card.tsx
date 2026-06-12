import { cn } from '@/lib/utils'
import { Handle, Position } from '@xyflow/react'
import { ComponentProps } from 'react'
import { useFlowDiagramContext } from '../../context/flow-diagram-context'

type NodeCardProps = ComponentProps<'div'> & {
  selected: boolean
}

export function NodeCard({ className, ...props }: NodeCardProps) {
  return (
    <NodeContainer
      className={cn(
        'outline-stock rounded-[0.5rem] outline',
        '[.selected_&]:outline-primary [.selected_&]:shadow-[0_24px_40px_0_rgba(0,0,0,0.08)]',
        className
      )}
      {...props}
    />
  )
}

export function NodeContainer({ children, ...props }: NodeCardProps) {
  const { isEdgeConnecting } = useFlowDiagramContext()

  return (
    <div {...props}>
      {children}

      <>
        <Handle
          id="target-top"
          type="target"
          position={Position.Top}
          className={cn(isEdgeConnecting && 'connection-enabled')}
        />
        <Handle
          id="source-top"
          type="source"
          position={Position.Top}
          className={cn(isEdgeConnecting && 'connection-enabled')}
        />

        <Handle
          id="target-bottom"
          type="target"
          position={Position.Bottom}
          className={cn(isEdgeConnecting && 'connection-enabled')}
        />
        <Handle
          id="source-bottom"
          type="source"
          position={Position.Bottom}
          className={cn(isEdgeConnecting && 'connection-enabled')}
        />

        <Handle
          id="target-left"
          type="target"
          position={Position.Left}
          className={cn(isEdgeConnecting && 'connection-enabled')}
        />
        <Handle
          id="source-left"
          type="source"
          position={Position.Left}
          className={cn(isEdgeConnecting && 'connection-enabled')}
        />

        <Handle
          id="target-right"
          type="target"
          position={Position.Right}
          className={cn(isEdgeConnecting && 'connection-enabled')}
        />
        <Handle
          id="source-right"
          type="source"
          position={Position.Right}
          className={cn(isEdgeConnecting && 'connection-enabled')}
        />
      </>
    </div>
  )
}
