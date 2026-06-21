import { GlobalLoader } from '@/components/loader/global-loader'
import { DASHBOARD_NAV_LINKS } from '@/constants'
import { AiChatInboxPage } from '@/features/ai-chat/ai-chat-inbox-page'
import { AiChatIndexPage } from '@/features/ai-chat/ai-chat-index-page'
import { AiChatLayout } from '@/features/ai-chat/ai-chat-layout'
import {
  AuthenticatedGuard,
  ProtectedDashboardLayout,
  ProtectedServerAdminLayout,
  UnauthenticatedGuard,
} from '@/features/auth/auth-guards'
import { SignInForm } from '@/features/auth/sign-in-form'
import { ComponentsPage } from '@/features/components/components-page'
import { DashboardLayout, DashboardSettingsLayout } from '@/features/dashboard'
import { DashboardDiagramsPage } from '@/features/dashboard-diagrams/dashboard-diagrams-page'
import { DashboardMapFramePage } from '@/features/dashboard-pages/dashboard-map-frame-page'
import {
  DashboardProjectPage,
  DashboardProjects,
} from '@/features/dashboard-projects'
import {
  OrganizationSettings,
  ProfileSettings,
  SecuritySettings,
} from '@/features/dashboard-settings'
import { ServiceAccountsPage } from '@/features/dashboard-settings/service-accounts/service-accounts-page'
import { TeamManagementPage } from '@/features/dashboard-settings/users-team-management/team-management-page'
import { UsersManagementPage } from '@/features/dashboard-settings/users-team-management/users-management-page'
import { ServerAdminLayout } from '@/features/server-dashboard/server-admin-layout'
import { ServerOverviewPage } from '@/features/server-dashboard/server-overview-page'
import { ServerOrgsPage } from '@/features/server-orgs/server-orgs-page'
import { ServerSSOPage } from '@/features/server-sso/server-sso-page'
import { ServerUsersPage } from '@/features/server-users/server-users-page'
import { DashboardServiceApis } from '@/features/services/components/apis/dashboard-service-apis'
import { ServiceDatabaseListPage } from '@/features/services/components/databases/service-database-list-page'
import { ServiceDatabasePage } from '@/features/services/components/databases/service-database-page'
import { DashboardServiceDiagrams } from '@/features/services/components/diagrams/dashboard-service-diagrams'
import { DashboardServices } from '@/features/services/components/services-list/dashboard-services'
import { ServiceTestsPage } from '@/features/services/components/tests/service-tests-page'
import { DashboardServiceDocs } from '@/features/services/dashboard-service-docs'
import { DiagramPreviewPage } from '@/routes/diagram-preview-page'
import {
  ApiGroupEndpointsPage,
  DiagramPortalPage,
  TestRunDetailsPage,
  TestRunExecutionPage,
} from '@/routes/lazy-pages'
import { NotFoundPage } from '@/routes/not-found-page'
import { OnboardingPage } from '@/routes/onboarding-page'
import { ServiceLayout } from '@/routes/service-layout'
import {
  ServiceOperationsRoute,
  ServiceOverviewRoute,
  ServicePeopleRoute,
} from '@/routes/service-pages'
import { ComponentType, PropsWithChildren, Suspense } from 'react'
import { Navigate, Outlet, Route, Routes } from 'react-router-dom'

// Feature layouts receive `children`; React Router layout routes render <Outlet/>.
function withOutlet(layout: ComponentType<PropsWithChildren>) {
  const Layout = layout
  return function LayoutRoute() {
    return (
      <Layout>
        <Outlet />
      </Layout>
    )
  }
}

const DashboardLayoutRoute = withOutlet(DashboardLayout)
const AiChatLayoutRoute = withOutlet(
  AiChatLayout as ComponentType<PropsWithChildren>
)
const SettingsLayoutRoute = withOutlet(DashboardSettingsLayout)
const ServerAdminLayoutRoute = withOutlet(ServerAdminLayout)

