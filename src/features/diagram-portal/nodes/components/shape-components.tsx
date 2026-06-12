export type ShapeSvgProps = {
  stroke?: string
  strokeWidth?: number
  strokeStyle?: 'solid' | 'dashed' | 'dotted'
  strokeOpacity?: number
  strokeAnimation?: 'none' | 'dash'

  fill?: string
  width?: number
  height?: number
  cornerRadius?: number
}

// Helper function to generate stroke animation styles
function getStrokeAnimationStyle(
  animation: string,
  _stroke: string
): React.CSSProperties {
  const baseStyle: React.CSSProperties = {
    paintOrder: 'stroke fill',
  }

  switch (animation) {
    case 'dash':
      return {
        ...baseStyle,
        animation: 'stroke-fake-animation 8s linear infinite',
      }
    default:
      return baseStyle
  }
}

export function RectangleShape({
  fill = 'transparent',
  stroke = '#1f2937',
  strokeWidth = 4,
  strokeOpacity = 1,
  strokeStyle = 'solid',
  strokeAnimation = 'none',
  cornerRadius = 12,
  height = 140,
  width = 200,
}: ShapeSvgProps) {
  const s = (Number(strokeWidth) || 0) / 2
  const strokeDasharray =
    strokeStyle === 'dashed'
      ? '8,4'
      : strokeStyle === 'dotted'
        ? '2,2'
        : undefined

  const animationStyle = getStrokeAnimationStyle(strokeAnimation, stroke)

  return (
    <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
      <rect
        x={s}
        y={s}
        width={width - s * 2}
        height={height - s * 2}
        rx={cornerRadius}
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeOpacity={strokeOpacity}
        strokeDasharray={strokeDasharray}
        style={animationStyle}
      />
    </svg>
  )
}

export function RoundedRectShape({
  fill = 'transparent',
  stroke = '#1f2937',
  strokeWidth = 4,
  strokeOpacity = 1,
  strokeStyle = 'solid',
  strokeAnimation = 'none',
  cornerRadius = 40,
  height = 140,
  width = 200,
}: ShapeSvgProps) {
  const s = (Number(strokeWidth) || 0) / 2
  const strokeDasharray =
    strokeStyle === 'dashed'
      ? '8,4'
      : strokeStyle === 'dotted'
        ? '2,2'
        : undefined

  const animationStyle = getStrokeAnimationStyle(strokeAnimation, stroke)

  return (
    <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
      <rect
        x={s}
        y={s}
        width={width - s * 2}
        height={height - s * 2}
        rx={cornerRadius}
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeOpacity={strokeOpacity}
        strokeDasharray={strokeDasharray}
        style={animationStyle}
      />
    </svg>
  )
}

export function EllipseShape({
  fill = 'transparent',
  stroke = '#1f2937',
  strokeWidth = 4,
  strokeOpacity = 1,
  strokeStyle = 'solid',
  strokeAnimation = 'none',
  height = 180,
  width = 180,
}: ShapeSvgProps) {
  const s = (Number(strokeWidth) || 0) / 2
  const cx = width / 2
  const cy = height / 2
  const rx = width / 2 - s
  const ry = height / 2 - s
  const strokeDasharray =
    strokeStyle === 'dashed'
      ? '8,4'
      : strokeStyle === 'dotted'
        ? '2,2'
        : undefined

  const animationStyle = getStrokeAnimationStyle(strokeAnimation, stroke)

  return (
    <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
      <ellipse
        cx={cx}
        cy={cy}
        rx={rx}
        ry={ry}
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeOpacity={strokeOpacity}
        strokeDasharray={strokeDasharray}
        style={animationStyle}
      />
    </svg>
  )
}

