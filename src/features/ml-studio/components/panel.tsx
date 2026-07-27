import { cn } from '@/lib/utils'
import { ReactNode } from 'react'

export function Panel({
  title,
  icon,
  description,
  action,
  className,
  children,
}: {
  title?: string
  icon?: ReactNode
  description?: ReactNode
  action?: ReactNode
  className?: string
  children: ReactNode
}) {
  return (
    <div
      className={cn(
        'border-stock bg-card flex flex-col gap-4 rounded-xl border px-5 py-4',
        className
      )}
    >
      {(title || action) && (
        <div className="flex items-start justify-between gap-3">
          <div>
            {title && (
              <h3 className="flex items-center gap-2 font-semibold text-[#F4F7FC]">
                {icon && <span className="text-[#828DA3]">{icon}</span>}
                {title}
              </h3>
            )}
            {description && (
              <p className="mt-0.5 text-sm text-[#828DA3]">{description}</p>
            )}
          </div>
          {action}
        </div>
      )}
      {children}
    </div>
  )
}

export function InfoRow({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs tracking-wide text-[#586378] uppercase">
        {label}
      </span>
      <span className="text-sm text-[#F4F7FC]">{children}</span>
    </div>
  )
}
