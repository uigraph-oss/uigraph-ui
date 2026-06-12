import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Node } from '@xyflow/react'
import { useSingleSelectedNode } from '../hooks/use-single-selected-node'

export function DefaultNode() {
  const { data, updateData } = useSingleSelectedNode<Node<{ label?: string }>>()

  return (
    <div>
      <Label className="mb-2 text-sm leading-[1.333]">Label</Label>
      <Input
        value={data?.label || ''}
        placeholder="Label"
        className="!h-12 w-full rounded-[0.5rem] border px-4 text-sm"
        onChange={(e) => updateData({ label: e.target.value })}
      />
    </div>
  )
}