export function DiamondShape({
  fill = 'transparent',
  stroke = '#1f2937',
  strokeWidth = 4,
  strokeOpacity = 1,
  strokeStyle = 'solid',
  strokeAnimation = 'none',
  height = 200,
  width = 200,
}: ShapeSvgProps) {
  const s = (Number(strokeWidth) || 0) / 2
  const midX = width / 2
  const midY = height / 2
  const points = `${midX} ${s}, ${width - s} ${midY}, ${midX} ${height - s}, ${s} ${midY}`
  const strokeDasharray =
    strokeStyle === 'dashed'
      ? '8,4'
      : strokeStyle === 'dotted'
        ? '2,2'
        : undefined

  const animationStyle = getStrokeAnimationStyle(strokeAnimation, stroke)

  return (
    <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
      <polygon
        points={points}
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeOpacity={strokeOpacity}
        strokeDasharray={strokeDasharray}
        style={animationStyle}
      />
    </svg>
  )
}

export function TriangleShape({
  fill = 'transparent',
  stroke = '#1f2937',
  strokeWidth = 4,
  strokeOpacity = 1,
  strokeStyle = 'solid',
  strokeAnimation = 'none',
  height = 180,
  width = 220,
}: ShapeSvgProps) {
  const s = (Number(strokeWidth) || 0) / 2
  const apexX = width / 2
  const points = `${apexX} ${s}, ${width - s} ${height - s}, ${s} ${height - s}`
  const strokeDasharray =
    strokeStyle === 'dashed'
      ? '8,4'
      : strokeStyle === 'dotted'
        ? '2,2'
        : undefined

  const animationStyle = getStrokeAnimationStyle(strokeAnimation, stroke)

  return (
    <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
      <polygon
        points={points}
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeOpacity={strokeOpacity}
        strokeDasharray={strokeDasharray}
        style={animationStyle}
      />
    </svg>
  )
}

export function ParallelogramShape({
  fill = 'transparent',
  stroke = '#1f2937',
  strokeWidth = 4,
  strokeOpacity = 1,
  strokeStyle = 'solid',
  strokeAnimation = 'none',
  height = 140,
  width = 220,
}: ShapeSvgProps) {
  const s = (Number(strokeWidth) || 0) / 2
  const points = `${30 + s} ${s}, ${width - s} ${s}, ${width - 30 - s} ${height - s}, ${s} ${height - s}`
  const strokeDasharray =
    strokeStyle === 'dashed'
      ? '8,4'
      : strokeStyle === 'dotted'
        ? '2,2'
        : undefined

  const animationStyle = getStrokeAnimationStyle(strokeAnimation, stroke)

  return (
    <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
      <polygon
        points={points}
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeOpacity={strokeOpacity}
        strokeDasharray={strokeDasharray}
        style={animationStyle}
      />
    </svg>
  )
}

export function TrapezoidShape({
  fill = 'transparent',
  stroke = '#1f2937',
  strokeWidth = 4,
  strokeOpacity = 1,
  strokeStyle = 'solid',
  strokeAnimation = 'none',
  height = 140,
  width = 220,
}: ShapeSvgProps) {
  const s = (Number(strokeWidth) || 0) / 2
  const points = `${40 + s} ${s}, ${width - 40 - s} ${s}, ${width - s} ${height - s}, ${s} ${height - s}`
  const strokeDasharray =
    strokeStyle === 'dashed'
      ? '8,4'
      : strokeStyle === 'dotted'
        ? '2,2'
        : undefined

  const animationStyle = getStrokeAnimationStyle(strokeAnimation, stroke)

  return (
    <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
      <polygon
        points={points}
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeOpacity={strokeOpacity}
        strokeDasharray={strokeDasharray}
        style={animationStyle}
      />
    </svg>
  )
}

export function HexagonShape({
  fill = 'transparent',
  stroke = '#1f2937',
  strokeWidth = 4,
  strokeOpacity = 1,
  strokeStyle = 'solid',
  strokeAnimation = 'none',
  height = 140,
  width = 220,
}: ShapeSvgProps) {
  const s = (Number(strokeWidth) || 0) / 2
  const points = `${40 + s} ${s}, ${width - 40 - s} ${s}, ${width - s} 70, ${width - 40 - s} ${height - s}, ${40 + s} ${height - s}, ${s} 70`
  const strokeDasharray =
    strokeStyle === 'dashed'
      ? '8,4'
      : strokeStyle === 'dotted'
        ? '2,2'
        : undefined

  const animationStyle = getStrokeAnimationStyle(strokeAnimation, stroke)

  return (
    <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
      <polygon
        points={points}
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeOpacity={strokeOpacity}
        strokeDasharray={strokeDasharray}
        style={animationStyle}
      />
    </svg>
  )
}

