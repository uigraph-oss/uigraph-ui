import { DASHBOARD_NAV_LINKS } from '@/constants'
import {
  AuthenticatedGuard,
  ProtectedDashboardLayout,
  ProtectedServerAdminLayout,
  UnauthenticatedGuard,
} from '@/features/auth/auth-guards'
import { lazy } from 'react'
import { Navigate, Outlet, Route, Routes } from 'react-router-dom'

const DashboardLayout = lazy(() =>
  import('@/features/dashboard').then((mod) => ({
    default: mod.DashboardLayout,
  }))
)
const DashboardSettingsLayout = lazy(() =>
  import('@/features/dashboard').then((mod) => ({
    default: mod.DashboardSettingsLayout,
  }))
)
const AiChatLayout = lazy(() =>
  import('@/features/ai-chat/ai-chat-layout').then((mod) => ({
    default: mod.AiChatLayout,
  }))
)
const ServerAdminLayout = lazy(() =>
  import('@/features/server-dashboard/server-admin-layout').then((mod) => ({
    default: mod.ServerAdminLayout,
  }))
)
const ServiceLayout = lazy(() =>
  import('@/routes/service-layout').then((mod) => ({
    default: mod.ServiceLayout,
  }))
)
const MlStudioLayout = lazy(() =>
  import('@/routes/ml-studio-layout').then((mod) => ({
    default: mod.MlStudioLayout,
  }))
)
const MlStudioRootLayout = lazy(() =>
  import('@/features/ml-studio/components/ml-studio-root-layout').then(
    (mod) => ({ default: mod.MlStudioRootLayout })
  )
)
const ModelsTab = lazy(() =>
  import('@/features/ml-studio/components/models/ml-studio-models-page').then(
    (mod) => ({ default: mod.ModelsTab })
  )
)
const ModelOverviewTab = lazy(() =>
  import('@/features/ml-studio/components/models/model-overview-tab').then(
    (mod) => ({ default: mod.ModelOverviewTab })
  )
)
const ExperimentsTab = lazy(() =>
  import('@/features/ml-studio/components/experiments/experiments-tab').then(
    (mod) => ({ default: mod.ExperimentsTab })
  )
)
const ExperimentFormPage = lazy(() =>
  import('@/features/ml-studio/components/experiments/experiment-form-page').then(
    (mod) => ({ default: mod.ExperimentFormPage })
  )
)
const ExperimentDetailPage = lazy(() =>
  import('@/features/ml-studio/components/experiments/experiment-detail-page').then(
    (mod) => ({ default: mod.ExperimentDetailPage })
  )
)
const RunFormPage = lazy(() =>
  import('@/features/ml-studio/components/experiments/run-form-page').then(
    (mod) => ({ default: mod.RunFormPage })
  )
)
const RunDetailPage = lazy(() =>
  import('@/features/ml-studio/components/experiments/run-detail-page').then(
    (mod) => ({ default: mod.RunDetailPage })
  )
)
const RunComparisonPage = lazy(() =>
  import('@/features/ml-studio/components/experiments/run-comparison-page').then(
    (mod) => ({ default: mod.RunComparisonPage })
  )
)
const DatasetsTab = lazy(() =>
  import('@/features/ml-studio/components/datasets/datasets-tab').then(
    (mod) => ({
      default: mod.DatasetsTab,
    })
  )
)
const DatasetDetailPage = lazy(() =>
  import('@/features/ml-studio/components/datasets/dataset-detail-page').then(
    (mod) => ({ default: mod.DatasetDetailPage })
  )
)
const DeploymentsTab = lazy(() =>
  import('@/features/ml-studio/components/deployments/deployments-tab').then(
    (mod) => ({ default: mod.DeploymentsTab })
  )
)
const FindingsTab = lazy(() =>
  import('@/features/ml-studio/components/findings/findings-tab').then(
    (mod) => ({
      default: mod.FindingsTab,
    })
  )
)
const FindingDetailPage = lazy(() =>
  import('@/features/ml-studio/components/findings/finding-detail-page').then(
    (mod) => ({ default: mod.FindingDetailPage })
  )
)
const DecisionsTab = lazy(() =>
  import('@/features/ml-studio/components/decisions/decisions-tab').then(
    (mod) => ({ default: mod.DecisionsTab })
  )
)
const DecisionDetailPage = lazy(() =>
  import('@/features/ml-studio/components/decisions/decision-detail-page').then(
    (mod) => ({ default: mod.DecisionDetailPage })
  )
)

