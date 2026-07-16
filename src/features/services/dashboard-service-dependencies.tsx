import { BetterDialogProvider } from '@/components/better-dialog'
import { SectionLoader } from '@/components/section-loader'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Paths } from '@/constants'
import {
  DashboardSectionContent,
  DashboardSectionHeader,
} from '@/features/dashboard'
import {
  SERVICE_DEPENDENCY_GRAPH,
  type ServiceDependencyGraphData,
} from '@/features/services/api/dependencies'
import { useServiceContext } from '@/features/services/contexts/service-context'
import { useCurrentOrganization } from '@/store/auth-store'
import { useQuery } from '@apollo/client'
import { Settings2 } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { DependencyGraph } from './components/dependencies/dependency-graph'
import { ManageDependenciesModal } from './components/dependencies/manage-dependencies-modal'

export function DashboardServiceDependencies({
  serviceId,
}: {
  serviceId: string
}) {
  const orgId = useCurrentOrganization().id
  const { service } = useServiceContext()
  const navigate = useNavigate()
  const [direction, setDirection] = useState('all')
  const [criticality, setCriticality] = useState('all')
  const [manageOpen, setManageOpen] = useState(false)
  const graph = useQuery<ServiceDependencyGraphData>(SERVICE_DEPENDENCY_GRAPH, {
    variables: { orgId, serviceId },
    skip: !orgId,
  })

  const rawGraph = graph.data?.serviceDependencyGraph
  let graphData = rawGraph
  if (rawGraph && (direction !== 'all' || criticality !== 'all')) {
    const edges = rawGraph.edges.filter((edge) => {
      if (direction === 'upstream' && edge.source !== serviceId) {
        return false
      }
      if (direction === 'downstream' && edge.target !== serviceId) {
        return false
      }
      if (criticality !== 'all' && edge.criticality !== criticality) {
        return false
      }
      return true
    })
    const visible = new Set<string>([serviceId])
    for (const edge of edges) {
      visible.add(edge.source)
      visible.add(edge.target)
    }
    const nodes = rawGraph.nodes.filter((node) => visible.has(node.id))
    graphData = { nodes, edges }
  }

  return (
    <div className="flex h-full flex-col">
      <DashboardSectionHeader
        title="Dependencies"
        description="Upstream and downstream service relationships, declared in .uigraph.yaml and validated against synced specs."
      >
        <Button preset="outline" onClick={() => setManageOpen(true)}>
          <Settings2 className="size-4" />
          Manage Dependencies
        </Button>
      </DashboardSectionHeader>

      <BetterDialogProvider open={manageOpen} onOpenChange={setManageOpen}>
        {manageOpen && (
          <ManageDependenciesModal
            serviceId={serviceId}
            serviceName={service?.name}
            onClose={() => setManageOpen(false)}
          />
        )}
      </BetterDialogProvider>
      <DashboardSectionContent className="gap-4 px-3 pt-3.5 pb-4">
        <div className="relative min-h-0 flex-1">
          <div className="absolute top-4 right-4 z-10 flex flex-wrap gap-3">
            <Select value={direction} onValueChange={setDirection}>
              <SelectTrigger className="w-40 border-[#2A3242] bg-[#1E2533]/90 backdrop-blur">
                <SelectValue placeholder="Direction" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All directions</SelectItem>
                <SelectItem value="upstream">Upstream</SelectItem>
                <SelectItem value="downstream">Downstream</SelectItem>
              </SelectContent>
            </Select>
            <Select value={criticality} onValueChange={setCriticality}>
              <SelectTrigger className="w-40 border-[#2A3242] bg-[#1E2533]/90 backdrop-blur">
                <SelectValue placeholder="Criticality" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All criticality</SelectItem>
                <SelectItem value="hard">Hard</SelectItem>
                <SelectItem value="soft">Soft</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {graph.loading ? (
            <SectionLoader label="Loading dependency graph..." />
          ) : graphData ? (
            <DependencyGraph
              key={`${direction}-${criticality}`}
              nodes={graphData.nodes}
              edges={graphData.edges}
              focusId={serviceId}
              onNodeClick={(node) => {
                if (node.service?.id && node.service.id !== serviceId) {
                  void navigate(Paths.services.dependencies(node.service.id))
                }
              }}
            />
          ) : null}
        </div>
      </DashboardSectionContent>
    </div>
  )
}
