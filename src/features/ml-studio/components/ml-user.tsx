'use client'

import { ActorAvatar } from '@/components/actor-avatar'
import { cn } from '@/lib/utils'
import { useMlStudioData } from '../contexts/ml-studio-data-context'

export function MlUser({
  identifier,
  className,
}: {
  identifier?: string | null
  className?: string
}) {
  const { resolveActor } = useMlStudioData()

  if (!identifier) {
    return <span className="text-[#586378]">—</span>
  }

  const actor = resolveActor(identifier)
  const name = actor?.name ?? 'Unknown'

  return (
    <span className={cn('flex items-center gap-2', className)}>
      <ActorAvatar
        actor={{
          name,
          avatarUrl: actor?.avatarUrl,
          email: actor?.email,
          type: actor?.type ?? 'user',
        }}
        className="size-5"
      />
      <span className="truncate text-[#F4F7FC]">{name}</span>
    </span>
  )
}
