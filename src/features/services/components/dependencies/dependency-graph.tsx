import { Checkbox } from '@/components/ui/checkbox'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Paths } from '@/constants'
import {
  API_ENDPOINTS,
  API_GROUPS,
} from '@/features/services/api/api-endpoints'
import type {
  DependencyGraphEdge,
  DependencyGraphNode,
} from '@/features/services/api/dependencies'
import { SERVICE_DBS } from '@/features/services/api/service-db'
import { useCurrentOrganization } from '@/store/auth-store'
import { useQuery } from '@apollo/client'
import {
  Background,
  BaseEdge,
  EdgeLabelRenderer,
  MarkerType,
  Panel,
  Position,
  ReactFlow,
  getBezierPath,
  type CoordinateExtent,
  type Edge,
  type EdgeProps,
  type Node,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import dagre from 'dagre'
import {
  Clock,
  Database,
  Github,
  Globe,
  Link2,
  Loader2,
  Radio,
  Share2,
} from 'lucide-react'
import { useEffect, useRef, useState, type ReactNode } from 'react'

type DependencyGraphProps = {
  nodes: DependencyGraphNode[]
  edges: DependencyGraphEdge[]
  focusId?: string
  onNodeClick?: (node: DependencyGraphNode) => void
}

type FlowNodeData = DependencyGraphNode & { label: ReactNode }

type DependencyEdgeData = {
  detailText?: string | null
  edgeType?: string | null
  criticality?: string | null
  apiGroupName?: string | null
  databaseName?: string | null
  endpoints?: string[] | null
  providerServiceId?: string
  hard: boolean
  showDetails: boolean
}

type DependencyFlowEdge = Edge<DependencyEdgeData, 'dependency'>

function typeIcon(type?: string | null) {
  if (type === 'database') return Database
  if (type === 'http') return Globe
  if (type === 'graphql') return Share2
  if (type === 'grpc') return Radio
  return Link2
}

const typeLabels: Record<string, string> = {
  http: 'HTTP API',
  graphql: 'GraphQL API',
  grpc: 'gRPC API',
  database: 'Database',
}

function DependencyTooltipContent({ data }: { data?: DependencyEdgeData }) {
  const orgId = useCurrentOrganization().id
  const isApi =
    data?.edgeType === 'http' ||
    data?.edgeType === 'graphql' ||
    data?.edgeType === 'grpc'
  const providerServiceId = data?.providerServiceId ?? ''
  const apiGroupName = data?.apiGroupName ?? ''
  const endpoints = data?.endpoints ?? []
  const canFetch =
    isApi &&
    Boolean(orgId) &&
    Boolean(providerServiceId) &&
    !providerServiceId.startsWith('ghost:') &&
    Boolean(apiGroupName) &&
    endpoints.length > 0

  const groupsQuery = useQuery(API_GROUPS, {
    variables: { orgId, serviceId: providerServiceId },
    skip: !canFetch,
  })
  const group = groupsQuery.data?.apiGroups?.find(
    (g) => g.name === apiGroupName || g.label === apiGroupName
  )
  const endpointsQuery = useQuery(API_ENDPOINTS, {
    variables: {
      orgId,
      serviceId: providerServiceId,
      apiGroupId: group?.id ?? '',
    },
    skip: !canFetch || !group?.id,
  })

  const databaseName = data?.databaseName ?? ''
  const canFetchDb =
    data?.edgeType === 'database' &&
    Boolean(orgId) &&
    Boolean(providerServiceId) &&
    !providerServiceId.startsWith('ghost:') &&
    Boolean(databaseName)
  const dbsQuery = useQuery(SERVICE_DBS, {
    variables: { orgId, serviceId: providerServiceId },
    skip: !canFetchDb,
  })
  const db = dbsQuery.data?.serviceDBs?.find((d) => d.dbName === databaseName)

  if (!data) return null

  const typeLabel = data.edgeType
    ? (typeLabels[data.edgeType] ?? data.edgeType)
    : 'Untyped dependency'

  if (data.edgeType === 'database') {
    const dbMeta = db ? (
      <div className="text-[11px] opacity-60">
        {[
          db.dbType,
          db.dialect && db.dialect.toLowerCase() !== db.dbType?.toLowerCase()
            ? db.dialect
            : null,
          db.tables && db.tables.length > 0
            ? `${db.tables.length} table${db.tables.length === 1 ? '' : 's'}`
            : null,
        ]
          .filter(Boolean)
          .join(' · ')}
      </div>
    ) : null
    const dbBody = (
      <>
        <div className="flex items-center gap-1.5 text-xs">
          <Database className="size-3 shrink-0 opacity-70" />
          <span className="font-mono">{databaseName || typeLabel}</span>
        </div>
        {dbsQuery.loading ? (
          <div className="flex items-center gap-1.5 text-[11px] opacity-70">
            <Loader2 className="size-3 animate-spin" />
            Loading database…
          </div>
        ) : (
          dbMeta
        )}
      </>
    )
    if (db?.id) {
      return (
        <a
          href={Paths.services.database(providerServiceId, db.id)}
          target="_blank"
          rel="noreferrer"
          onClick={(event) => event.stopPropagation()}
          className="flex flex-col gap-1 rounded px-1 py-0.5 text-left hover:bg-white/5"
        >
          {dbBody}
        </a>
      )
    }
    return <div className="flex flex-col gap-1 text-left">{dbBody}</div>
  }

  if (!isApi || endpoints.length === 0) {
    return <div className="text-xs">{typeLabel}</div>
  }

  const loading = groupsQuery.loading || endpointsQuery.loading
  if (loading) {
    return (
      <div className="flex items-center gap-1.5 text-xs opacity-70">
        <Loader2 className="size-3 animate-spin" />
        Loading endpoints…
      </div>
    )
  }

  const byOperation = new Map(
    (endpointsQuery.data?.apiEndpoints ?? []).map((e) => [e.operationId, e])
  )

  return (
    <div className="flex flex-col gap-1 text-left">
      {endpoints.map((operationId) => {
        const endpoint = byOperation.get(operationId)
        const row = (
          <>
            {endpoint?.method ? (
              <span className="shrink-0 rounded bg-white/10 px-1 py-px font-mono text-[10px] font-semibold opacity-80">
                {endpoint.method.toUpperCase()}
              </span>
            ) : null}
            <div className="flex min-w-0 flex-col gap-0.5">
              <span className="font-mono opacity-90">{operationId}</span>
              {endpoint?.path ? (
                <span className="font-mono break-words opacity-60">
                  {endpoint.path}
                </span>
              ) : null}
            </div>
          </>
        )
        if (endpoint && group?.id) {
          return (
            <a
              key={operationId}
              href={Paths.services.apiEndpoint(
                providerServiceId,
                group.id,
                endpoint.id
              )}
              target="_blank"
              rel="noreferrer"
              onClick={(event) => event.stopPropagation()}
              className="flex items-center gap-2 rounded px-1.5 py-1 text-xs leading-snug hover:bg-white/10"
            >
              {row}
            </a>
          )
        }
        return (
          <div
            key={operationId}
            className="flex items-center gap-2 px-1.5 py-1 text-xs leading-snug"
          >
            {row}
          </div>
        )
      })}
    </div>
  )
}

function DependencyEdge({
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  markerEnd,
  style,
  data,
}: EdgeProps<DependencyFlowEdge>) {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  })

  const hard = data?.hard ?? false
  const showDetails = data?.showDetails ?? true
  const Icon = typeIcon(data?.edgeType)
  const hasTooltip = Boolean(data?.edgeType)

  return (
    <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={style} />
      <EdgeLabelRenderer>
        {showDetails && data?.detailText ? (
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
              pointerEvents: 'all',
            }}
          >
            {(() => {
              const labelNode = (
                <div
                  style={{
                    alignItems: 'center',
                    background: '#1A2130',
                    border: '1px solid #2B3444',
                    borderRadius: 4,
                    color: '#AAB4C5',
                    display: 'flex',
                    fontSize: 10,
                    gap: 4,
                    lineHeight: 1.2,
                    padding: '2px 6px',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <Icon className="size-3 shrink-0 opacity-70" />
                  {data.detailText}
                </div>
              )
              if (!hasTooltip) return labelNode
              return (
                <Tooltip>
                  <TooltipTrigger asChild>{labelNode}</TooltipTrigger>
                  <TooltipContent className="max-w-[520px] p-1 [text-wrap:wrap]">
                    <DependencyTooltipContent data={data} />
                  </TooltipContent>
                </Tooltip>
              )
            })()}
          </div>
        ) : (
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
              pointerEvents: 'all',
            }}
          >
            {(() => {
              const iconNode = (
                <div
                  style={{
                    alignItems: 'center',
                    background: '#1A2130',
                    border: '1px solid #2B3444',
                    borderRadius: 6,
                    color: '#AAB4C5',
                    display: 'flex',
                    height: 22,
                    justifyContent: 'center',
                    width: 22,
                  }}
                >
                  <Icon className="size-3" />
                </div>
              )
              if (!hasTooltip) return iconNode
              return (
                <Tooltip>
                  <TooltipTrigger asChild>{iconNode}</TooltipTrigger>
                  <TooltipContent className="max-w-[520px] p-1 [text-wrap:wrap]">
                    <DependencyTooltipContent data={data} />
                  </TooltipContent>
                </Tooltip>
              )
            })()}
          </div>
        )}
      </EdgeLabelRenderer>
    </>
  )
}

