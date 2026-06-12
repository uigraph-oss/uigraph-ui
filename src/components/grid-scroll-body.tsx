'use client'

/* eslint-disable react/no-unknown-property */
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { ReactNode } from 'react'

export function GridScrollBody({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <ScrollArea className={cn('!relative !isolate', className)}>
      {children}

      <style jsx global>
        {`
          [data-radix-scroll-area-viewport],
          [data-radix-scroll-area-viewport] > div {
            position: absolute !important;
            inset: 0 !important;

            width: 100% !important;
            height: 100% !important;
            overflow: auto !important;
          }

          [data-radix-scroll-area-viewport] > div {
            display: contents !important;
          }
        `}
      </style>
    </ScrollArea>
  )
}
