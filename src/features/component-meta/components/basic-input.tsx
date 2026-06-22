import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import * as SliderPrimitive from '@radix-ui/react-slider'
import { useRef } from 'react'
import { HexColorInput, HexColorPicker } from 'react-colorful'
import { BsTrash3 } from 'react-icons/bs'

export function TextInput({
  value,
  onChange,
  readonly,
  placeholder,
}: {
  value: string
  onChange: (value: string) => void
  readonly?: boolean
  placeholder?: string | null
}) {
  return (
    <Input
      type="text"
      value={value}
      readOnly={readonly}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder || 'Enter text here'}
      className="border-stock text-foreground bg-input h-[3.5rem] w-full rounded-[1rem] border px-4 text-sm"
      autoCorrect="off"
      autoComplete="off"
      autoCapitalize="off"
    />
  )
}

export function TextAreaInput({
  value,
  onChange,
  readonly,
  placeholder,
}: {
  value: string
  onChange: (value: string) => void
  readonly?: boolean
  placeholder?: string | null
}) {
  return (
    <Textarea
      value={value}
      readOnly={readonly}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder || 'Enter text here'}
      className="border-stock text-foreground bg-input h-[6.75rem] w-full resize-none rounded-[1rem] border p-4 px-4 text-sm leading-normal break-all"
      autoCorrect="off"
      autoComplete="off"
      autoCapitalize="off"
    />
  )
}

export function URLInput({
  value,
  onChange,
  readonly,
  placeholder,
}: {
  value: string
  onChange: (value: string) => void
  readonly?: boolean
  placeholder?: string | null
}) {
  return (
    <Input
      type="url"
      value={value}
      readOnly={readonly}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder || 'Enter URL here'}
      className="border-stock text-foreground bg-input h-[3.5rem] w-full rounded-[1rem] border px-4 text-sm"
      autoCorrect="off"
      autoComplete="off"
      autoCapitalize="off"
    />
  )
}

export function KeyValuePairInput({
  value,
  onChange,
  readonly,
}: {
  value: { k: string; v: string }[]
  onChange: (value: { k: string; v: string }[]) => void
  readonly?: boolean
}) {
  return (
    <div className={'grid gap-2'}>
      {value.map((item, index) => (
        <div key={index} className="grid grid-cols-[1fr_1fr_auto] gap-2">
          <TextInput
            value={item.k || ''}
            readonly={readonly}
            placeholder="Enter key"
            onChange={(inputValue) =>
              onChange(
                value.map((v, i) =>
                  i === index ? { k: inputValue, v: v.v } : v
                )
              )
            }
          />

          <TextInput
            value={item.v || ''}
            readonly={readonly}
            placeholder="Enter value"
            onChange={(inputValue) =>
              onChange(
                value.map((v, i) =>
                  i === index ? { k: v.k, v: inputValue } : v
                )
              )
            }
          />

          <div className="flex items-center justify-center py-2">
            <Button
              size="icon"
              variant="ghost"
              disabled={readonly}
              onClick={() => onChange(value.filter((_, i) => i !== index))}
              className="text-destructive hover:text-destructive/80 aspect-square h-full w-auto rounded-xl transition-all"
            >
              <BsTrash3 className="size-4" />
            </Button>
          </div>
        </div>
      ))}

      {value.length === 0 && (
        <div className="text-paragraph/60 px-4 text-sm">
          No key-value pairs added.
        </div>
      )}

      <div>
        <Button
          variant="ghost"
          disabled={readonly}
          onClick={() => onChange([...value, { k: '', v: '' }])}
          className="!text-primary"
        >
          Add New
        </Button>
      </div>
    </div>
  )
}

export function ColorPickerInput({
  value,
  onChange,
  className,
  readonly,
}: {
  value: string
  onChange: (value: string) => void
  className?: string
  readonly?: boolean
}) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  return (
    <div className="relative isolate">
      <Popover open={readonly ? false : undefined}>
        <PopoverTrigger asChild>
          <div
            className="border-stock absolute top-1/2 left-3 size-6 -translate-y-1/2 rounded-md border"
            style={{ backgroundColor: value }}
          />
        </PopoverTrigger>

        <PopoverContent className="w-auto bg-transparent p-0">
          <HexColorPicker
            color={value}
            onChange={(color) => {
              if (timeoutRef.current) {
                clearTimeout(timeoutRef.current)
              }

              timeoutRef.current = setTimeout(() => {
                onChange(color)
              }, 100)
            }}
          />
        </PopoverContent>
      </Popover>

      <HexColorInput
        color={value ?? ''}
        readOnly={readonly}
        onChange={onChange}
        onInput={(e) => {
          const value = (e.target as HTMLInputElement).value
          if (!value.trim()) onChange('')
        }}
        placeholder="- - -"
        className={cn(
          'text-foreground ring-ring/50 bg-input h-[3.5rem] w-full rounded-[1rem] border-none px-4 pl-11 text-sm uppercase ring-0 transition-all outline-none focus:ring-[3px]',
          className
        )}
      />
    </div>
  )
}

export function SliderInput({
  min = 0,
  max = 100,
  step = 1,
  value,
  onChange,
  readonly,
}: {
  min?: number
  max?: number
  step?: number
  value?: number | null
  onChange: (value: number) => void
  readonly?: boolean
}) {
  return (
    <div
      title={String(value)}
      className="bg-input flex h-14 items-center gap-3 rounded-[1rem] px-4"
    >
      <span className="text-muted-foreground text-sm">{min}</span>

      <SliderPrimitive.Root
        min={min}
        max={max}
        step={step}
        value={value == null ? [min] : [value]}
        onValueChange={([val]) => onChange(val)}
        className="relative flex w-full touch-none items-center select-none data-[disabled]:opacity-50 data-[orientation=vertical]:h-full data-[orientation=vertical]:min-h-44 data-[orientation=vertical]:w-auto data-[orientation=vertical]:flex-col"
        data-slot="slider"
        disabled={readonly}
      >
        <SliderPrimitive.Track
          data-slot="slider-track"
          className="bg-muted relative grow overflow-hidden rounded-full data-[orientation=horizontal]:h-1.5 data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-1.5"
        >
          <SliderPrimitive.Range
            data-slot="slider-range"
            className="bg-primary absolute data-[orientation=horizontal]:h-full data-[orientation=vertical]:w-full"
          />
        </SliderPrimitive.Track>
        <SliderPrimitive.Thumb
          data-slot="slider-thumb"
          className="border-primary bg-background ring-ring/50 text-foreground flex size-5 min-w-min shrink-0 cursor-grab items-center justify-center rounded-full border p-1 text-xs shadow-sm transition-[color,box-shadow] hover:ring-4 focus-visible:ring-4 focus-visible:outline-hidden active:cursor-grabbing disabled:pointer-events-none disabled:opacity-50"
        >
          {value}
        </SliderPrimitive.Thumb>
      </SliderPrimitive.Root>

      <span className="text-muted-foreground text-sm">{max}</span>
    </div>
  )
}
