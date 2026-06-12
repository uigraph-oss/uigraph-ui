import { cn } from '@/lib/utils'
import { ComponentProps } from 'react'

export function SectionNotFound({
  label,
  plain,
  className,
  ...props
}: Omit<ComponentProps<'div'>, 'children'> & {
  label?: string
  plain?: boolean
}) {
  return (
    <div
      {...props}
      className={cn(
        'border-stock flex h-[400px] flex-col items-center justify-center gap-4 rounded-[28px] border border-dashed bg-white text-center',
        plain && 'border-none bg-transparent',
        className
      )}
    >
      <p className="text-paragraph/60 text-lg font-medium">{label}</p>
    </div>
  )
}
