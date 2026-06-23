import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'

type ActorLike = {
  name?: string | null
  avatarUrl?: string | null
}

function initialsOf(name?: string | null) {
  const parts = (name ?? '').trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return ''
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

export function ActorAvatar({
  actor,
  className,
  title,
}: {
  actor?: ActorLike | null
  className?: string
  title?: boolean
}) {
  if (!actor) return null

  return (
    <Avatar
      title={title === false ? undefined : (actor.name ?? undefined)}
      className={cn(
        'pointer-events-none size-7 bg-[#1E2533] ring-1 ring-[#2A3242]',
        className
      )}
    >
      <AvatarImage
        src={actor.avatarUrl ?? undefined}
        alt={actor.name ?? ''}
        className="object-cover"
      />
      <AvatarFallback className="bg-[#1E2533] text-[9px] font-medium text-[#828DA3]">
        {initialsOf(actor.name)}
      </AvatarFallback>
    </Avatar>
  )
}
