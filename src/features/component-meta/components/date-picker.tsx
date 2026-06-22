'use client'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { format, parse, parseISO } from 'date-fns'
import { useState } from 'react'
import { IoCalendarOutline } from 'react-icons/io5'

function parseDateOnly(value: string): Date | undefined {
  let d: Date

  if (value.includes('T')) {
    d = parseISO(value.split('T')[0])
  } else if (/^\d{4}-\d/.test(value)) {
    d = parseISO(value)
  } else {
    d = parse(value, 'd-M-yyyy', new Date())
  }

  return isNaN(d.getTime()) ? undefined : d
}

export function DatePicker({
  value,
  onChange,
  readonly,
}: {
  value: string
  onChange: (value: string) => void
  readonly?: boolean
}) {
  const [isOpen, setIsOpen] = useState(false)

  const dateValue = value ? parseDateOnly(value) : undefined
  const isValidDate = dateValue && !isNaN(dateValue.getTime())

  function handleDateSelect(date: Date | undefined) {
    if (date) {
      onChange(date.toISOString())
      setIsOpen(false)
    }
  }

  const displayValue = isValidDate ? format(dateValue, 'PPP') : 'Select a date'

  return (
    <Popover open={readonly ? false : isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className={cn(
            'border-stock text-foreground bg-input h-[3.5rem] w-full justify-between rounded-[1rem] border px-4 text-sm font-normal',
            isValidDate || 'text-muted-foreground'
          )}
        >
          <span>{displayValue}</span>
          <IoCalendarOutline className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={isValidDate ? dateValue : undefined}
          onSelect={handleDateSelect}
          defaultMonth={dateValue}
          // eslint-disable-next-line jsx-a11y/no-autofocus
          autoFocus
        />
      </PopoverContent>
    </Popover>
  )
}

export function DateRangePicker({
  value,
  onChange,
  enableMinified = false,
  readonly,
}: {
  value: { from: string; to: string } | null
  onChange: (value: { from: string; to: string } | null) => void
  enableMinified?: boolean
  readonly?: boolean
}) {
  const [isOpen, setIsOpen] = useState(false)

  const fromDate = value?.from ? parseDateOnly(value.from) : undefined
  const toDate = value?.to ? parseDateOnly(value.to) : undefined
  const isValidRange =
    fromDate && toDate && !isNaN(fromDate.getTime()) && !isNaN(toDate.getTime())

  function handleRangeSelect(range: { from?: Date; to?: Date } | undefined) {
    if (!range) {
      onChange(null)
      return
    }

    if (range.from && range.to) {
      onChange({
        from: range.from.toISOString(),
        to: range.to.toISOString(),
      })
    } else if (range.from) {
      onChange({
        from: range.from.toISOString(),
        to: range.from.toISOString(),
      })
    }
  }

  function twoDigitYear(d: Date) {
    return format(d, 'yy')
  }

  function formatMinifiedRange(start: Date, end: Date) {
    const sameMonthAndYear =
      start.getFullYear() === end.getFullYear() &&
      start.getMonth() === end.getMonth()

    if (sameMonthAndYear) {
      // Nov 4–6, 25  -> using two-digit year to save space
      return `${format(start, 'MMM')} ${format(start, 'd')}–${format(end, 'd')}, ${twoDigitYear(
        start
      )}`
    }

    const differentYear = start.getFullYear() !== end.getFullYear()

    if (differentYear) {
      // Dec 30, 25 – Jan 2, 26
      return `${format(start, 'MMM d')}, ${twoDigitYear(start)} – ${format(end, 'MMM d')}, ${twoDigitYear(
        end
      )}`
    }

    // Different months, same year: Nov 30 – Dec 2, 25
    return `${format(start, 'MMM d')} – ${format(end, 'MMM d')}, ${twoDigitYear(start)}`
  }

  const displayValue =
    isValidRange && fromDate && toDate ? (
      enableMinified ? (
        formatMinifiedRange(fromDate, toDate)
      ) : (
        <>
          <span>{format(fromDate, 'PPP')}</span>
          <span>-</span>
          <span>{format(toDate, 'PPP')}</span>
        </>
      )
    ) : (
      'Select date range'
    )

  const selectedRange =
    fromDate && toDate ? { from: fromDate, to: toDate } : undefined

  return (
    <Popover open={readonly ? false : isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className="border-stock text-foreground bg-input h-auto min-h-14 w-full justify-between rounded-[1rem] border px-4 text-[0.625rem] font-normal sm:text-sm"
        >
          <span
            className={cn(
              enableMinified
                ? 'flex items-center gap-2 truncate overflow-hidden whitespace-nowrap'
                : 'flex flex-wrap',
              isValidRange || 'text-muted-foreground'
            )}
            title={typeof displayValue === 'string' ? displayValue : undefined}
          >
            {displayValue}
          </span>
          <IoCalendarOutline className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="range"
          selected={selectedRange}
          onSelect={handleRangeSelect}
          defaultMonth={fromDate || new Date()}
          numberOfMonths={2}
          // eslint-disable-next-line jsx-a11y/no-autofocus
          autoFocus
        />
      </PopoverContent>
    </Popover>
  )
}