export function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <AuthenticatedGuard>
            <Navigate to="/dashboard" replace />
          </AuthenticatedGuard>
        }
      />
      <Route
        path="/sign-in"
        element={
          <UnauthenticatedGuard>
            <Suspense fallback={<GlobalLoader />}>
              <SignInForm />
            </Suspense>
          </UnauthenticatedGuard>
        }
      />
      <Route path="/signin" element={<Navigate to="/sign-in" replace />} />
      <Route
        path="/onboarding"
        element={
          <AuthenticatedGuard>
            <OnboardingPage />
          </AuthenticatedGuard>
        }
      />
      <Route
        path="/diagram-preview/:diagramId"
        element={<DiagramPreviewPage />}
      />

      <Route element={<ProtectedServerAdminLayout />}>
        <Route path="/server" element={<ServerAdminLayoutRoute />}>
          <Route index element={<Navigate to="/server/overview" replace />} />
          <Route path="overview" element={<ServerOverviewPage />} />
          <Route path="orgs" element={<ServerOrgsPage />} />
          <Route path="users" element={<ServerUsersPage />} />
          <Route path="sso" element={<ServerSSOPage />} />
        </Route>
      </Route>

      <Route element={<ProtectedDashboardLayout />}>
        <Route path="/diagram/:diagramId" element={<DiagramPortalPage />} />

        <Route element={<DashboardLayoutRoute />}>
          <Route
            path="/dashboard"
            element={<Navigate to={DASHBOARD_NAV_LINKS[0].id} replace />}
          />
          <Route
            path="/dashboard/diagrams"
            element={<DashboardDiagramsPage />}
          />
          <Route path="/dashboard/components" element={<ComponentsPage />} />
          <Route path="/dashboard/maps" element={<DashboardProjects />} />
          <Route
            path="/dashboard/maps/:mapId"
            element={<DashboardProjectPage />}
          />
          <Route
            path="/dashboard/frame/:frameId"
            element={<DashboardMapFramePage />}
          />

          <Route element={<AiChatLayoutRoute />}>
            <Route path="/dashboard/ai" element={<AiChatIndexPage />} />
            <Route
              path="/dashboard/ai/:sessionId"
              element={<AiChatInboxPage />}
            />
          </Route>

          <Route path="/services" element={<DashboardServices />} />
          <Route path="/services/:serviceId" element={<ServiceLayout />}>
            <Route index element={<Navigate to="overview" replace />} />
            <Route path="overview" element={<ServiceOverviewRoute />} />
            <Route path="apis" element={<DashboardServiceApis />} />
            <Route
              path="apis/:apiGroupId"
              element={<ApiGroupEndpointsPage />}
            />
            <Route path="architecture" element={<DashboardServiceDiagrams />} />
            <Route path="data" element={<ServiceDatabaseListPage />} />
            <Route path="data/:dbId" element={<ServiceDatabasePage />} />
            <Route path="docs" element={<DashboardServiceDocs />} />
            <Route path="operations" element={<ServiceOperationsRoute />} />
            <Route path="people" element={<ServicePeopleRoute />} />
            <Route path="tests" element={<ServiceTestsPage />} />
            <Route
              path="tests/runs/:testRunId"
              element={<TestRunDetailsPage />}
            />
            <Route
              path="tests/run/:testRunId"
              element={<TestRunExecutionPage />}
            />
          </Route>

          <Route path="/settings" element={<SettingsLayoutRoute />}>
            <Route
              index
              element={<Navigate to="/settings/profile" replace />}
            />
            <Route path="profile" element={<ProfileSettings />} />
            <Route path="organization" element={<OrganizationSettings />} />
            <Route path="teams" element={<TeamManagementPage />} />
            <Route path="users" element={<UsersManagementPage />} />
            <Route path="service-accounts" element={<ServiceAccountsPage />} />
            <Route path="security" element={<SecuritySettings />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
