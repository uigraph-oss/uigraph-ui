import { Node, NodeProps, NodeResizer } from '@xyflow/react'
import { NodeCard } from './components/node-card'
import { NodeDataGenerator } from './types/node.types'

export type ImageNodeData = NodeDataGenerator<{
  src: string
}>

export type TImageNode = Node<ImageNodeData, 'image'>

export function ImageNode({ data, selected }: NodeProps<TImageNode>) {
  return (
    <NodeCard
      selected={selected}
      className="size-full overflow-hidden outline-transparent"
    >
      <NodeResizer minWidth={20} minHeight={20} isVisible={selected} />

      <img
        src={data.src}
        alt="React Flow Static Node"
        className="size-full rounded-[0.5rem]"
      />
    </NodeCard>
  )
}
