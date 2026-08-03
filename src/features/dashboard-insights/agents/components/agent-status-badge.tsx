import { cn } from '@/lib/utils'
import { CheckCircle2, CircleSlash, Loader2, XCircle } from 'lucide-react'

const statusStyles = {
  running: {
    label: 'Running',
    icon: Loader2,
    className: 'bg-primary/10 text-primary',
    spin: true,
  },
  completed: {
    label: 'Completed',
    icon: CheckCircle2,
    className: 'bg-success/10 text-success',
    spin: false,
  },
  failed: {
    label: 'Failed',
    icon: XCircle,
    className: 'bg-destructive/10 text-destructive',
    spin: false,
  },
  cancelled: {
    label: 'Cancelled',
    icon: CircleSlash,
    className: 'bg-muted/40 text-paragraph',
    spin: false,
  },
} as const

export function AgentStatusBadge({ status }: { status: string }) {
  const style = statusStyles[status as keyof typeof statusStyles]

  if (!style) {
    return (
      <span className="bg-muted/40 text-paragraph inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium">
        {status}
      </span>
    )
  }

  const Icon = style.icon

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium',
        style.className
      )}
    >
      <Icon className={cn('size-3.5', style.spin && 'animate-spin')} />
      {style.label}
    </span>
  )
}
