import clsx from 'clsx'

interface CircleLoaderProps {
  size?: 'sm' | 'md' | 'lg' | number
  color?: string
}

const sizeClasses = {
  sm: 'w-4 h-4 border-2',
  md: 'w-6 h-6 border-3',
  lg: 'w-10 h-10 border-4',
}

export function CircleLoader({
  size = 'md',
  color = 'blue',
}: CircleLoaderProps) {
  const isNumericSize = typeof size === 'number'

  const dimensionStyle = isNumericSize
    ? {
        width: `${size}px`,
        height: `${size}px`,
        borderWidth: `${Math.max(2, size / 7)}px`,
      }
    : undefined

  return (
    <div
      style={{
        ...dimensionStyle,
        borderColor: `${color}20`,
        borderRightColor: color,
      }}
      className={clsx(
        'animate-[spin_1s_linear_infinite] rounded-full border-solid',
        !isNumericSize && sizeClasses[size]
      )}
    ></div>
  )
}
