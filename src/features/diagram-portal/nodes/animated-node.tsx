import { Node, NodeProps, NodeResizer } from '@xyflow/react'
import { NodeCard } from './components/node-card'
import { NodeDataGenerator } from './types/node.types'

export type AnimatedNodeData = NodeDataGenerator<{
  src: string
}>

export type TAnimatedNode = Node<AnimatedNodeData, 'gif'>

export function AnimatedNode({ data, selected }: NodeProps<TAnimatedNode>) {
  return (
    <NodeCard
      selected={selected}
      className="size-full overflow-hidden outline-transparent"
    >
      <NodeResizer minWidth={20} minHeight={20} isVisible={selected} />

      <img
        src={data.src}
        alt="React Flow Animated Node"
        className="size-full rounded-[0.5rem]"
      />
    </NodeCard>
  )
}