const edgeTypes = { dependency: DependencyEdge }

export function DependencyGraph({
  nodes,
  edges,
  focusId,
  onNodeClick,
}: DependencyGraphProps) {
  const canvasRef = useRef<HTMLDivElement>(null)
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 })
  const [zoom, setZoom] = useState(1)
  const [showDetails, setShowDetails] = useState(true)

  useEffect(() => {
    const element = canvasRef.current
    if (!element) return
    const observer = new ResizeObserver(([entry]) => {
      setCanvasSize({
        width: entry.contentRect.width,
        height: entry.contentRect.height,
      })
    })
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  const edgeMeta = new Map<
    string,
    { type?: string | null; criticality?: string | null }
  >()
  for (const edge of edges) {
    for (const id of [edge.source, edge.target]) {
      if (!edgeMeta.has(id)) {
        edgeMeta.set(id, { type: edge.type, criticality: edge.criticality })
      }
    }
  }

  const nodeWidth = 240

  const layout = new dagre.graphlib.Graph()
  layout.setDefaultEdgeLabel(() => ({}))
  layout.setGraph({ rankdir: 'RL', nodesep: 42, ranksep: 180 })

  for (const node of nodes)
    layout.setNode(node.id, { width: nodeWidth, height: 128 })
  for (const edge of edges) layout.setEdge(edge.source, edge.target)
  dagre.layout(layout)

  const flowNodes: Node<FlowNodeData>[] = nodes.map((node) => {
    const position = layout.node(node.id)
    const isFocus = node.id === focusId
    const onboarded = Boolean(node.service?.id)
    const meta = edgeMeta.get(node.id)
    const hard = meta?.criticality?.toLowerCase() === 'hard'

    const border = isFocus
      ? '1px solid #3B82F6'
      : !onboarded
        ? '1px dashed #8A4B4B'
        : hard
          ? '1px solid #C2703F'
          : '1px solid #3B4658'

    const clickable = !isFocus && Boolean(node.service?.id)

    const service = node.service
    const repoLabel = service?.gitRepoUrl
      ? service.gitRepoUrl
          .replace(/^https?:\/\/(www\.)?github\.com\//i, '')
          .replace(/\.git$/i, '')
      : ''
    const updatedLabel = service?.updatedAt
      ? new Date(service.updatedAt).toLocaleDateString(undefined, {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        })
      : ''

    return {
      id: node.id,
      position: { x: position.x - nodeWidth / 2, y: position.y - 64 },
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
      data: {
        ...node,
        label: (() => {
          const content = (
            <div className="flex flex-col text-left leading-snug">
              <span className="block font-semibold">{node.name}</span>
              {meta?.criticality || meta?.type ? (
                <div className="mt-[3px] ml-[-1px] flex flex-wrap items-center gap-1">
                  {meta?.criticality ? (
                    <span
                      className="rounded px-1.5 py-[1px] text-[9px] leading-[15px] font-medium capitalize"
                      style={{
                        background: hard
                          ? 'rgba(194, 112, 63, 0.16)'
                          : 'rgba(96, 116, 148, 0.22)',
                        color: hard ? '#E0A97F' : '#A6B6CC',
                      }}
                    >
                      {meta.criticality}
                    </span>
                  ) : null}
                  {meta?.type ? (
                    <span
                      className="rounded px-1.5 py-[1px] text-[9px] leading-[15px] font-medium"
                      style={{
                        background: 'rgba(59, 130, 246, 0.14)',
                        color: '#8AB0EA',
                      }}
                    >
                      {meta.type}
                    </span>
                  ) : null}
                </div>
              ) : null}
              {service?.description ? (
                <span className="mt-1.5 line-clamp-2 text-[11px] font-normal opacity-60">
                  {service.description}
                </span>
              ) : null}
              {service?.gitRepoUrl || updatedLabel ? (
                <div className="mt-2 flex flex-col gap-1">
                  {service?.gitRepoUrl ? (
                    <a
                      href={service.gitRepoUrl}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(event) => event.stopPropagation()}
                      className="flex items-center gap-1.5 text-[10px] font-normal text-[#7FA8E0] hover:underline"
                    >
                      <Github className="size-3 shrink-0" />
                      <span className="truncate">{repoLabel}</span>
                    </a>
                  ) : null}
                  {updatedLabel ? (
                    <span className="flex items-center gap-1.5 text-[10px] font-normal opacity-50">
                      <Clock className="size-3 shrink-0" />
                      Updated {updatedLabel}
                    </span>
                  ) : null}
                </div>
              ) : null}
            </div>
          )

          if (onboarded) {
            return content
          }

          return (
            <Tooltip>
              <TooltipTrigger asChild>{content}</TooltipTrigger>
              <TooltipContent className="bg-destructive [&_svg]:bg-destructive [&_svg]:fill-destructive max-w-[200px] text-center text-white">
                This service is not available or onboarded to UiGraph.
              </TooltipContent>
            </Tooltip>
          )
        })(),
      },
      draggable: false,
      style: {
        background: onboarded ? '#1E2533' : '#1C1416',
        border,
        borderRadius: 10,
        boxShadow: isFocus
          ? '0 0 0 4px rgba(59, 130, 246, 0.18), 0 0 22px 4px rgba(59, 130, 246, 0.45)'
          : onboarded
            ? '0 4px 12px rgba(0, 0, 0, 0.22)'
            : 'none',
        color: onboarded ? '#F4F7FC' : '#C79A9A',
        cursor: clickable ? 'pointer' : 'default',
        fontSize: 13,
        opacity: onboarded ? 1 : 0.72,
        padding: '11px 13px',
        width: nodeWidth,
      },
    }
  })

  const nodeHeight = 128
  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity
  for (const node of flowNodes) {
    minX = Math.min(minX, node.position.x)
    minY = Math.min(minY, node.position.y)
    maxX = Math.max(maxX, node.position.x + nodeWidth)
    maxY = Math.max(maxY, node.position.y + nodeHeight)
  }
  const viewportWidth = (canvasSize.width || 400) / zoom
  const viewportHeight = (canvasSize.height || 400) / zoom
  const keepVisible = 120 / zoom
  const paddingX = Math.max(viewportWidth - keepVisible, 0)
  const paddingY = Math.max(viewportHeight - keepVisible, 0)
  const translateExtent: CoordinateExtent | undefined = flowNodes.length
    ? [
        [minX - paddingX, minY - paddingY],
        [maxX + paddingX, maxY + paddingY],
      ]
    : undefined

  const flowEdges: DependencyFlowEdge[] = edges.map((edge) => {
    const hard = edge.criticality?.toLowerCase() === 'hard'

    const endpoints = edge.apiEndpointNames ?? []
    const labelText =
      endpoints.length > 0
        ? endpoints.join(', ')
        : edge.databaseName
          ? edge.databaseName
          : edge.type
    const detailText =
      endpoints.length > 1
        ? `${endpoints[0]} and ${endpoints.length - 1} more`
        : labelText && labelText.length > 20
          ? labelText.slice(0, 19).trimEnd() + '…'
          : labelText

    return {
      id: edge.id,
      source: edge.target,
      target: edge.source,
      type: 'dependency',
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: hard ? '#C2703F' : '#64748B',
      },
      data: {
        detailText,
        edgeType: edge.type,
        criticality: edge.criticality,
        apiGroupName: edge.apiGroupName,
        databaseName: edge.databaseName,
        endpoints,
        providerServiceId: edge.target,
        hard,
        showDetails,
      },
      style: {
        stroke: hard ? '#C2703F' : '#64748B',
        strokeWidth: hard ? 2 : 1.5,
        strokeDasharray: hard ? undefined : '5 4',
      },
    }
  })

  return (
    <div
      ref={canvasRef}
      className="dependency-graph-canvas h-full min-h-[26rem] overflow-hidden rounded-xl border border-[#2A3242] bg-[#111722]"
    >
      <style>{`
        .dependency-graph-canvas .react-flow__handle { opacity: 0; }
      `}</style>
      <ReactFlow
        nodes={flowNodes}
        edges={flowEdges}
        edgeTypes={edgeTypes}
        fitView
        minZoom={0.2}
        maxZoom={1.5}
        translateExtent={translateExtent}
        nodesConnectable={false}
        nodesDraggable={false}
        elementsSelectable={false}
        onInit={(instance) => setZoom(instance.getViewport().zoom)}
        onMove={(_, viewport) => setZoom(viewport.zoom)}
        onNodeClick={(_, node) => onNodeClick?.(node.data)}
      >
        <Panel position="top-left">
          <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-[#2A3242] bg-[#141925]/95 px-3 py-2 text-[11px] font-medium text-[#AAB4C5] shadow-lg">
            Dependency details
            <Checkbox
              checked={showDetails}
              onCheckedChange={(checked) => setShowDetails(checked === true)}
            />
          </label>
        </Panel>
        <Background color="#2A3242" gap={20} size={1} />
      </ReactFlow>
    </div>
  )
}
