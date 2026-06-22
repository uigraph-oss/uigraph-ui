import { Input } from '@/components/ui/input'
import { useAutoRef } from '@/hooks/use-auto-ref'
import { useEffect, useRef, useState } from 'react'
import { IoCaretDown, IoCaretUp } from 'react-icons/io5'
import { useComponentMetaClasses } from '../theme'

export function NumberInput({
  value,
  onChange,
  readonly,
  placeholder,
}: {
  value: number | string
  onChange: (value: number) => void
  readonly?: boolean
  placeholder?: string | null
}) {
  const classes = useComponentMetaClasses()

  const helpersRef = useAutoRef({
    value,
    onChange,
  })

  const inputRef = useRef<HTMLInputElement>(null)
  const [isFocused, setIsFocused] = useState(false)

  useEffect(() => {
    if (!isFocused) return

    const inputElement = inputRef.current!
    if (!inputElement) return

    function handleWheel(e: WheelEvent) {
      e.preventDefault()

      const { value, onChange } = helpersRef.current

      const currentValue = Number(value)
      const step = e.deltaY < 0 ? 1 : -1
      const newValue = currentValue + step
      onChange(Number.isNaN(newValue) ? 0 : newValue)
    }

    inputElement.addEventListener('wheel', handleWheel, { passive: false })
    return () => {
      inputElement.removeEventListener('wheel', handleWheel)
    }
  }, [inputRef, isFocused, helpersRef])

  return (
    <div className="relative isolate">
      <Input
        type="text"
        ref={inputRef}
        autoCorrect="off"
        autoComplete="off"
        autoCapitalize="off"
        readOnly={readonly}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={placeholder || 'Enter number here'}
        className={classes.input}
        value={Number.isNaN(Number(value)) ? '' : String(value)}
        onChange={(e) => {
          const numVal = Number(e.target.value)
          onChange(Number.isNaN(numVal) ? 0 : numVal)
        }}
      />

      <div className="absolute top-1/2 right-3 flex -translate-y-1/2 flex-col">
        <button
          tabIndex={-1}
          disabled={readonly}
          className="text-muted-foreground/40 hover:text-muted-foreground text-[0.8125rem] transition-all"
          onClick={() => {
            const { value, onChange } = helpersRef.current
            const newValue = Number(value) + 1
            onChange(Number.isNaN(newValue) ? 0 : newValue)
          }}
        >
          <IoCaretUp />
        </button>

        <button
          tabIndex={-1}
          disabled={readonly}
          className="text-muted-foreground/40 hover:text-muted-foreground text-[0.8125rem] transition-all"
          onClick={() => {
            const { value, onChange } = helpersRef.current
            const newValue = Number(value) - 1
            onChange(Number.isNaN(newValue) ? 0 : newValue)
          }}
        >
          <IoCaretDown />
        </button>
      </div>
    </div>
  )
}
