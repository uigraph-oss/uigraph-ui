import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { ComponentPropsWithoutRef, useEffect, useRef, useState } from 'react'

export function SidebarLayout({
  children,
  className,
  ...props
}: ComponentPropsWithoutRef<'div'>) {
  const contentRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const [contentHeight, setContentHeight] = useState<number>()
  const [containerHeight, setContainerHeight] = useState<number>()

  useEffect(() => {
    const content = contentRef.current!
    if (!content) return

    const container = containerRef.current!
    if (!container) return

    const observer = new ResizeObserver(() => {
      setContainerHeight(container.clientHeight)
      setContentHeight(content.clientHeight)
    })

    setContainerHeight(container.clientHeight)
    setContentHeight(content.clientHeight)
    observer.observe(container)
    observer.observe(content)
    return () => observer.disconnect()
  }, [contentRef, containerRef])

  return (
    <div
      ref={containerRef}
      className={cn(
        'pointer-events-none absolute inset-4 right-auto select-none',
        className
      )}
      {...props}
    >
      <ScrollArea
        className={'border-stock bg-card rounded-[0.75rem] border'}
        style={{
          height: Math.min(contentHeight ?? 0, containerHeight ?? 0) + 2,
        }}
      >
        <div ref={contentRef} className={'pointer-events-auto'}>
          {children}
        </div>
      </ScrollArea>
    </div>
  )
}
