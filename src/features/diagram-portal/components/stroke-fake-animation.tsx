import { cn } from '@/lib/utils'
import { ComponentProps, useEffect, useRef, useState } from 'react'

type StrokeFakeAnimationProps = ComponentProps<'svg'> & {
  borderColor?: string
  borderWidth?: number
  borderRadius?: number
  borderStyle?: 'solid' | 'dashed' | 'dotted'
  borderAnimationEnabled?: boolean
}

export function StrokeFakeAnimation({
  borderColor = 'transparent',
  borderWidth = 0,
  borderRadius = 0,
  borderStyle = 'solid',
  borderAnimationEnabled = false,
  className,
  ...props
}: StrokeFakeAnimationProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [svgHeight, setSvgHeight] = useState(0)
  const [svgWidth, setSvgWidth] = useState(0)

  useEffect(() => {
    const svg = svgRef.current!
    if (!svg) return

    function handleResize() {
      setSvgHeight(svg.clientHeight)
      setSvgWidth(svg.clientWidth)
    }

    const resizeObserver = new ResizeObserver(handleResize)
    resizeObserver.observe(svg)
    handleResize()

    return () => {
      resizeObserver.disconnect()
    }
  }, [])

  const halfStroke = borderWidth / 2
  const rx = Math.max(0, Math.min(borderRadius, svgWidth / 2) - halfStroke)
  const ry = Math.max(0, Math.min(borderRadius, svgHeight / 2) - halfStroke)

  const strokeDasharray =
    borderStyle === 'dashed'
      ? `${borderWidth * 2} ${borderWidth * 2}`
      : borderStyle === 'dotted'
        ? `${borderWidth} ${borderWidth}`
        : undefined

  return (
    <svg
      {...props}
      ref={svgRef}
      viewBox={`0 0 ${svgWidth} ${svgHeight}`}
      className={cn('pointer-events-none', className)}
    >
      <rect
        x={halfStroke}
        y={halfStroke}
        width={svgWidth - borderWidth}
        height={svgHeight - borderWidth}
        rx={rx}
        ry={ry}
        fill="none"
        stroke={borderColor}
        strokeWidth={borderWidth}
        strokeDasharray={strokeDasharray}
        style={{
          animation:
            borderAnimationEnabled && strokeDasharray
              ? 'stroke-fake-animation 8s linear infinite'
              : undefined,
        }}
      />

      <style
        dangerouslySetInnerHTML={{
          __html: /* css */ `
          @keyframes stroke-fake-animation {
            from { stroke-dashoffset: 0; }
            to { stroke-dashoffset: 100%; }
          }`,
        }}
      />
    </svg>
  )
}
