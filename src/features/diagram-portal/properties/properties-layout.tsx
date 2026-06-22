import { ScrollArea } from '@/components/ui/scroll-area'
import { TooltipProvider } from '@/components/ui/tooltip'
import { ComponentMetaThemeProvider } from '@/features/component-meta/theme'
import { cn } from '@/lib/utils'
import { ComponentProps, useEffect, useRef, useState } from 'react'

export function PropertiesLayout({
  className,
  children,
  ...props
}: ComponentProps<'div'>) {
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
  }, [containerRef])

  return (
    <div ref={containerRef} className={'relative isolate'}>
      <div className="pointer-events-auto absolute inset-0 h-fit max-h-full rounded-b-[0.75rem] border border-t-0 border-[#2A3242] bg-[#141925]">
        <ScrollArea
          style={{ height: Math.min(contentHeight ?? 0, containerHeight ?? 0) }}
        >
          <div
            {...props}
            ref={contentRef}
            className={cn('w-[14.875rem] space-y-4 p-4 pt-2', className)}
          >
            <ComponentMetaThemeProvider theme="modal">
              <TooltipProvider>{children}</TooltipProvider>
            </ComponentMetaThemeProvider>
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}
