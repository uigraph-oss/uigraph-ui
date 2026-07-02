import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { ColorPickerInput } from '@/features/component-meta'
import { Field } from '@/features/diagram-portal/properties/field'
import { useAutoRef } from '@/hooks/use-auto-ref'
import { useEffectState } from 'daily-code/react'

interface BorderPropertiesCustomizeSectionData {
  borderStyle: string | undefined | null
  borderColor: string | undefined | null
  borderWidth: number | undefined | null
  borderRadius: number | undefined | null
  borderAnimationEnabled: boolean | undefined | null
}

interface BorderPropertiesCustomizeSectionProps {
  data: BorderPropertiesCustomizeSectionData
  onChange: (data: BorderPropertiesCustomizeSectionData) => void
}

export function BorderPropertiesCustomizeSection({
  data,
  onChange,
}: BorderPropertiesCustomizeSectionProps) {
  console.log(data)

  const dataRef = useAutoRef(data)

  const [localBorderStyle, setLocalBorderStyle] = useEffectState(
    data.borderStyle ?? ''
  )

  const [localBorderWidth, setLocalBorderWidth] = useEffectState(
    data.borderWidth ?? ''
  )

  const [localBorderColor, setLocalBorderColor] = useEffectState(
    data.borderColor ?? ''
  )

  const [localBorderRadius, setLocalBorderRadius] = useEffectState(
    data.borderRadius ?? ''
  )

  const [localBorderAnimationEnabled, setLocalBorderAnimationEnabled] =
    useEffectState(data.borderAnimationEnabled ?? false)

  return (
    <>
      <Field label="Border Style">
        <ToggleGroup
          type="single"
          className="border-stock w-full border"
          value={localBorderStyle}
          onValueChange={(value) => {
            setLocalBorderStyle(value)

            onChange({
              ...dataRef.current,

              borderStyle:
                value === dataRef.current.borderStyle ? 'none' : value,

              borderWidth: dataRef.current.borderWidth ?? 1,
              borderColor: dataRef.current.borderColor ?? '#000000',
            })
          }}
        >
          <ToggleGroupItem value="solid" className="text-xs">
            Solid
          </ToggleGroupItem>
          <ToggleGroupItem value="dashed" className="text-xs">
            Dashed
          </ToggleGroupItem>
          <ToggleGroupItem value="dotted" className="text-xs">
            Dotted
          </ToggleGroupItem>
        </ToggleGroup>
      </Field>

      <Field label="Border Color">
        <ColorPickerInput
          value={localBorderColor}
          className="border-stock border-1 border-solid"
          onChange={(value) => {
            setLocalBorderColor(value)

            onChange({
              ...dataRef.current,
              borderColor: value,
              borderWidth: dataRef.current.borderWidth ?? 1,
              borderStyle: dataRef.current.borderStyle ?? 'solid',
            })
          }}
        />
      </Field>

      <Field label="Border Width">
        <div className="flex w-full items-center gap-3">
          <div className="flex-1">
            <Slider
              min={0}
              max={20}
              step={1}
              value={[
                Number.isNaN(Number(localBorderWidth))
                  ? 0
                  : Number(localBorderWidth),
              ]}
              onValueChange={([val]) => {
                setLocalBorderWidth(val)

                onChange({
                  ...dataRef.current,
                  borderWidth: val,
                  borderStyle: dataRef.current.borderStyle ?? 'solid',
                  borderColor: dataRef.current.borderColor ?? '#000000',
                })
              }}
            />
          </div>
          <input
            type="number"
            className="border-stock text-paragraph !h-12 w-16 rounded-[0.5rem] border px-1 pl-3 text-center text-sm"
            value={
              Number.isNaN(localBorderWidth) ? '' : (localBorderWidth ?? '')
            }
            min={0}
            max={20}
            step={1}
            onChange={(e) => {
              const num = Number(e.target.value)
              if (!Number.isNaN(num) && num >= 0) {
                setLocalBorderWidth(num)

                onChange({
                  ...dataRef.current,
                  borderWidth: num,
                  borderStyle: dataRef.current.borderStyle ?? 'solid',
                  borderColor: dataRef.current.borderColor ?? '#000000',
                })
              }
            }}
          />
        </div>
      </Field>

      <Field label="Border Radius">
        <div className="flex w-full items-center gap-3">
          <div className="flex-1">
            <Slider
              min={0}
              max={50}
              step={1}
              value={[
                Number.isNaN(Number(localBorderRadius))
                  ? 0
                  : Number(localBorderRadius),
              ]}
              onValueChange={([val]) => {
                setLocalBorderRadius(val)

                onChange({ ...dataRef.current, borderRadius: val })
              }}
            />
          </div>
          <input
            type="number"
            className="border-stock text-paragraph !h-12 w-16 rounded-[0.5rem] border px-1 pl-3 text-center text-sm"
            value={
              Number.isNaN(localBorderRadius) ? '' : (localBorderRadius ?? '')
            }
            min={0}
            max={50}
            step={1}
            onChange={(e) => {
              const num = Number(e.target.value)
              if (!Number.isNaN(num) && num >= 0) {
                setLocalBorderRadius(num)

                onChange({ ...dataRef.current, borderRadius: num })
              }
            }}
          />
        </div>
      </Field>

      <Field label="Border Animation">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground text-sm">
            {localBorderAnimationEnabled ? 'Enabled' : 'Disabled'}
          </span>
          <Switch
            checked={localBorderAnimationEnabled ?? false}
            onCheckedChange={(value) => {
              setLocalBorderAnimationEnabled(value)

              onChange({ ...dataRef.current, borderAnimationEnabled: value })
            }}
          />
        </div>
      </Field>
    </>
  )
}
