import { PERMISSIONS, PermissionsEntities } from '@/constants/permissions'
import { useCurrentOrganization } from '@/store/auth-store'
import { useCallback } from 'react'

export function usePermissions() {
  const role = useCurrentOrganization()?.membership.role ?? null

  const hasAccess = useCallback(
    (permission: PermissionsEntities | (string & {})) => {
      if (!role) return false
      return PERMISSIONS.hasAccess(permission, role)
    },
    [role]
  )

  return {
    isAdmin: role === 'admin',
    isEditor: role === 'editor',
    isViewer: role === 'viewer',
    hasAccess,
  }
}
