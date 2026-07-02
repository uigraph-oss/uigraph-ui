import { useEffectState } from '@/hooks/use-effect-state'
import { Node } from '@xyflow/react'
import { useSingleSelectedNode } from '../hooks/use-single-selected-node'
import { CodeNodeData } from '../nodes'
import { BorderPropertiesCustomizeSection } from '../nodes/components/border-properties'
import { SliderNumberField } from './components/slider-number-field'

export function NodeCodeStyle() {
  const { data, updateData } = useSingleSelectedNode<Node<CodeNodeData>>()

  const [localFontSize, setLocalFontSize] = useEffectState(data?.fontSize || '')

  const [localLineHeight, setLocalLineHeight] = useEffectState(
    data?.lineHeight ?? ''
  )

  if (!data) return null

  return (
    <>
      <SliderNumberField
        min={0}
        max={100}
        step={1}
        label="Font Size"
        value={Number(localFontSize)}
        onChange={(val) => {
          setLocalFontSize(val)
          updateData({ fontSize: val })
        }}
      />

      <SliderNumberField
        min={1}
        max={5}
        step={0.1}
        label="Line Height"
        value={Number(localLineHeight)}
        onChange={(val) => {
          setLocalLineHeight(val)
          updateData({ lineHeight: val })
        }}
      />

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
