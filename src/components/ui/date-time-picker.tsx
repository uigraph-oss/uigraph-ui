'use client'

import { format } from 'date-fns'
import { CalendarIcon } from 'lucide-react'
import * as React from 'react'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { toDateTimeLocal } from '@/utils/time'

export function DateTimePicker({
  value,
  onChange,
  onBlur,
  className,
}: {
  value: string
  onChange: (value: string) => void
  onBlur?: () => void
  className?: string
}) {
  const date = value === '' ? undefined : new Date(value)
  const setDate = (next: Date) => onChange(toDateTimeLocal(next))
  const [isOpen, setIsOpen] = React.useState(false)

  const hours = Array.from({ length: 12 }, (_, i) => i + 1)
  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      setDate(selectedDate)
    }
  }

  const handleTimeChange = (
    type: 'hour' | 'minute' | 'ampm',
    value: string
  ) => {
    if (date) {
      const newDate = new Date(date)
      if (type === 'hour') {
        newDate.setHours(
          (parseInt(value) % 12) + (newDate.getHours() >= 12 ? 12 : 0)
        )
      } else if (type === 'minute') {
        newDate.setMinutes(parseInt(value))
      } else if (type === 'ampm') {
        const currentHours = newDate.getHours()
        newDate.setHours(value === 'PM' ? currentHours + 12 : currentHours - 12)
      }
      setDate(newDate)
    }
  }

  return (
    <Popover
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open)
        if (!open && onBlur) {
          onBlur()
        }
      }}
    >
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className={cn(
            'w-full justify-start text-left font-normal',
            !date && 'text-muted-foreground',
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? (
            format(date, 'MM/dd/yyyy hh:mm aa')
          ) : (
            <span>MM/DD/YYYY hh:mm aa</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto p-0"
        onWheel={(e) => e.stopPropagation()}
      >
        <div className="flex">
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleDateSelect}
            autoFocus
          />
          <div className="flex h-[300px] divide-x">
            <ScrollArea className="w-16">
              <div className="flex flex-col p-2">
                {hours.reverse().map((hour) => (
                  <Button
                    key={hour}
                    type="button"
                    size="icon"
                    variant={
                      date && date.getHours() % 12 === hour % 12
                        ? 'default'
                        : 'ghost'
                    }
                    className="aspect-square w-full shrink-0"
                    onClick={() => handleTimeChange('hour', hour.toString())}
                  >
                    {hour}
                  </Button>
                ))}
              </div>
            </ScrollArea>
            <ScrollArea className="w-16">
              <div className="flex flex-col p-2">
                {Array.from({ length: 12 }, (_, i) => i * 5).map((minute) => (
                  <Button
                    key={minute}
                    type="button"
                    size="icon"
                    variant={
                      date && date.getMinutes() === minute ? 'default' : 'ghost'
                    }
                    className="aspect-square w-full shrink-0"
                    onClick={() =>
                      handleTimeChange('minute', minute.toString())
                    }
                  >
                    {minute}
                  </Button>
                ))}
              </div>
            </ScrollArea>
            <ScrollArea className="w-16">
              <div className="flex flex-col p-2">
                {['AM', 'PM'].map((ampm) => (
                  <Button
                    key={ampm}
                    type="button"
                    size="icon"
                    variant={
                      date &&
                      ((ampm === 'AM' && date.getHours() < 12) ||
                        (ampm === 'PM' && date.getHours() >= 12))
                        ? 'default'
                        : 'ghost'
                    }
                    className="aspect-square w-full shrink-0"
                    onClick={() => handleTimeChange('ampm', ampm)}
                  >
                    {ampm}
                  </Button>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