const SignInForm = lazy(() =>
  import('@/features/auth/sign-in-form').then((mod) => ({
    default: mod.SignInForm,
  }))
)
const AuthorizePage = lazy(() =>
  import('@/routes/authorize-page').then((mod) => ({
    default: mod.AuthorizePage,
  }))
)
const OnboardingPage = lazy(() =>
  import('@/routes/onboarding-page').then((mod) => ({
    default: mod.OnboardingPage,
  }))
)
const NotFoundPage = lazy(() =>
  import('@/routes/not-found-page').then((mod) => ({
    default: mod.NotFoundPage,
  }))
)
const DiagramPreviewPage = lazy(() =>
  import('@/routes/diagram-preview-page').then((mod) => ({
    default: mod.DiagramPreviewPage,
  }))
)
const DiagramScreenshotPage = lazy(() =>
  import('@/routes/diagram-screenshot-page').then((mod) => ({
    default: mod.DiagramScreenshotPage,
  }))
)
const ServiceOverviewRoute = lazy(() =>
  import('@/routes/service-pages').then((mod) => ({
    default: mod.ServiceOverviewRoute,
  }))
)
const ServiceOperationsRoute = lazy(() =>
  import('@/routes/service-pages').then((mod) => ({
    default: mod.ServiceOperationsRoute,
  }))
)
const ServicePeopleRoute = lazy(() =>
  import('@/routes/service-pages').then((mod) => ({
    default: mod.ServicePeopleRoute,
  }))
)
const ServiceDependenciesRoute = lazy(() =>
  import('@/routes/service-pages').then((mod) => ({
    default: mod.ServiceDependenciesRoute,
  }))
)
const OrganizationDependencyGraphPage = lazy(() =>
  import('@/features/services/organization-dependency-graph-page').then(
    (mod) => ({
      default: mod.OrganizationDependencyGraphPage,
    })
  )
)
const ServerOverviewPage = lazy(() =>
  import('@/features/server-dashboard/server-overview-page').then((mod) => ({
    default: mod.ServerOverviewPage,
  }))
)
const ServerOrgsPage = lazy(() =>
  import('@/features/server-orgs/server-orgs-page').then((mod) => ({
    default: mod.ServerOrgsPage,
  }))
)
const ServerSSOPage = lazy(() =>
  import('@/features/server-sso/server-sso-page').then((mod) => ({
    default: mod.ServerSSOPage,
  }))
)
const ServerUsersPage = lazy(() =>
  import('@/features/server-users/server-users-page').then((mod) => ({
    default: mod.ServerUsersPage,
  }))
)
const DashboardDiagramsPage = lazy(() =>
  import('@/features/dashboard-diagrams/dashboard-diagrams-page').then(
    (mod) => ({ default: mod.DashboardDiagramsPage })
  )
)
const DashboardDocsPage = lazy(() =>
  import('@/features/dashboard-docs/dashboard-docs-page').then((mod) => ({
    default: mod.DashboardDocsPage,
  }))
)
const ComponentsPage = lazy(() =>
  import('@/features/components/components-page').then((mod) => ({
    default: mod.ComponentsPage,
  }))
)
const DashboardProjects = lazy(() =>
  import('@/features/dashboard-projects').then((mod) => ({
    default: mod.DashboardProjects,
  }))
)
const DashboardProjectPage = lazy(() =>
  import('@/features/dashboard-projects').then((mod) => ({
    default: mod.DashboardProjectPage,
  }))
)
const DashboardMapFramePage = lazy(() =>
  import('@/features/dashboard-pages/dashboard-map-frame-page').then((mod) => ({
    default: mod.DashboardMapFramePage,
  }))
)
const AiChatIndexPage = lazy(() =>
  import('@/features/ai-chat/ai-chat-index-page').then((mod) => ({
    default: mod.AiChatIndexPage,
  }))
)
const AiChatInboxPage = lazy(() =>
  import('@/features/ai-chat/ai-chat-inbox-page').then((mod) => ({
    default: mod.AiChatInboxPage,
  }))
)
const DashboardInsightsPage = lazy(() =>
  import('@/features/dashboard-insights/dashboard-insights-page').then(
    (mod) => ({ default: mod.DashboardInsightsPage })
  )
)
const DashboardServices = lazy(() =>
  import('@/features/services/components/services-list/dashboard-services').then(
    (mod) => ({ default: mod.DashboardServices })
  )
)
const DashboardServiceApis = lazy(() =>
  import('@/features/services/components/apis/dashboard-service-apis').then(
    (mod) => ({ default: mod.DashboardServiceApis })
  )
)
const ApiGroupEndpointsPage = lazy(() =>
  import('@/features/services/components/apis/api-group-endpoints-page').then(
    (mod) => ({ default: mod.ApiGroupEndpointsPage })
  )
)
const DashboardServiceDiagrams = lazy(() =>
  import('@/features/services/components/diagrams/dashboard-service-diagrams').then(
    (mod) => ({ default: mod.DashboardServiceDiagrams })
  )
)
const ServiceDatabaseListPage = lazy(() =>
  import('@/features/services/components/databases/service-database-list-page').then(
    (mod) => ({ default: mod.ServiceDatabaseListPage })
  )
)
const ServiceDatabasePage = lazy(() =>
  import('@/features/services/components/databases/service-database-page').then(
    (mod) => ({ default: mod.ServiceDatabasePage })
  )
)
const DashboardServiceDocs = lazy(() =>
  import('@/features/services/dashboard-service-docs').then((mod) => ({
    default: mod.DashboardServiceDocs,
  }))
)
const ServiceTestsPage = lazy(() =>
  import('@/features/services/components/tests/service-tests-page').then(
    (mod) => ({ default: mod.ServiceTestsPage })
  )
)
const TestRunDetailsPage = lazy(() =>
  import('@/features/services/components/tests/test-run-details-page').then(
    (mod) => ({ default: mod.TestRunDetailsPage })
  )
)
const TestRunExecutionPage = lazy(() =>
  import('@/features/services/components/tests/test-run-execution-page').then(
    (mod) => ({ default: mod.TestRunExecutionPage })
  )
)
const ProfileSettings = lazy(() =>
  import('@/features/dashboard-settings').then((mod) => ({
    default: mod.ProfileSettings,
  }))
)
const SecuritySettings = lazy(() =>
  import('@/features/dashboard-settings').then((mod) => ({
    default: mod.SecuritySettings,
  }))
)
const TeamManagementPage = lazy(() =>
  import('@/features/dashboard-settings/users-team-management/team-management-page').then(
    (mod) => ({ default: mod.TeamManagementPage })
  )
)
const UsersManagementPage = lazy(() =>
  import('@/features/dashboard-settings/users-team-management/users-management-page').then(
    (mod) => ({ default: mod.UsersManagementPage })
  )
)
const ServiceAccountsPage = lazy(() =>
  import('@/features/dashboard-settings/service-accounts/service-accounts-page').then(
    (mod) => ({ default: mod.ServiceAccountsPage })
  )
)
const ServiceAccountDetailPage = lazy(() =>
  import('@/features/dashboard-settings/service-accounts/service-account-detail-page').then(
    (mod) => ({ default: mod.ServiceAccountDetailPage })
  )
)
const DiagramPortalPage = lazy(() =>
  import('@/features/diagram-portal/diagram-portal-page').then((mod) => ({
    default: mod.DiagramPortalPage,
  }))
)

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
            <SignInForm />
          </UnauthenticatedGuard>
        }
      />
      <Route path="/authorize" element={<AuthorizePage />} />
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
      <Route
        path="/diagram-screenshot/:diagramId"
        element={<DiagramScreenshotPage />}
      />

      <Route element={<ProtectedServerAdminLayout />}>
        <Route
          path="/server"
          element={
            <ServerAdminLayout>
              <Outlet />
            </ServerAdminLayout>
          }
        >
          <Route index element={<Navigate to="/server/overview" replace />} />
          <Route path="overview" element={<ServerOverviewPage />} />
          <Route path="orgs" element={<ServerOrgsPage />} />
          <Route path="users" element={<ServerUsersPage />} />
          <Route path="sso" element={<ServerSSOPage />} />
        </Route>
      </Route>

      <Route element={<ProtectedDashboardLayout />}>
        <Route path="/diagram/:diagramId" element={<DiagramPortalPage />} />

        <Route
          element={
            <DashboardLayout>
              <Outlet />
            </DashboardLayout>
          }
        >
          <Route
            path="/dashboard"
            element={<Navigate to={DASHBOARD_NAV_LINKS[0].id} replace />}
          />
          <Route
            path="/dashboard/diagrams"
            element={<DashboardDiagramsPage />}
          />
          <Route path="/dashboard/docs" element={<DashboardDocsPage />} />
          <Route path="/dashboard/catalog" element={<ComponentsPage />} />
          <Route path="/dashboard/maps" element={<DashboardProjects />} />
          <Route
            path="/dashboard/maps/:mapId"
            element={<DashboardProjectPage />}
          />
          <Route
            path="/dashboard/frame/:frameId"
            element={<DashboardMapFramePage />}
          />

          <Route
            element={
              <AiChatLayout>
                <Outlet />
              </AiChatLayout>
            }
          >
            <Route path="/dashboard/ai" element={<AiChatIndexPage />} />
            <Route
              path="/dashboard/ai/:sessionId"
              element={<AiChatInboxPage />}
            />
          </Route>

          <Route
            path="/dashboard/insights"
            element={<DashboardInsightsPage />}
          />

          <Route path="/services" element={<DashboardServices />} />
          <Route
            path="/services/graph"
            element={<OrganizationDependencyGraphPage />}
          />
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
            <Route path="dependencies" element={<ServiceDependenciesRoute />} />
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

          <Route path="/dashboard/ml-studio" element={<MlStudioRootLayout />}>
            <Route index element={<Navigate to="models" replace />} />
            <Route path="models" element={<ModelsTab />} />
            <Route path="experiments" element={<ExperimentsTab />} />
            <Route path="experiments/new" element={<ExperimentFormPage />} />
            <Route
              path="experiments/:experimentId"
              element={<ExperimentDetailPage />}
            />
            <Route
              path="experiments/:experimentId/edit"
              element={<ExperimentFormPage />}
            />
            <Route
              path="experiments/:experimentId/runs/new"
              element={<RunFormPage />}
            />
            <Route
              path="experiments/:experimentId/runs/:runId"
              element={<RunDetailPage />}
            />
            <Route
              path="experiments/:experimentId/compare"
              element={<RunComparisonPage />}
            />
            <Route path="datasets" element={<DatasetsTab />} />
            <Route path="datasets/:datasetId" element={<DatasetDetailPage />} />
            <Route path="deployments" element={<DeploymentsTab />} />
            <Route path="findings" element={<FindingsTab />} />
            <Route path="findings/:findingId" element={<FindingDetailPage />} />
            <Route path="decisions" element={<DecisionsTab />} />
            <Route
              path="decisions/:decisionId"
              element={<DecisionDetailPage />}
            />
          </Route>

          <Route
            path="/dashboard/ml-studio/models/:modelId"
            element={<MlStudioLayout />}
          >
            <Route index element={<ModelOverviewTab />} />
          </Route>

          <Route
            path="/settings"
            element={
              <DashboardSettingsLayout>
                <Outlet />
              </DashboardSettingsLayout>
            }
          >
            <Route
              index
              element={<Navigate to="/settings/profile" replace />}
            />
            <Route path="profile" element={<ProfileSettings />} />
            <Route path="teams" element={<TeamManagementPage />} />
            <Route path="users" element={<UsersManagementPage />} />
            <Route path="service-accounts" element={<ServiceAccountsPage />} />
            <Route
              path="service-accounts/:id"
              element={<ServiceAccountDetailPage />}
            />
            <Route path="security" element={<SecuritySettings />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