export function DocumentShape({
  fill = 'transparent',
  stroke = '#1f2937',
  strokeWidth = 4,
  strokeOpacity = 1,
  strokeStyle = 'solid',
  strokeAnimation = 'none',
  height = 160,
  width = 220,
}: ShapeSvgProps) {
  const s = (Number(strokeWidth) || 0) / 2
  const bottomY = height - s
  const waveAmp = Math.max(0, Math.min(height, width) * 0.12)
  const d = `M ${s} ${s} H ${width - s} V ${bottomY}
    Q ${width * 0.75} ${bottomY - waveAmp}, ${width * 0.5} ${bottomY}
    Q ${width * 0.25} ${bottomY - waveAmp}, ${s} ${bottomY} Z`
  const strokeDasharray =
    strokeStyle === 'dashed'
      ? '8,4'
      : strokeStyle === 'dotted'
        ? '2,2'
        : undefined

  const animationStyle = getStrokeAnimationStyle(strokeAnimation, stroke)

  return (
    <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
      <path
        d={d}
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeOpacity={strokeOpacity}
        strokeDasharray={strokeDasharray}
        style={animationStyle}
      />
    </svg>
  )
}

export function CylinderShape({
  fill = 'transparent',
  stroke = '#1f2937',
  strokeWidth = 4,
  strokeOpacity = 1,
  strokeStyle = 'solid',
  strokeAnimation = 'none',
  height = 160,
  width = 220,
}: ShapeSvgProps) {
  const s = (Number(strokeWidth) || 0) / 2
  const cx = width / 2
  const rx = Math.max(0, width / 2 - s)
  const maxVertical = Math.max(0, height - 2 * s)
  const ry = Math.max(1, Math.min(maxVertical * 0.18, rx))
  const topY = s + ry
  const bottomY = height - s - ry
  const strokeDasharray =
    strokeStyle === 'dashed'
      ? '8,4'
      : strokeStyle === 'dotted'
        ? '2,2'
        : undefined

  const animationStyle = getStrokeAnimationStyle(strokeAnimation, stroke)

  return (
    <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
      <rect
        x={s}
        y={topY}
        width={width - s * 2}
        height={bottomY - topY}
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeOpacity={strokeOpacity}
        strokeDasharray={strokeDasharray}
        style={animationStyle}
      />
      <ellipse
        cx={cx}
        cy={topY}
        rx={rx}
        ry={ry}
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeOpacity={strokeOpacity}
        strokeDasharray={strokeDasharray}
        style={animationStyle}
      />
      <ellipse
        cx={cx}
        cy={bottomY}
        rx={rx}
        ry={ry}
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeOpacity={strokeOpacity}
        strokeDasharray={strokeDasharray}
        style={animationStyle}
      />
    </svg>
  )
}

export function DelayShape({
  fill = 'transparent',
  stroke = '#1f2937',
  strokeWidth = 4,
  strokeOpacity = 1,
  strokeStyle = 'solid',
  strokeAnimation = 'none',
  height = 140,
  width = 220,
}: ShapeSvgProps) {
  const s = (Number(strokeWidth) || 0) / 2
  const r = Math.max(0, Math.min((height - 2 * s) / 2, (width - 2 * s) / 2))
  const d = `M ${s} ${s} H ${width - r - s} A ${r} ${r} 0 0 1 ${width - r - s} ${height - s} H ${s} Z`
  const strokeDasharray =
    strokeStyle === 'dashed'
      ? '8,4'
      : strokeStyle === 'dotted'
        ? '2,2'
        : undefined
  return (
    <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
      <path
        d={d}
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeOpacity={strokeOpacity}
        strokeDasharray={strokeDasharray}
        style={getStrokeAnimationStyle(strokeAnimation, stroke)}
      />
    </svg>
  )
}

