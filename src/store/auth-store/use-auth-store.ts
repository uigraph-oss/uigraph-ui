import { V2 } from '@/api-v2'
import { create } from 'zustand'

type AuthenticatedUser = V2.MeAndOrgQuery['me']
type UserOrganization = V2.MeAndOrgQuery['myOrgs'][number]

export const useAuthStore = create(() => ({
  status: 'loading' as 'authenticated' | 'loading' | 'unauthenticated',
  user: null as AuthenticatedUser | null,

  organizations: [] as UserOrganization[],
  currentOrganizationId: localStorage.getItem('currentOrganizationId') as
    | string
    | null,

  dashboard: localStorage.getItem('dashboard') as
    | 'organization'
    | 'server'
    | null,
}))

export function useAuthenticatedUser() {
  const user = useAuthStore((state) => state.user)
  if (!user) {
    throw new Error('User is not authenticated')
  }

  return user
}

export function useCurrentOrganization() {
  const organizations = useAuthStore((state) => state.organizations)
  const currentOrganizationId = useAuthStore(
    (state) => state.currentOrganizationId
  )

  return (
    organizations.find((o) => o.id === currentOrganizationId) ??
    organizations[0]
  )
}

useAuthStore.subscribe((state) => {
  if (state.dashboard) {
    localStorage.setItem('dashboard', state.dashboard)
  } else {
    localStorage.removeItem('dashboard')
  }

  if (state.currentOrganizationId) {
    localStorage.setItem('currentOrganizationId', state.currentOrganizationId)
  } else {
    localStorage.removeItem('currentOrganizationId')
  }
})
