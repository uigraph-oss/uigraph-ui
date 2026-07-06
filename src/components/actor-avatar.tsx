import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card'
import { commitUrl } from '@/lib/git'
import { cn } from '@/lib/utils'
import { LuGitCommitHorizontal } from 'react-icons/lu'

type ActorLike = {
  name?: string | null
  avatarUrl?: string | null
  type?: string | null
  email?: string | null
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
  commitHash,
  repoUrl,
}: {
  actor?: ActorLike | null
  className?: string
  title?: boolean
  commitHash?: string | null
  repoUrl?: string | null
}) {
  if (!actor) return null

  const isServiceAccount = actor.type === 'service_account'
  const showHoverCard = isServiceAccount && !!commitHash

  const avatar = (
    <Avatar
      onClick={showHoverCard ? (e) => e.stopPropagation() : undefined}
      title={
        title === false || showHoverCard ? undefined : (actor.name ?? undefined)
      }
      className={cn(
        'size-7 bg-[#1E2533] ring-1 ring-[#2A3242]',
        showHoverCard ? 'cursor-pointer' : 'pointer-events-none',
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

  if (!showHoverCard) return avatar

  const href = commitUrl(repoUrl, commitHash)
  const shortSha = commitHash.slice(0, 7)

  return (
    <HoverCard openDelay={100} closeDelay={100}>
      <HoverCardTrigger asChild>{avatar}</HoverCardTrigger>
      <HoverCardContent
        align="end"
        className="w-64 border-[#2A3242] bg-[#141925] p-3"
      >
        <div className="flex items-center gap-2">
          <Avatar className="pointer-events-none size-8 bg-[#1E2533] ring-1 ring-[#2A3242]">
            <AvatarImage
              src={actor.avatarUrl ?? undefined}
              alt={actor.name ?? ''}
              className="object-cover"
            />
            <AvatarFallback className="bg-[#1E2533] text-[10px] font-medium text-[#828DA3]">
              {initialsOf(actor.name)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold text-[#F4F7FC]">
              {actor.name}
            </div>
            <div className="text-[11px] text-[#586378]">Service account</div>
          </div>
        </div>

        <div className="mt-3 border-t border-[#2A3242] pt-2">
          {href ? (
            <a
              href={href}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1.5 text-[#828DA3] transition-colors hover:text-[#3B6BFF]"
            >
              <LuGitCommitHorizontal className="size-3.5 shrink-0" />
              <span className="font-mono text-xs">{shortSha}</span>
            </a>
          ) : (
            <div className="flex items-center gap-1.5 text-[#828DA3]">
              <LuGitCommitHorizontal className="size-3.5 shrink-0" />
              <span className="font-mono text-xs">{shortSha}</span>
            </div>
          )}
        </div>
      </HoverCardContent>
    </HoverCard>
  )
}
