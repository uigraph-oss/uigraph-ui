'use client'

import { cn } from '@/lib/utils'
import {
  ComponentPropsWithoutRef,
  useLayoutEffect,
  useRef,
  useState,
} from 'react'

type DynamicScrollAreaProps = ComponentPropsWithoutRef<'div'> & {
  bottomOffset?: number
  topOffset?: number
}

export function DynamicScrollArea({
  bottomOffset = 0,
  topOffset = 0,
  className,
  children,
  ...props
}: DynamicScrollAreaProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  const [containerRect, setContainerRect] = useState<DOMRect | null>(null)
  const [windowHeight, setWindowHeight] = useState(0)

  useLayoutEffect(() => {
    const container = containerRef.current!
    if (!container) return

    function updatePosition() {
      setContainerRect(container.getBoundingClientRect())
    }

    function updateWindowHeight() {
      setWindowHeight(window.innerHeight)
    }

    window.addEventListener('resize', updateWindowHeight)

    document.addEventListener('scroll', updatePosition, true)
    container.addEventListener('scroll', updatePosition)

    const observer = new ResizeObserver(updatePosition)
    observer.observe(container)

    updateWindowHeight()
    updatePosition()

    return () => {
      window.removeEventListener('resize', updateWindowHeight)

      document.removeEventListener('scroll', updatePosition, true)
      container.removeEventListener('scroll', updatePosition)
      observer.unobserve(container)
    }
  }, [])

  return (
    <div
      ref={containerRef}
      {...props}
      className={cn('better-scrollbar', className)}
      style={{
        height:
          containerRect && windowHeight
            ? windowHeight -
              Math.max(0, topOffset, containerRect.y) -
              bottomOffset
            : undefined,
      }}
    >
      {children}
    </div>
  )
}
