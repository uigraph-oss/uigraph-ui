import { useAuthStore } from '@/store/auth-store'

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
