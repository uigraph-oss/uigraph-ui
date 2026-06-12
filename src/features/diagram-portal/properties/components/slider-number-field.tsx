import { Slider } from '@/components/ui/slider'
import { Field } from '../field'

interface SliderNumberFieldProps {
  min: number
  max: number
  step: number
  label: string
  value: number | string
  onChange: (value: number) => void
}

export function SliderNumberField({
  min,
  max,
  step,
  label,
  value,
  onChange,
}: SliderNumberFieldProps) {
  return (
    <Field label={label}>
      <div className="flex w-full items-center gap-3">
        <div className="flex-1">
          <Slider
            min={min}
            max={max}
            step={step}
            value={[Number.isNaN(Number(value)) ? 0 : Number(value)]}
            onValueChange={([val]) => onChange(val)}
          />
        </div>

        <input
          min={min}
          max={max}
          step={step}
          value={Number.isNaN(value) ? '' : (value ?? '')}
          onChange={(e) => {
            const num = Number(e.target.value)
            if (!Number.isNaN(num) && num >= min && num <= max) {
              onChange(num)
            }
          }}
          type="number"
          className="border-stock text-paragraph !h-12 w-16 rounded-[0.5rem] border px-1 pl-3 text-center text-sm"
        />
      </div>
    </Field>
  )
}
