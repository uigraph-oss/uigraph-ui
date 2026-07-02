import { cn } from '@/lib/utils'
import {
  ComponentPropsWithoutRef,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'

type MinimalScrollInfo = {
  scrollHeight: number
  scrollWidth: number
  scrollLeft: number
  scrollTop: number
  height: number
  width: number
}

export function MinimalScroll({
  className,
  children,
  ...props
}: ComponentPropsWithoutRef<'div'>) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [info, setInfo] = useState<MinimalScrollInfo>({
    scrollHeight: 0,
    scrollWidth: 0,
    scrollLeft: 0,
    scrollTop: 0,
    height: 0,
    width: 0,
  })

  const [dragging, setDragging] = useState(false)
  const startYRef = useRef(0)
  const startScrollTopRef = useRef(0)

  const onThumbMouseDown = useCallback(
    (e: React.MouseEvent) => {
      setDragging(true)
      startYRef.current = e.clientY
      startScrollTopRef.current = info.scrollTop
      document.body.style.userSelect = 'none'
    },
    [info.scrollTop]
  )

  useEffect(() => {
    const container = containerRef.current!
    if (!container) return console.warn('Container ref is null')

    function handleChange() {
      setInfo({
        scrollHeight: container.scrollHeight,
        scrollWidth: container.scrollWidth,
        scrollLeft: container.scrollLeft,
        scrollTop: container.scrollTop,
        height: container.clientHeight,
        width: container.clientWidth,
      })
    }

    handleChange()

    const resizeObs = new ResizeObserver(handleChange)
    resizeObs.observe(container)

    const mutationObs = new MutationObserver(handleChange)
    mutationObs.observe(container, {
      childList: true,
      subtree: true,
    })

    window.addEventListener('scroll', handleChange)
    container.addEventListener('scroll', handleChange)

    return () => {
      resizeObs.disconnect()
      mutationObs.disconnect()

      window.removeEventListener('scroll', handleChange)
      container.removeEventListener('scroll', handleChange)
    }
  }, [])

  useEffect(() => {
    const container = containerRef.current!
    if (!container || !dragging) return

    function onMouseMove(e: MouseEvent) {
      const thumbHeight = (info.height / info.scrollHeight) * info.height
      const maxScroll = info.scrollHeight - info.height
      const deltaY = e.clientY - startYRef.current
      const scrollDelta = (deltaY / (info.height - thumbHeight)) * maxScroll
      container.scrollTop = Math.min(
        Math.max(startScrollTopRef.current + scrollDelta, 0),
        maxScroll
      )
    }

    function onMouseUp() {
      setDragging(false)
      document.body.style.userSelect = ''
    }

    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
    }
  }, [dragging, info.height, info.scrollHeight])

  return (
    <div
      ref={containerRef}
      className={cn('scrollbar-hidden relative overflow-auto', className)}
      {...props}
    >
      {children}

      {info.scrollHeight > info.height && (
        <div
          onMouseDown={onThumbMouseDown}
          className={cn(
            'absolute right-0 w-1 cursor-grab rounded bg-red-500 transition-[width] select-none hover:w-2 active:cursor-grabbing',
            dragging && 'w-2 cursor-grabbing'
          )}
          style={{
            top: `${info.scrollTop + (info.scrollTop / info.scrollHeight) * info.height}px`,
            height: `${(info.height / info.scrollHeight) * info.height}px`,
          }}
        />
      )}
    </div>
  )
}
