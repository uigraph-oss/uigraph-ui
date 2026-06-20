import { cn } from '@/lib/utils'
import { ReactNode } from 'react'

export function ServerSectionHeader({
  title,
  description,
  cta,
  className,
}: {
  title: string
  description: string
  cta?: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'border-stock flex h-[6.1rem] items-center justify-between border-b px-6',
        className
      )}
    >
      <div>
        <h2 className="mb-[0.6rem] text-[1rem] leading-[1.33] font-semibold">
          {title}
        </h2>

        <p className="text-paragraph mb-1.5 text-sm leading-[1.33] font-normal">
          {description}
        </p>
      </div>

      {cta && <div>{cta}</div>}
    </div>
  )
}
