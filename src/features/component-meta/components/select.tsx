'use client'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { Check, ChevronDown } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'

export function DropdownSelectInput({
  value,
  onChange,
  options,
  placeholder,
  className,
  readonly,
}: {
  placeholder?: string | null
  value: string
  onChange: (value: string) => void
  options: string[]
  className?: string
  readonly?: boolean
}) {
  const validOptions = options.filter(Boolean)

  return (
    <Select
      value={value}
      onValueChange={onChange}
      open={readonly ? false : undefined}
    >
      <SelectTrigger className="border-stock text-foreground [&[data-placeholder]]:text-paragraph !h-[3.5rem] w-full rounded-[1rem] border bg-white px-4 text-sm">
        <SelectValue placeholder={placeholder || 'Select an option'} />
      </SelectTrigger>

      <SelectContent className={className}>
        {validOptions.filter(Boolean).map((option, j) => (
          <SelectItem key={j} value={option}>
            {option}
          </SelectItem>
        ))}

        {validOptions.length === 0 && (
          <p className="text-muted-foreground px-6 py-2 text-sm">
            No options available
          </p>
        )}
      </SelectContent>
    </Select>
  )
}

export function DropdownSearchSelect({
  value,
  onChange,
  options,
  placeholder,
  readonly,
}: {
  placeholder?: string | null
  value: string
  onChange: (value: string) => void
  options: string[]
  readonly?: boolean
}) {
  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const filteredOptions = useMemo(() => {
    if (searchQuery === '') return options

    return options.filter((option) =>
      option.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [options, searchQuery])

  useEffect(() => {
    setSearchQuery('')
  }, [open])

  return (
    <Select
      open={readonly ? false : open}
      onOpenChange={setOpen}
      value={value}
      onValueChange={onChange}
    >
      <SelectTrigger className="border-stock text-foreground [&[data-placeholder]]:text-paragraph !h-[3.5rem] w-full rounded-[1rem] border bg-white px-4 text-sm">
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
            value={option}
            hidden={!filteredOptions.includes(option)}
          >
            {option}
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

export function DropdownMultiSelect({
  value,
  options,
  readonly,
  onChange,
  placeholder = 'Select items',
}: {
  value: string[]
  options: string[]
  readonly?: boolean
  onChange: (value: string[]) => void
  placeholder?: string | null
}) {
  const triggerRef = useRef<HTMLButtonElement>(null)
  const [triggerWidth, setTriggerWidth] = useState(0)

  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!open) return

    const triggerElement = triggerRef.current!
    if (!triggerElement) return

    const resizeObserver = new ResizeObserver(() => {
      setTriggerWidth(triggerElement.offsetWidth)
    })

    setTriggerWidth(triggerElement.offsetWidth)
    resizeObserver.observe(triggerElement)
  }, [triggerRef, open])

  function toggleItem(val: string) {
    if (value.includes(val)) {
      onChange(value.filter((v) => v !== val))
    } else {
      onChange([...value, val])
    }
  }

  const selectedLabels = options
    .filter((item) => value.includes(item))
    .map((item) => item)

  return (
    <DropdownMenu open={readonly ? false : open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button
          ref={triggerRef}
          className="border-stock text-foreground [&[data-placeholder]]:text-paragraph flex min-h-14 w-full items-center justify-between rounded-[1rem] border bg-white px-4 py-3 text-sm"
        >
          {selectedLabels.length > 0 ? selectedLabels.join(', ') : placeholder}
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align={'start'} style={{ width: triggerWidth }}>
        {options.filter(Boolean).map((item) => (
          <DropdownMenuItem
            key={item}
            className="justify-start"
            onSelect={(e) => {
              e.preventDefault()
              toggleItem(item)
            }}
          >
            <Check
              className={cn(
                'h-4 w-4 scale-0 opacity-0 transition-all',
                value.includes(item) && 'scale-100 opacity-100'
              )}
            />

            {item}
          </DropdownMenuItem>
        ))}

        {options.length === 0 && (
          <p className="text-muted-foreground px-6 py-2 text-sm">
            No options available
          </p>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
