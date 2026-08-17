import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

export function StepHeader({
  icon,
  title,
  description,
}: {
  icon?: ReactNode
  title: string
  description: ReactNode
}) {
  return (
    <header className="shrink-0 pb-6 text-center">
      {icon && (
        <span className="bg-stock mx-auto mb-4 flex size-12 items-center justify-center rounded-2xl">
          {icon}
        </span>
      )}
      <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
      <p className="text-paragraph mx-auto mt-2 max-w-md text-sm leading-relaxed text-balance">
        {description}
      </p>
    </header>
  )
}

export function StepBody({
  className,
  children,
}: {
  className?: string
  children: ReactNode
}) {
  return <div className={cn('flex flex-col', className)}>{children}</div>
}

export function StepFooter({ children }: { children: ReactNode }) {
  return (
    <footer className="border-stock mt-6 flex shrink-0 items-center justify-between gap-3 border-t pt-5">
      {children}
    </footer>
  )
}