export function OffPageConnectorShape({
  fill = 'transparent',
  stroke = '#1f2937',
  strokeWidth = 4,
  strokeOpacity = 1,
  strokeStyle = 'solid',
  strokeAnimation = 'none',
  height = 180,
  width = 180,
}: ShapeSvgProps) {
  const s = (Number(strokeWidth) || 0) / 2
  const midX = width / 2
  const midY = height / 2
  const points = `${s} ${s}, ${width - s} ${s}, ${width - s} ${midY}, ${midX} ${height - s}, ${s} ${midY}`
  const strokeDasharray =
    strokeStyle === 'dashed'
      ? '8,4'
      : strokeStyle === 'dotted'
        ? '2,2'
        : undefined
  return (
    <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
      <polygon
        points={points}
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeOpacity={strokeOpacity}
        strokeDasharray={strokeDasharray}
        style={getStrokeAnimationStyle(strokeAnimation, stroke)}
      />
    </svg>
  )
}

export function TerminatorShape({
  fill = 'transparent',
  stroke = '#1f2937',
  strokeWidth = 4,
  strokeOpacity = 1,
  strokeStyle = 'solid',
  strokeAnimation = 'none',
  height = 60,
  width = 160,
}: ShapeSvgProps) {
  const s = (Number(strokeWidth) || 0) / 2
  const rx = Math.max(0, Math.min((height - s * 2) / 2, (width - s * 2) / 2))
  const strokeDasharray =
    strokeStyle === 'dashed'
      ? '8,4'
      : strokeStyle === 'dotted'
        ? '2,2'
        : undefined

  return (
    <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
      <rect
        x={s}
        y={s}
        width={width - s * 2}
        height={height - s * 2}
        rx={rx}
        ry={rx}
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeOpacity={strokeOpacity}
        strokeDasharray={strokeDasharray}
        style={getStrokeAnimationStyle(strokeAnimation, stroke)}
      />
    </svg>
  )
}

export function MultipleDocumentsShape({
  fill = 'transparent',
  stroke = '#1f2937',
  strokeWidth = 4,
  strokeOpacity = 1,
  strokeStyle = 'solid',
  strokeAnimation = 'none',
  cornerRadius = 6,
  height = 80,
  width = 140,
}: ShapeSvgProps) {
  const s = (Number(strokeWidth) || 0) / 2
  const offset = Math.min(12, Math.min(width, height) * 0.08)
  const strokeDasharray =
    strokeStyle === 'dashed'
      ? '8,4'
      : strokeStyle === 'dotted'
        ? '2,2'
        : undefined

  return (
    <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
      <rect
        x={s + offset}
        y={s + offset}
        width={width - s * 2 - offset}
        height={height - s * 2 - offset}
        rx={cornerRadius}
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeOpacity={strokeOpacity}
        strokeDasharray={strokeDasharray}
        style={getStrokeAnimationStyle(strokeAnimation, stroke)}
      />
      <rect
        x={s + offset / 2}
        y={s + offset / 2}
        width={width - s * 2 - offset / 2}
        height={height - s * 2 - offset / 2}
        rx={cornerRadius}
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeOpacity={strokeOpacity}
        strokeDasharray={strokeDasharray}
        style={getStrokeAnimationStyle(strokeAnimation, stroke)}
      />
      <rect
        x={s}
        y={s}
        width={width - s * 2}
        height={height - s * 2}
        rx={cornerRadius}
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeOpacity={strokeOpacity}
        strokeDasharray={strokeDasharray}
        style={getStrokeAnimationStyle(strokeAnimation, stroke)}
      />
    </svg>
  )
}

