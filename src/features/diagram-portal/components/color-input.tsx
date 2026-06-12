import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { HexColorInput, HexColorPicker } from 'react-colorful'

export function ColorInput({
  color,
  onColorChange,
}: {
  color?: string | null
  onColorChange: (color: string) => void
}) {
  return (
    <div className="relative isolate">
      <Popover>
        <PopoverTrigger asChild>
          <button
            type="button"
            aria-label="Pick color"
            className="border-stock absolute top-[50%] left-3 aspect-square !h-7 -translate-y-1/2 rounded-[0.33rem] border shadow-md"
            style={{ background: color || 'transparent' }}
          />
        </PopoverTrigger>

        <PopoverContent className="w-auto p-0">
          <HexColorPicker color={color ?? ''} onChange={onColorChange} />
        </PopoverContent>
      </Popover>

      <HexColorInput
        color={color ?? ''}
        placeholder="- - -"
        className="border-input !h-12 w-full rounded-[0.5rem] border bg-transparent px-4 pl-12 text-sm uppercase"
        onChange={onColorChange}
        onInput={(e) => {
          const value = (e.target as HTMLInputElement).value
          if (!value.trim()) onColorChange('')
        }}
      />
    </div>
  )
}
