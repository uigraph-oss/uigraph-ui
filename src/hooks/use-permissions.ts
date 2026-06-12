import { GET_ORGANIZATION_USERS } from '@/features/dashboard-settings/api/users'
import { PERMISSIONS, PermissionsEntities } from '@/constants/permissions'
import { useOrganizationContext } from '@/contexts/organization-context'
import { useQuery } from '@apollo/client'
import { arrayNonNullable } from 'daily-code'
import { useCallback, useMemo } from 'react'

export function usePermissions() {
  const { organizationId, account } = useOrganizationContext()

  const { data } = useQuery(GET_ORGANIZATION_USERS, {
    fetchPolicy: 'cache-first',
    variables: { organizationId: organizationId! },
    skip: !organizationId,
  })

  const user = useMemo(() => {
    const users = arrayNonNullable(data?.GetOrganizationUsers)
    return users.find((u) => u?.email === account.email) ?? null
  }, [data?.GetOrganizationUsers, account.email])

  const hasAccess = useCallback(
    (permission: PermissionsEntities | (string & {})) => {
      if (!user?.role) return false
      return PERMISSIONS.hasAccess(permission, user.role)
    },
    [user?.role]
  )

  return {
    isAdmin: user?.role === 'admin',
    isEditor: user?.role === 'editor',
    isViewer: user?.role === 'viewer',
    hasAccess,
  }
}
