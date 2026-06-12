import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ColorPickerInput } from '@/features/component-meta'
import { SliderInput } from '@/features/diagram-portal/components/slider-input'
import { useEffectState } from '@/hooks/use-effect-state'
import { useSingleSelectedNode } from '../hooks/use-single-selected-node'
import { SHAPE_COMPONENTS_LIST, TShapeNode } from '../nodes'
import { BorderPropertiesCustomizeSection } from '../nodes/components/border-properties'
import { SliderNumberField } from './components/slider-number-field'
import { Field } from './field'

export function NodeShapeStyle() {
  const { data, node, updateData, updateNode } =
    useSingleSelectedNode<TShapeNode>()!

  const [localColor, setLocalColor] = useEffectState<string>(
    String(data?.fill || '')
  )

  const [localShape, setLocalShape] = useEffectState<string>(
    String(data?.shape || 'rectangle')
  )

  const [localWidth, setLocalWidth] = useEffectState<string>(
    String(node?.width ?? node?.measured?.width ?? '')
  )

  const [localHeight, setLocalHeight] = useEffectState<string>(
    String(node?.height ?? node?.measured?.height ?? '')
  )

  const [localStrokeOpacity, setLocalStrokeOpacity] = useEffectState<
    number | null
  >(data?.strokeOpacity || null)

  const [localTextColor, setLocalTextColor] = useEffectState(
    data?.textColor || ''
  )

  const [localTextFontSize, setLocalTextFontSize] = useEffectState(
    data?.textFontSize || ''
  )

  if (!data) return null

  return (
    <>
      <SliderNumberField
        min={0}
        max={100}
        step={1}
        label="Text Font Size"
        value={Number(localTextFontSize)}
        onChange={(val) => {
          setLocalTextFontSize(val)
          updateData({ textFontSize: val })
        }}
      />

      <Field label="Text Color">
        <ColorPickerInput
          value={localTextColor}
          className="border-stock border-1 border-solid"
          onChange={(value) => {
            setLocalTextColor(value)
            updateData({ textColor: value })
          }}
        />
      </Field>

      <Field label="Shape">
        <Select
          value={localShape}
          onValueChange={(value) => {
            setLocalShape(value)
            updateData({ shape: value as TShapeNode['data']['shape'] })
          }}
        >
          <SelectTrigger className="border-stock text-paragraph !h-12 w-full rounded-[0.5rem] border px-4 text-sm">
            <SelectValue placeholder={'Select Shape'} />
          </SelectTrigger>
          <SelectContent>
            {SHAPE_COMPONENTS_LIST.map(({ id, label }) => (
              <SelectItem key={id} value={id}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      <Field label="Background Color">
        <ColorPickerInput
          value={localColor == 'transparent' ? '' : localColor}
          className="border-stock border-1 border-solid"
          onChange={(value) => {
            setLocalColor(value)
            updateData({ fill: value || 'transparent' })
          }}
        />
      </Field>

      <Field label="Width (px)">
        <input
          type="number"
          className="border-stock text-paragraph !h-12 w-full rounded-[0.5rem] border px-4 text-sm"
          value={localWidth}
          min={20}
          step={2}
          onChange={(e) => {
            const v = e.target.value
            setLocalWidth(v)
            const num = Number(v)

            if (!Number.isNaN(num) && num > 0) {
              updateNode({ width: num }, true)
            }
          }}
        />
      </Field>

      <Field label="Height (px)">
        <input
          type="number"
          className="border-stock text-paragraph !h-12 w-full rounded-[0.5rem] border px-4 text-sm"
          value={localHeight}
          min={20}
          step={2}
          onChange={(e) => {
            const v = e.target.value
            setLocalHeight(v)
            const num = Number(v)

            if (!Number.isNaN(num) && num > 0) {
              updateNode({ height: num }, true)
            }
          }}
        />
      </Field>

      <BorderPropertiesCustomizeSection
        data={{
          borderColor: data?.stroke ?? null,
          borderStyle: data?.strokeStyle ?? null,
          borderWidth: data?.strokeWidth ?? null,
          borderRadius: data?.cornerRadius ?? null,
          borderAnimationEnabled:
            data?.strokeAnimation === 'dash' ? true : false,
        }}
        onChange={(value) => {
          updateData({
            stroke: value.borderColor ?? undefined,
            strokeWidth: value.borderWidth ?? undefined,
            strokeStyle:
              (value.borderStyle as 'solid' | 'dashed' | 'dotted') ?? undefined,

            cornerRadius: value.borderRadius ?? undefined,
            strokeAnimation: value.borderAnimationEnabled ? 'dash' : 'none',
          })
        }}
      />

      <Field label="Border Transparency">
        <SliderInput
          min={0}
          max={1}
          step={0.1}
          value={
            Number.isNaN(Number(localStrokeOpacity))
              ? 1
              : Number(localStrokeOpacity)
          }
          onChange={(val) => {
            setLocalStrokeOpacity(val)
            updateData({ strokeOpacity: val })
          }}
        />
      </Field>
    </>
  )
}
