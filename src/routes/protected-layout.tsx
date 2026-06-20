import {
  AuthenticatedGuard,
  MustHaveOrganizationGuard,
} from '@/features/auth/auth-guards'
import { FigmaOAuthContextProvider } from '@/features/dashboard-projects/components/figma-import/figma-oauth-context'
import { Outlet } from 'react-router-dom'

export function ProtectedLayout() {
  return (
    <AuthenticatedGuard>
      <MustHaveOrganizationGuard>
        <FigmaOAuthContextProvider>
          <Outlet />
        </FigmaOAuthContextProvider>
      </MustHaveOrganizationGuard>
    </AuthenticatedGuard>
  )
}
