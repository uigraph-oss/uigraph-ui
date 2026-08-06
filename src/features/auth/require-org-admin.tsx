import { usePermissions } from '@/hooks/use-permissions'
import { Navigate, Outlet } from 'react-router-dom'

export function RequireOrgAdmin() {
  const { isAdmin } = usePermissions()

  if (!isAdmin) {
    return <Navigate to="/settings/profile" replace />
  }

  return <Outlet />
}
