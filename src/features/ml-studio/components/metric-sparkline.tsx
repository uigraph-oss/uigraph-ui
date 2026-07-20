import type { MetricPoint } from '../types'

export function MetricSparkline({
  points,
  color = '#3B6BFF',
  width = 96,
  height = 28,
}: {
  points: MetricPoint[]
  color?: string
  width?: number
  height?: number
}) {
  if (points.length === 0) {
    return <span className="text-xs text-[#586378]">—</span>
  }

  const values = points.map((p) => p.value)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1

  const step = width / (points.length - 1 || 1)
  const path = points
    .map((p, i) => {
      const x = i * step
      const y = height - ((p.value - min) / range) * height
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(' ')

  return (
    <svg width={width} height={height} className="overflow-visible">
      <path d={path} fill="none" stroke={color} strokeWidth={1.5} />
    </svg>
  )
}
