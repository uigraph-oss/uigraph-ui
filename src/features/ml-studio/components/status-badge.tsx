import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

const colorMap: Record<string, string> = {
  active: 'bg-[#21AD6D]/15 text-[#3BD68E] border border-[#21AD6D]/30',
  released: 'bg-[#21AD6D]/15 text-[#3BD68E] border border-[#21AD6D]/30',
  completed: 'bg-[#21AD6D]/15 text-[#3BD68E] border border-[#21AD6D]/30',
  production: 'bg-[#21AD6D]/15 text-[#3BD68E] border border-[#21AD6D]/30',
  live: 'bg-[#21AD6D]/15 text-[#3BD68E] border border-[#21AD6D]/30',
  published: 'bg-[#21AD6D]/15 text-[#3BD68E] border border-[#21AD6D]/30',

  running: 'bg-[#3B6BFF]/15 text-[#7FA0FF] border border-[#3B6BFF]/30',
  staging: 'bg-[#3B6BFF]/15 text-[#7FA0FF] border border-[#3B6BFF]/30',
  'rolling-out': 'bg-[#3B6BFF]/15 text-[#7FA0FF] border border-[#3B6BFF]/30',
  candidate: 'bg-[#3B6BFF]/15 text-[#7FA0FF] border border-[#3B6BFF]/30',
  draft: 'bg-[#3B6BFF]/15 text-[#7FA0FF] border border-[#3B6BFF]/30',

  concluded: 'bg-[#1E2533] text-[#828DA3] border border-[#2A3242]',
  inactive: 'bg-[#1E2533] text-[#828DA3] border border-[#2A3242]',
  archived: 'bg-[#1E2533] text-[#828DA3] border border-[#2A3242]',
  retired: 'bg-[#1E2533] text-[#828DA3] border border-[#2A3242]',
  deprecated: 'bg-[#1E2533] text-[#828DA3] border border-[#2A3242]',
  superseded: 'bg-[#1E2533] text-[#828DA3] border border-[#2A3242]',
  stopped: 'bg-[#1E2533] text-[#828DA3] border border-[#2A3242]',
  info: 'bg-[#1E2533] text-[#828DA3] border border-[#2A3242]',

  failed: 'bg-[#E5484D]/15 text-[#FF6369] border border-[#E5484D]/30',
  cancelled: 'bg-[#E5484D]/15 text-[#FF6369] border border-[#E5484D]/30',
  'rolled-back': 'bg-[#E5484D]/15 text-[#FF6369] border border-[#E5484D]/30',
  critical: 'bg-[#E5484D]/15 text-[#FF6369] border border-[#E5484D]/30',
  high: 'bg-[#F5A623]/15 text-[#F5C16E] border border-[#F5A623]/30',
  medium: 'bg-[#F5A623]/15 text-[#F5C16E] border border-[#F5A623]/30',
  low: 'bg-[#1E2533] text-[#828DA3] border border-[#2A3242]',
}

export function StatusBadge({
  value,
  className,
}: {
  value: string
  className?: string
}) {
  return (
    <Badge
      className={cn(
        'rounded-md font-medium capitalize',
        colorMap[value] ||
          'border border-[#2A3242] bg-[#1E2533] text-[#828DA3]',
        className
      )}
    >
      {value.replace(/-/g, ' ')}
    </Badge>
  )
}
