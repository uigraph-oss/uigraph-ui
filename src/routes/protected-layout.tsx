import { OrganizationProvider } from '@/contexts/organization-context'
import {
  AuthenticatedGuard,
  MustHaveOrganizationGuard,
} from '@/features/auth/auth-guards'
import { FigmaOAuthContextProvider } from '@/features/dashboard-projects/components/figma-import/figma-oauth-context'
import { Outlet } from 'react-router-dom'

function clientSubdomain(): string | null {
  const host = window.location.host
  if (!host || host.includes('localhost')) return null
  return host.split('.')[0] || null
}

export function ProtectedLayout() {
  return (
    <AuthenticatedGuard>
      <OrganizationProvider subdomain={clientSubdomain()}>
        <MustHaveOrganizationGuard>
          <FigmaOAuthContextProvider>
            <Outlet />
          </FigmaOAuthContextProvider>
        </MustHaveOrganizationGuard>
      </OrganizationProvider>
    </AuthenticatedGuard>
  )
}
