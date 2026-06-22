import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Node } from '@xyflow/react'
import { useSingleSelectedNode } from '../hooks/use-single-selected-node'

export function DefaultNode() {
  const { data, updateData } = useSingleSelectedNode<Node<{ label?: string }>>()

  return (
    <div>
      <Label className="mb-2 text-sm font-normal text-[#F4F7FC]">Label</Label>
      <Input
        value={data?.label || ''}
        placeholder="Label"
        className="!h-12 w-full rounded-[0.5rem] border border-[#2A3242] bg-transparent px-4 text-sm text-[#F4F7FC] placeholder:text-[#828DA3] focus:outline-none"
        onChange={(e) => updateData({ label: e.target.value })}
      />
    </div>
  )
}
