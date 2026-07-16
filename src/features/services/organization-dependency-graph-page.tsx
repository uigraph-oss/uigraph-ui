import { SectionLoader } from '@/components/section-loader'
import { Paths } from '@/constants'
import { DashboardPageSectionLayout } from '@/features/dashboard'
import {
  ORGANIZATION_DEPENDENCY_GRAPH,
  type OrganizationDependencyGraphData,
} from '@/features/services/api/dependencies'
import { useCurrentOrganization } from '@/store/auth-store'
import { useQuery } from '@apollo/client'
import { useNavigate } from 'react-router-dom'
import { DependencyGraph } from './components/dependencies/dependency-graph'

export function OrganizationDependencyGraphPage() {
  const orgId = useCurrentOrganization().id
  const navigate = useNavigate()
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
    >
      {loading ? (
        <SectionLoader label="Loading dependency graph..." />
      ) : graph ? (
        <DependencyGraph
          nodes={graph.nodes}
          edges={graph.edges}
          onNodeClick={(node) => {
            if (node.service?.id) {
              void navigate(Paths.services.dependencies(node.service.id))
            }
          }}
        />
      ) : null}
    </DashboardPageSectionLayout>
  )
}
