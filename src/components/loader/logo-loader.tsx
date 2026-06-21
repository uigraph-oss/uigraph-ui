import { UigraphMark } from '@/components/logo'

export function LogoLoader({ width = 128 }) {
  const height = width
  const ringSize = width + 16

  return (
    <div
      className="relative"
      style={{ width: `${width}px`, height: `${height}px` }}
    >
      {/* Spinning Ring */}
      <div
        className="absolute animate-spin rounded-full border-2 border-white/10 border-t-white/40 opacity-30"
        style={{
          width: `${ringSize}px`,
          height: `${ringSize}px`,
          top: '-8px',
          left: '-8px',
        }}
      />

      {/* Logo */}
      <div className="flex h-full w-full items-center justify-center">
        <UigraphMark size={width} />
      </div>
    </div>
  )
}
