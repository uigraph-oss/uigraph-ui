import { cn } from '@/lib/utils'

const sizes = {
  none: { px: 64 },
  xs: { px: 64 },
  sm: { px: 96 },
  md: { px: 128 },
  lg: { px: 160 },
  xl: { px: 192 },
}

type SuperLogoLoaderProps = {
  size?: keyof typeof sizes
  className?: string
}

export function SuperLogoLoader({
  size = 'md',
  className,
}: SuperLogoLoaderProps) {
  const { px } = sizes[size]
  const ringSize = px + 16

  return (
    <div
      className={cn('relative', className)}
      style={{ width: `${px}px`, height: `${px}px` }}
    >
      {/* Spinning Ring */}
      <div
        className="border-primary/10 border-t-primary/40 absolute animate-spin rounded-full border-2"
        style={{
          width: `${ringSize}px`,
          height: `${ringSize}px`,
          top: '-8px',
          left: '-8px',
        }}
      />

      {/* Logo */}
      <div className="flex h-full w-full items-center justify-center">
        <img
          src="/icons/icon-blue-256.png"
          alt="UIGraph"
          width={px}
          height={px}
          className="animate-pulse rounded-full"
        />
      </div>
    </div>
  )
}
