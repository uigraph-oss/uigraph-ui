import { ColorPickerInput } from '@/features/component-meta'
import { useEffectState } from '@/hooks/use-effect-state'
import { Node } from '@xyflow/react'
import { useSingleSelectedNode } from '../hooks/use-single-selected-node'
import { CloudNodeData } from '../nodes'
import { BorderPropertiesCustomizeSection } from '../nodes/components/border-properties'
import { Field } from './field'

export function NodeCloudStyle() {
  const { data, updateData } = useSingleSelectedNode<Node<CloudNodeData>>()
  const [localFill, setLocalFill] = useEffectState<string>(String(data?.fill))

  if (!data) return null

  return (
    <>
      <Field label="Background Color">
        <ColorPickerInput
          value={localFill == 'transparent' ? '' : localFill}
          className="border-stock border-1 border-solid"
          onChange={(value) => {
            setLocalFill(value)
            updateData({ fill: value || 'transparent' })
          }}
        />
      </Field>

      <BorderPropertiesCustomizeSection
        data={{
          borderColor: data?.stroke ?? null,
          borderStyle: data?.strokeStyle ?? null,
          borderWidth: data?.strokeWidth ?? null,
          borderRadius: data?.borderRadius ?? null,
          borderAnimationEnabled: data?.borderAnimationEnabled ?? null,
        }}
        onChange={(value) => {
          updateData({
            stroke: value.borderColor ?? undefined,
            strokeWidth: value.borderWidth ?? undefined,
            strokeStyle:
              (value.borderStyle as 'solid' | 'dashed' | 'dotted') ?? undefined,
            borderRadius: value.borderRadius ?? undefined,
            borderAnimationEnabled: value.borderAnimationEnabled ?? undefined,
          })
        }}
      />
    </>
  )
}
