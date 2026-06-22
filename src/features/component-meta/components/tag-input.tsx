import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { FocusEvent, KeyboardEvent, useState } from 'react'
import { LuX } from 'react-icons/lu'

export function TagInput({
  value,
  onChange,
  placeholder,
  readonly,
}: {
  value: string[]
  onChange: (value: string[]) => void
  placeholder?: string | null
  readonly?: boolean
}) {
  const [inputValue, setInputValue] = useState('')

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    const v = e.currentTarget.value.trim()
    if (!v) return

    if (e.key === 'Enter') {
      e.preventDefault()

      setInputValue('')
      onChange([...value, v])
    } else if (e.key === 'Backspace' && inputValue === '' && v.length > 0) {
      e.preventDefault()

      onChange(value.filter((_, index) => index !== v.length - 1))
    }
  }

  function handleInputBlur(e: FocusEvent<HTMLInputElement>) {
    const v = e.target.value.trim()
    if (!v) return

    setInputValue('')
    onChange([...value, v])
  }

  return (
    <div className="border-stock text-foreground bg-input min-h-14 w-full rounded-[1rem] border px-4 py-3">
      <div className="flex flex-wrap items-center gap-1">
        {value.map((tag, index) => (
          <div
            key={index}
            className="bg-primary text-primary-foreground flex items-center gap-1 rounded-md px-2 py-1 text-sm font-medium"
          >
            <span className="break-all">{tag}</span>

            <button
              type="button"
              disabled={readonly}
              onClick={() => onChange(value.filter((_, i) => i !== index))}
              className="text-primary-foreground hover:bg-destructive flex h-4 w-4 items-center justify-center rounded-sm p-0"
            >
              <LuX className="h-3 w-3" />
            </button>
          </div>
        ))}

        <Input
          type="text"
          value={inputValue}
          readOnly={readonly}
          autoCorrect="off"
          autoComplete="off"
          autoCapitalize="off"
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleInputBlur}
          placeholder={
            value.length === 0
              ? placeholder || 'Type and press Enter to add tags'
              : ''
          }
          className={cn(
            'border-0 bg-transparent p-0 text-sm shadow-none outline-none focus-visible:ring-0',
            'placeholder:text-muted-foreground h-[28px] leading-none',
            value.length === 0 ? 'w-full' : 'min-w-[120px] flex-1'
          )}
        />
      </div>
    </div>
  )
}
