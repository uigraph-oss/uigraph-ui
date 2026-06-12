import { useFuse } from '@/features/diagram-portal/hooks/use-fuse'
import { cn } from '@/lib/utils'
import { useEffect, useState } from 'react'
import { Input } from './input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './select'

type SelectSearchProps = {
  value: string
  onChange: (value: string) => void
  options: { label: string; value: string }[]

  disabled?: boolean
  className?: string
  placeholder?: string
}

export function SelectSearch({
  value,
  options,
  onChange,

  disabled,
  className,
  placeholder,
}: SelectSearchProps) {
  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const filteredOptions = useFuse(options, searchQuery, {
    keys: ['label', 'value'],
  })

  useEffect(() => {
    setSearchQuery('')
  }, [open])

  return (
    <Select
      open={open}
      value={value}
      disabled={disabled}
      onOpenChange={setOpen}
      onValueChange={onChange}
    >
      <SelectTrigger
        className={cn(
          'border-stock text-foreground [&[data-placeholder]]:text-paragraph !h-[3.5rem] w-full rounded-[1rem] border bg-white px-4 text-sm',
          className
        )}
      >
        <SelectValue placeholder={placeholder || 'Select an option'} />
      </SelectTrigger>

      <SelectContent>
        <Input
          placeholder="Search..."
          className="bg-white/80"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => {
            e.stopPropagation()
            e.nativeEvent.stopImmediatePropagation()
          }}
        />

        {options.filter(Boolean).map((option, j) => (
          <SelectItem
            key={j}
            value={option.value}
            hidden={!filteredOptions.some((o) => o.value === option.value)}
          >
            {option.label}
          </SelectItem>
        ))}

        {filteredOptions.length === 0 && (
          <p className="text-muted-foreground px-6 py-2 text-sm">
            No options available
          </p>
        )}
      </SelectContent>
    </Select>
  )
}
