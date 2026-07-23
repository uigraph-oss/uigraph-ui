'use client'

import {
  MEMBERS,
  type OrgMemberRow,
} from '@/features/dashboard-settings/api/members'
import { SERVICE_ACCOUNTS } from '@/features/dashboard-settings/service-accounts/api'
import { useCurrentOrganization } from '@/store/auth-store'
import { useQuery } from '@apollo/client'
import { useMemo } from 'react'

export type MlActor = {
  name: string
  avatarUrl?: string | null
  email?: string | null
  type: 'user' | 'service_account'
}

export function useMlActors() {
  const orgId = useCurrentOrganization()?.id

  const membersQuery = useQuery(MEMBERS, {
    fetchPolicy: 'cache-first',
    skip: !orgId,
    variables: { orgId: orgId! },
  })
  const serviceAccountsQuery = useQuery(SERVICE_ACCOUNTS, {
    fetchPolicy: 'cache-first',
    skip: !orgId,
    variables: { orgId: orgId! },
  })

  const resolveActor = useMemo(() => {
    const members = (membersQuery.data?.members ?? []).filter(
      (m): m is OrgMemberRow => !!m
    )
    const byKey = new Map<string, MlActor>()
    for (const m of members) {
      const actor: MlActor = {
        name: m.name,
        avatarUrl: m.avatarUrl,
        email: m.email,
        type: 'user',
      }
      byKey.set(m.userId, actor)
      if (m.email) byKey.set(m.email.toLowerCase(), actor)
      if (m.name) byKey.set(m.name.toLowerCase(), actor)
    }
    for (const sa of serviceAccountsQuery.data?.serviceAccounts ?? []) {
      const actor: MlActor = { name: sa.name, type: 'service_account' }
      byKey.set(sa.id, actor)
      if (sa.name) byKey.set(sa.name.toLowerCase(), actor)
    }
    return (identifier?: string | null): MlActor | undefined => {
      if (!identifier) return undefined
      return byKey.get(identifier) ?? byKey.get(identifier.toLowerCase())
    }
  }, [membersQuery.data?.members, serviceAccountsQuery.data?.serviceAccounts])

  return { resolveActor }
}
