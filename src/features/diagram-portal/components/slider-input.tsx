import { Slider } from '@/components/ui/slider'

export function SliderInput({
  min,
  max,
  step,
  value,
  onChange,
}: {
  min: number
  max: number
  step: number
  value: number
  onChange: (value: number) => void
}) {
  return (
    <div className="flex !h-12 w-full items-center rounded-[0.5rem] border px-4">
      <Slider
        min={min}
        max={max}
        step={step}
        value={[value]}
        onValueChange={([val]) => onChange(val)}
      />
    </div>
  )
}