export function SubroutineShape({
  fill = 'transparent',
  stroke = '#1f2937',
  strokeWidth = 4,
  strokeOpacity = 1,
  strokeStyle = 'solid',
  strokeAnimation = 'none',
  cornerRadius = 6,
  height = 100,
  width = 160,
}: ShapeSvgProps) {
  const s = (Number(strokeWidth) || 0) / 2
  const innerLineW = Math.max(2, Math.min(8, strokeWidth))
  const inset = Math.max(8, width * 0.06)
  const strokeDasharray =
    strokeStyle === 'dashed'
      ? '8,4'
      : strokeStyle === 'dotted'
        ? '2,2'
        : undefined

  return (
    <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
      <rect
        x={s}
        y={s}
        width={width - s * 2}
        height={height - s * 2}
        rx={cornerRadius}
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeOpacity={strokeOpacity}
        strokeDasharray={strokeDasharray}
        style={getStrokeAnimationStyle(strokeAnimation, stroke)}
      />
      <rect
        x={s + inset}
        y={s + 6}
        width={innerLineW}
        height={height - s * 2 - 12}
        fill={stroke}
      />
      <rect
        x={width - s - inset - innerLineW}
        y={s + 6}
        width={innerLineW}
        height={height - s * 2 - 12}
        fill={stroke}
      />
    </svg>
  )
}

export function ManualInputShape({
  fill = 'transparent',
  stroke = '#1f2937',
  strokeWidth = 4,
  strokeOpacity = 1,
  strokeStyle = 'solid',
  strokeAnimation = 'none',
  height = 100,
  width = 160,
}: ShapeSvgProps) {
  const s = (Number(strokeWidth) || 0) / 2
  const slant = Math.min(40, width * 0.12)
  const strokeDasharray =
    strokeStyle === 'dashed'
      ? '8,4'
      : strokeStyle === 'dotted'
        ? '2,2'
        : undefined

  const topLeftY = s + slant
  const points = `${s} ${topLeftY}, ${width - s} ${s}, ${width - s} ${height - s}, ${s} ${height - s}`

  const animationStyle = getStrokeAnimationStyle(strokeAnimation, stroke)

  return (
    <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
      <polygon
        points={points}
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeOpacity={strokeOpacity}
        strokeDasharray={strokeDasharray}
        style={animationStyle}
      />
    </svg>
  )
}

export function SummingJunctionShape({
  fill = 'transparent',
  stroke = '#1f2937',
  strokeWidth = 4,
  strokeOpacity = 1,
  strokeStyle = 'solid',
  strokeAnimation = 'none',
  height = 100,
  width = 100,
}: ShapeSvgProps) {
  const s = (Number(strokeWidth) || 0) / 2
  const cx = width / 2
  const cy = height / 2
  const r = Math.max(0, Math.min(width, height) / 2 - s)
  const arm = r * 0.7
  const strokeDasharray =
    strokeStyle === 'dashed'
      ? '8,4'
      : strokeStyle === 'dotted'
        ? '2,2'
        : undefined

  const animationStyle = getStrokeAnimationStyle(strokeAnimation, stroke)

  return (
    <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeOpacity={strokeOpacity}
        strokeDasharray={strokeDasharray}
        style={animationStyle}
      />
      <line
        x1={cx - arm}
        y1={cy - arm}
        x2={cx + arm}
        y2={cy + arm}
        stroke={stroke}
        strokeWidth={Math.max(1, strokeWidth / 1.5)}
        strokeOpacity={strokeOpacity}
        strokeLinecap="round"
        style={animationStyle}
      />
      <line
        x1={cx - arm}
        y1={cy + arm}
        x2={cx + arm}
        y2={cy - arm}
        stroke={stroke}
        strokeWidth={Math.max(1, strokeWidth / 1.5)}
        strokeOpacity={strokeOpacity}
        strokeLinecap="round"
        style={animationStyle}
      />
    </svg>
  )
}

