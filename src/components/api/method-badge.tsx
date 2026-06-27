import { cn } from '@/lib/utils'
import { ComponentProps } from 'react'

export function MethodBadge({
  method,
  className,
  ...props
}: ComponentProps<'span'> & { method: string }) {
  const m = method?.toLowerCase()
  return (
    <span
      {...props}
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded px-1.5 py-0.5 text-[10px] font-bold tracking-wider uppercase',

        'bg-slate-500/15 text-slate-300',
        m === 'get' && 'bg-sky-500/15 text-sky-400',
        m === 'post' && 'bg-emerald-500/15 text-emerald-400',
        m === 'put' && 'bg-amber-500/15 text-amber-400',
        m === 'patch' && 'bg-violet-500/15 text-violet-400',
        m === 'delete' && 'bg-rose-500/15 text-rose-400',

        className
      )}
    >
      {method?.toUpperCase()}
    </span>
  )
}
