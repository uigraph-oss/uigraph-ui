import { cn } from '@/lib/utils'
import { ComponentProps } from 'react'

export function SuperCircleLoader({
  loading,
  className,
  ...props
}: ComponentProps<'div'> & { loading?: boolean }) {
  if (loading === false) return null

  return (
    <div
      {...props}
      // eslint-disable-next-line jsx-a11y/aria-role
      role="svg"
      className={cn(
        'size-[1em] animate-[spin_1s_linear_infinite] rounded-full border-2 border-solid border-[currentColor] border-r-white/20',
        className
      )}
    />
  )
}
