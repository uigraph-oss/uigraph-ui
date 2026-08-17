import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

export const fieldClass = 'h-[2.7938125rem] rounded-[0.80315625rem]'

export const compactButtonClass =
  'h-9 rounded-[0.625rem] px-3 has-[>svg]:px-3 text-sm'

export const codeClass =
  'bg-stock/70 rounded px-1.5 py-0.5 font-mono text-[0.6875rem]'

export const scrollAreaClass = 'better-scrollbar min-h-0 flex-1 overflow-y-auto'

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
  return (
    <div className={cn('flex min-h-0 flex-1 flex-col', className)}>
      {children}
    </div>
  )
}

export function StepFooter({ children }: { children: ReactNode }) {
  return (
    <footer className="border-stock mt-6 flex shrink-0 items-center justify-between gap-3 border-t pt-5">
      {children}
    </footer>
  )
}
