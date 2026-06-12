import type { Node, NodeProps } from '@xyflow/react'
import { getFlowDiagramComponentIcon } from '../constants/flow-diagram-node'
import { NodeBuilderCore } from './components/node-builder'

export function DefaultNode({ data, selected }: NodeProps<Node>) {
  return (
    <NodeBuilderCore
      name={String(typeof data.name === 'string' ? data.name : '')}
      label={String(typeof data.label === 'string' ? data.label : '')}
      description={String(
        typeof data.description === 'string' ? data.description : ''
      )}
      icon={
        <div className="bg-stock flex items-center justify-center [&>svg]:text-3xl">
          {getFlowDiagramComponentIcon(data.componentId)}
        </div>
      }
      selected={selected}
    />
  )
}
