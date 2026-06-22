import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ColorPickerInput } from '@/features/component-meta'
import { useComponentMetaClasses } from '@/features/component-meta/theme'
import { useEffectState } from '@/hooks/use-effect-state'
import { Node } from '@xyflow/react'
import { useSingleSelectedNode } from '../hooks/use-single-selected-node'
import { TextNodeData } from '../nodes'
import { BorderPropertiesCustomizeSection } from '../nodes/components/border-properties'
import { SliderNumberField } from './components/slider-number-field'
import { Field } from './field'

const fontFamilies = [
  { value: 'inherit', label: 'Default' },
  { value: 'Inter', label: 'Inter' },
  { value: 'Arial', label: 'Arial' },
  { value: 'Helvetica', label: 'Helvetica' },
  { value: 'Georgia', label: 'Georgia' },
  { value: 'Times New Roman', label: 'Times New Roman' },
  { value: 'Courier New', label: 'Courier New' },
  { value: 'Verdana', label: 'Verdana' },
  { value: 'Comic Sans MS', label: 'Comic Sans MS' },
  { value: 'Trebuchet MS', label: 'Trebuchet MS' },
]

const fontWeights = [
  { value: 100, label: 'Thin' },
  { value: 200, label: 'Extra Light' },
  { value: 300, label: 'Light' },
  { value: 400, label: 'Regular' },
  { value: 500, label: 'Medium' },
  { value: 600, label: 'Semi Bold' },
  { value: 700, label: 'Bold' },
  { value: 800, label: 'Extra Bold' },
  { value: 900, label: 'Black' },
]

export function NodeTextStyle() {
  const { data, updateData } = useSingleSelectedNode<Node<TextNodeData>>()
  const { select } = useComponentMetaClasses()

  const [localFill, setLocalFill] = useEffectState<string>(String(data?.fill))

  const [localFontSize, setLocalFontSize] = useEffectState(data?.fontSize || '')

  const [localFontWeight, setLocalFontWeight] = useEffectState(
    data?.fontWeight || ''
  )

  const [localColor, setLocalColor] = useEffectState<string>(data?.color || '')

  const [localFontFamily, setLocalFontFamily] = useEffectState<string>(
    data?.fontFamily || ''
  )

  const [localLineHeight, setLocalLineHeight] = useEffectState(
    data?.lineHeight ?? ''
  )

  if (!data) return null

  return (
    <>
      <Field label="Text Color">
        <ColorPickerInput
          value={localColor}
          className="border-stock border-1 border-solid"
          onChange={(value) => {
            setLocalColor(value || '')
            updateData({ color: value || undefined })
          }}
        />
      </Field>

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

      <Field label="Font Weight">
        <Select
          value={String(localFontWeight)}
          onValueChange={(value) => {
            const numValue = Number(value)
            setLocalFontWeight(numValue || '')
            updateData({ fontWeight: numValue || undefined })
          }}
        >
          <SelectTrigger className={select}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {fontWeights.map((fw) => (
              <SelectItem key={fw.value} value={String(fw.value)}>
                {fw.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      <Field label="Font Family">
        <Select
          value={localFontFamily}
          onValueChange={(value) => {
            setLocalFontFamily(value || '')
            updateData({ fontFamily: value || undefined })
          }}
        >
          <SelectTrigger className={select}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {fontFamilies.map((font) => (
              <SelectItem key={font.value} value={font.value}>
                {font.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      <Field label="Background Color">
        <ColorPickerInput
          value={localFill == 'transparent' ? '' : localFill}
          className="border-stock border-1 border-solid"
          onChange={(value) => {
            setLocalFill(value || '')
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