export function InternalStorageShape({
  fill = 'transparent',
  stroke = '#1f2937',
  strokeWidth = 4,
  strokeOpacity = 1,
  strokeStyle = 'solid',
  strokeAnimation = 'none',
  cornerRadius = 6,
  height = 100,
  width = 140,
}: ShapeSvgProps) {
  const s = (Number(strokeWidth) || 0) / 2
  const lineW = Math.max(2, Math.min(8, strokeWidth))
  const gap = Math.max(6, width * 0.04)
  const strokeDasharray =
    strokeStyle === 'dashed'
      ? '8,4'
      : strokeStyle === 'dotted'
        ? '2,2'
        : undefined

  return (
    <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
      <rect
        x={s}
        y={s}
        width={width - s * 2}
        height={height - s * 2}
        rx={cornerRadius}
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeOpacity={strokeOpacity}
        strokeDasharray={strokeDasharray}
        style={getStrokeAnimationStyle(strokeAnimation, stroke)}
      />
      <rect
        x={s}
        y={s + 6}
        width={width - s * 2}
        height={Math.max(2, strokeWidth / 1.5)}
        fill={stroke}
      />
      <rect
        x={width - gap - lineW}
        y={s + 8}
        width={lineW}
        height={height - s * 2 - 16}
        fill={stroke}
      />
      <rect
        x={width - gap * 2 - lineW * 2}
        y={s + 8}
        width={lineW}
        height={height - s * 2 - 16}
        fill={stroke}
      />
    </svg>
  )
}

export function CollateShape({
  fill = 'transparent',
  stroke = '#1f2937',
  strokeWidth = 4,
  strokeOpacity = 1,
  strokeStyle = 'solid',
  strokeAnimation = 'none',
  height = 140,
  width = 140,
}: ShapeSvgProps) {
  const s = (Number(strokeWidth) || 0) / 2
  const strokeDasharray =
    strokeStyle === 'dashed'
      ? '8,4'
      : strokeStyle === 'dotted'
        ? '2,2'
        : undefined

  const up = `${s} ${s}, ${width - s} ${s}, ${width / 2} ${height / 2}`
  const down = `${s} ${height - s}, ${width - s} ${height - s}, ${width / 2} ${height / 2}`

  return (
    <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
      <polygon
        points={up}
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeOpacity={strokeOpacity}
        strokeDasharray={strokeDasharray}
        style={getStrokeAnimationStyle(strokeAnimation, stroke)}
      />
      <polygon
        points={down}
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeOpacity={strokeOpacity}
        strokeDasharray={strokeDasharray}
        style={getStrokeAnimationStyle(strokeAnimation, stroke)}
      />
    </svg>
  )
}

export function SortShape({
  fill = 'transparent',
  stroke = '#1f2937',
  strokeWidth = 4,
  strokeOpacity = 1,
  strokeStyle = 'solid',
  strokeAnimation = 'none',
  height = 140,
  width = 140,
}: ShapeSvgProps) {
  const s = (Number(strokeWidth) || 0) / 2
  const midX = width / 2
  const midY = height / 2
  const strokeDasharray =
    strokeStyle === 'dashed'
      ? '8,4'
      : strokeStyle === 'dotted'
        ? '2,2'
        : undefined

  const outer = `${midX} ${s}, ${width - s} ${midY}, ${midX} ${height - s}, ${s} ${midY}`
  const inset = Math.min(width - 2 * s, height - 2 * s) * 0.22
  const inner = `${midX} ${s + inset}, ${width - s - inset} ${midY}, ${midX} ${height - s - inset}, ${s + inset} ${midY}`

  return (
    <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
      <polygon
        points={outer}
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeOpacity={strokeOpacity}
        strokeDasharray={strokeDasharray}
        style={getStrokeAnimationStyle(strokeAnimation, stroke)}
      />
      <polygon
        points={inner}
        fill="none"
        stroke={stroke}
        strokeWidth={Math.max(1, strokeWidth / 1.5)}
        strokeOpacity={strokeOpacity}
      />
    </svg>
  )
}

