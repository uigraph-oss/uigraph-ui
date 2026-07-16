import { BetterDialogProvider } from '@/components/better-dialog'
import { SectionLoader } from '@/components/section-loader'
import { Button } from '@/components/ui/button'
import { Paths } from '@/constants'
import { DashboardPageSectionLayout } from '@/features/dashboard'
import {
  ORGANIZATION_DEPENDENCY_GRAPH,
  type OrganizationDependencyGraphData,
} from '@/features/services/api/dependencies'
import { useCurrentOrganization } from '@/store/auth-store'
import { useQuery } from '@apollo/client'
import { Settings2 } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { DependencyGraph } from './components/dependencies/dependency-graph'
import { ManageDependenciesModal } from './components/dependencies/manage-dependencies-modal'

export function OrganizationDependencyGraphPage() {
  const orgId = useCurrentOrganization().id
  const navigate = useNavigate()
  const [manageOpen, setManageOpen] = useState(false)
  const { data, loading } = useQuery<OrganizationDependencyGraphData>(
    ORGANIZATION_DEPENDENCY_GRAPH,
    {
      variables: { orgId },
      skip: !orgId,
    }
  )
  const graph = data?.dependencyGraph

  return (
    <DashboardPageSectionLayout
      title="Service dependency graph"
      description="Explore dependencies across every service in the organization."
      crumbs={[
        { to: Paths.services.root, label: 'Services' },
        { to: Paths.services.graph, label: 'Dependency graph' },
      ]}
      headerContent={
        <BetterDialogProvider
          open={manageOpen}
          onOpenChange={setManageOpen}
          trigger={
            <Button preset="outline" onClick={() => setManageOpen(true)}>
              <Settings2 className="size-4" />
              Manage Dependencies
            </Button>
          }
        >
          {manageOpen && (
            <ManageDependenciesModal onClose={() => setManageOpen(false)} />
          )}
        </BetterDialogProvider>
      }
    >
      {loading ? (
        <SectionLoader label="Loading dependency graph..." />
      ) : graph ? (
        <DependencyGraph
          nodes={graph.nodes}
          edges={graph.edges}
          onNodeClick={(node) => {
            if (node.service?.id && node.onboardingStatus === 'onboarded') {
              void navigate(Paths.services.dependencies(node.service.id))
            }
          }}
        />
      ) : null}
    </DashboardPageSectionLayout>
  )
}
