import { SectionLoader } from '@/components/section-loader'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Paths } from '@/constants'
import {
  DashboardSectionContent,
  DashboardSectionHeader,
} from '@/features/dashboard'
import {
  SERVICE_DEPENDENCIES,
  SERVICE_DEPENDENCY_GRAPH,
  type ServiceDependenciesData,
  type ServiceDependency,
  type ServiceDependencyGraphData,
} from '@/features/services/api/dependencies'
import { cn } from '@/lib/utils'
import { useCurrentOrganization } from '@/store/auth-store'
import { useQuery } from '@apollo/client'
import { ArrowDown, ArrowUp } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { DependencyGraph } from './components/dependencies/dependency-graph'

function otherServiceName(dependency: ServiceDependency): string {
  if (dependency.direction === 'upstream') {
    return (
      dependency.providerService?.name ??
      dependency.providerName ??
      dependency.name
    )
  }
  return dependency.consumerService?.name ?? dependency.name
}

export function DashboardServiceDependencies({
  serviceId,
}: {
  serviceId: string
}) {
  const orgId = useCurrentOrganization().id
  const navigate = useNavigate()
  const [view, setView] = useState<'graph' | 'list'>('graph')
  const [direction, setDirection] = useState('all')
  const [criticality, setCriticality] = useState('all')
  const dependencies = useQuery<ServiceDependenciesData>(SERVICE_DEPENDENCIES, {
    variables: {
      orgId,
      serviceId,
      direction: direction === 'all' ? null : direction,
      criticality: criticality === 'all' ? null : criticality,
    },
    skip: !orgId,
  })
  const graph = useQuery<ServiceDependencyGraphData>(SERVICE_DEPENDENCY_GRAPH, {
    variables: { orgId, serviceId },
    skip: !orgId,
  })

  const items = dependencies.data?.dependencies ?? []
  const graphData = graph.data?.serviceDependencyGraph

  return (
    <div className="flex h-full flex-col">
      <DashboardSectionHeader
        title="Dependencies"
        description="Upstream and downstream service relationships, declared in .uigraph.yaml and validated against synced specs."
      />
      <DashboardSectionContent className="gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex rounded-lg border border-[#2A3242] bg-[#141925] p-1">
            {(['graph', 'list'] as const).map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setView(value)}
                className={cn(
                  'rounded-md px-3 py-1 text-sm font-medium capitalize transition-colors',
                  view === value
                    ? 'bg-[#2A3242] text-[#F4F7FC]'
                    : 'text-[#828DA3] hover:text-[#D2D9E6]'
                )}
              >
                {value}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-3">
            <Select value={direction} onValueChange={setDirection}>
              <SelectTrigger className="w-40 border-[#2A3242] bg-[#1E2533]">
                <SelectValue placeholder="Direction" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All directions</SelectItem>
                <SelectItem value="upstream">Upstream</SelectItem>
                <SelectItem value="downstream">Downstream</SelectItem>
              </SelectContent>
            </Select>
            <Select value={criticality} onValueChange={setCriticality}>
              <SelectTrigger className="w-40 border-[#2A3242] bg-[#1E2533]">
                <SelectValue placeholder="Criticality" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All criticality</SelectItem>
                <SelectItem value="hard">Hard</SelectItem>
                <SelectItem value="soft">Soft</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {view === 'graph' ? (
          graph.loading ? (
            <SectionLoader label="Loading dependency graph..." />
          ) : graphData ? (
            <DependencyGraph
              nodes={graphData.nodes}
              edges={graphData.edges}
              focusId={serviceId}
              onNodeClick={(node) => {
                if (node.service?.id && node.service.id !== serviceId) {
                  void navigate(Paths.services.dependencies(node.service.id))
                }
              }}
            />
          ) : null
        ) : (
          <div className="overflow-hidden rounded-xl border border-[#2A3242] bg-[#141925]">
            <Table>
              <TableHeader className="bg-[#1E2533]">
                <TableRow className="border-[#2A3242] hover:bg-[#1E2533]">
                  <TableHead>Service</TableHead>
                  <TableHead>Direction</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Criticality</TableHead>
                  <TableHead>Linked operations</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dependencies.loading ? (
                  <TableRow>
                    <TableCell colSpan={6}>Loading dependencies...</TableCell>
                  </TableRow>
                ) : items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6}>
                      No dependencies match these filters.
                    </TableCell>
                  </TableRow>
                ) : (
                  items.map((dependency) => {
                    const upstream = dependency.direction === 'upstream'
                    const onboarded =
                      dependency.onboardingStatus === 'onboarded'
                    return (
                      <TableRow
                        key={dependency.id}
                        className="border-[#2A3242] hover:bg-[#1E2533]"
                      >
                        <TableCell className="font-medium text-[#F4F7FC]">
                          {otherServiceName(dependency)}
                        </TableCell>
                        <TableCell>
                          <span
                            className={cn(
                              'inline-flex items-center gap-1 font-medium',
                              upstream ? 'text-[#F5B36B]' : 'text-[#5FD0A0]'
                            )}
                          >
                            {upstream ? (
                              <ArrowUp className="size-3.5" />
                            ) : (
                              <ArrowDown className="size-3.5" />
                            )}
                            {dependency.direction}
                          </span>
                        </TableCell>
                        <TableCell>{dependency.type ?? '—'}</TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={cn(
                              'capitalize',
                              dependency.criticality === 'hard'
                                ? 'border-transparent bg-[#3A1D1D] text-[#F29B9B]'
                                : 'border-transparent bg-[#232B3A] text-[#9AA6BC]'
                            )}
                          >
                            {dependency.criticality}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-[#D2D9E6]">
                          {Array.isArray(dependency.operations) &&
                          dependency.operations.length > 0
                            ? dependency.operations.join(', ')
                            : '—'}
                        </TableCell>
                        <TableCell
                          className={cn(
                            onboarded ? 'text-[#5FD0A0]' : 'text-[#828DA3]'
                          )}
                        >
                          {onboarded ? 'onboarded' : 'not onboarded'}
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </DashboardSectionContent>
    </div>
  )
}