export function OrShape({
  fill = 'transparent',
  stroke = '#1f2937',
  strokeWidth = 4,
  strokeOpacity = 1,
  strokeStyle = 'solid',
  strokeAnimation = 'none',
  height = 100,
  width = 100,
}: ShapeSvgProps) {
  const s = (Number(strokeWidth) || 0) / 2
  const cx = width / 2
  const cy = height / 2
  const r = Math.max(0, Math.min(width, height) / 2 - s)
  const arm = r * 0.7
  const strokeDasharray =
    strokeStyle === 'dashed'
      ? '8,4'
      : strokeStyle === 'dotted'
        ? '2,2'
        : undefined

  return (
    <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeOpacity={strokeOpacity}
        strokeDasharray={strokeDasharray}
        style={getStrokeAnimationStyle(strokeAnimation, stroke)}
      />
      <line
        x1={cx - arm}
        y1={cy}
        x2={cx + arm}
        y2={cy}
        stroke={stroke}
        strokeWidth={Math.max(1, strokeWidth / 1.5)}
        strokeOpacity={strokeOpacity}
        strokeLinecap="round"
      />
      <line
        x1={cx}
        y1={cy - arm}
        x2={cx}
        y2={cy + arm}
        stroke={stroke}
        strokeWidth={Math.max(1, strokeWidth / 1.5)}
        strokeOpacity={strokeOpacity}
        strokeLinecap="round"
      />
    </svg>
  )
}

export function DatabaseShape({
  fill = 'transparent',
  stroke = '#1f2937',
  strokeWidth = 4,
  strokeOpacity = 1,
  strokeStyle = 'solid',
  strokeAnimation = 'none',
  height = 400,
  width = 220,
}: ShapeSvgProps) {
  const s = (Number(strokeWidth) || 0) / 2
  const cx = width / 2
  const rx = Math.max(0, width / 2 - s)
  const maxRy = Math.max(1, (height - 2 * s) / 2 - 1)
  const desiredRy = Math.max(2, (width - 2 * s) * 0.18)
  const ry = Math.min(desiredRy, maxRy)
  const topY = s + ry
  const bottomY = height - s - ry
  const strokeDasharray =
    strokeStyle === 'dashed'
      ? '8,4'
      : strokeStyle === 'dotted'
        ? '2,2'
        : undefined

  return (
    <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
      <rect
        x={s}
        y={topY}
        width={width - s * 2}
        height={bottomY - topY}
        fill={fill}
        stroke="none"
      />
      <line
        x1={s}
        y1={topY}
        x2={s}
        y2={bottomY}
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeOpacity={strokeOpacity}
        strokeDasharray={strokeDasharray}
        style={getStrokeAnimationStyle(strokeAnimation, stroke)}
      />
      <line
        x1={width - s}
        y1={topY}
        x2={width - s}
        y2={bottomY}
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeOpacity={strokeOpacity}
        strokeDasharray={strokeDasharray}
        style={getStrokeAnimationStyle(strokeAnimation, stroke)}
      />
      <ellipse
        cx={cx}
        cy={topY}
        rx={rx}
        ry={ry}
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeOpacity={strokeOpacity}
        strokeDasharray={strokeDasharray}
        style={getStrokeAnimationStyle(strokeAnimation, stroke)}
      />
      <ellipse
        cx={cx}
        cy={bottomY}
        rx={rx}
        ry={ry}
        fill="none"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeOpacity={strokeOpacity}
        strokeDasharray={strokeDasharray}
        style={getStrokeAnimationStyle(strokeAnimation, stroke)}
      />
    </svg>
  )
}

export function DisplayShape({
  fill = 'transparent',
  stroke = '#1f2937',
  strokeWidth = 4,
  strokeOpacity = 1,
  strokeStyle = 'solid',
  strokeAnimation = 'none',
  height = 140,
  width = 220,
}: ShapeSvgProps) {
  const s = (Number(strokeWidth) || 0) / 2
  const d = `M ${s} ${s} H ${width - 40 - s} Q ${width - s} ${height / 2} ${width - 40 - s} ${height - s} H ${s} Z`
  const strokeDasharray =
    strokeStyle === 'dashed'
      ? '8,4'
      : strokeStyle === 'dotted'
        ? '2,2'
        : undefined
  return (
    <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
      <path
        d={d}
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeOpacity={strokeOpacity}
        strokeDasharray={strokeDasharray}
        style={getStrokeAnimationStyle(strokeAnimation, stroke)}
      />
    </svg>
  )
}
