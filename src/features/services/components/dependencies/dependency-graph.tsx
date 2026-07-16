import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import type {
  DependencyGraphEdge,
  DependencyGraphNode,
} from '@/features/services/api/dependencies'
import {
  Background,
  MarkerType,
  Position,
  ReactFlow,
  type Edge,
  type Node,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import dagre from 'dagre'
import { Clock, Github } from 'lucide-react'
import type { ReactNode } from 'react'

type DependencyGraphProps = {
  nodes: DependencyGraphNode[]
  edges: DependencyGraphEdge[]
  focusId?: string
  onNodeClick?: (node: DependencyGraphNode) => void
}

type FlowNodeData = DependencyGraphNode & { label: ReactNode }

export function DependencyGraph({
  nodes,
  edges,
  focusId,
  onNodeClick,
}: DependencyGraphProps) {
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
  layout.setGraph({ rankdir: 'LR', nodesep: 42, ranksep: 130 })

  for (const node of nodes)
    layout.setNode(node.id, { width: nodeWidth, height: 128 })
  for (const edge of edges) layout.setEdge(edge.source, edge.target)
  dagre.layout(layout)

  const flowNodes: Node<FlowNodeData>[] = nodes.map((node) => {
    const position = layout.node(node.id)
    const isFocus = node.id === focusId
    const onboarded = node.onboardingStatus === 'onboarded'
    const meta = edgeMeta.get(node.id)
    const hard = meta?.criticality?.toLowerCase() === 'hard'

    const subtitle =
      meta?.criticality || meta?.type
        ? [meta.criticality, meta.type].filter(Boolean).join(' · ')
        : ''

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
              {subtitle ? (
                <span className="mt-0.5 text-[11px] font-normal opacity-70">
                  {subtitle}
                </span>
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

  const flowEdges: Edge[] = edges.map((edge) => {
    const hard = edge.criticality?.toLowerCase() === 'hard'

    return {
      id: edge.id,
      source: edge.source,
      target: edge.target,
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: hard ? '#C2703F' : '#64748B',
      },
      label: Array.isArray(edge.operations)
        ? edge.operations.join(', ')
        : edge.type,
      labelStyle: { fill: '#AAB4C5', fontSize: 10 },
      labelBgStyle: { fill: '#141925', fillOpacity: 0.92 },
      labelBgPadding: [4, 3],
      style: {
        stroke: hard ? '#C2703F' : '#64748B',
        strokeWidth: hard ? 2 : 1.5,
        strokeDasharray: hard ? undefined : '5 4',
      },
    }
  })

  return (
    <div className="dependency-graph-canvas h-[calc(100vh-22rem)] min-h-[26rem] overflow-hidden rounded-xl border border-[#2A3242] bg-[#111722]">
      <style>{`
        .dependency-graph-canvas .react-flow__handle { opacity: 0; }
      `}</style>
      <ReactFlow
        nodes={flowNodes}
        edges={flowEdges}
        fitView
        minZoom={0.2}
        maxZoom={1.5}
        nodesConnectable={false}
        nodesDraggable={false}
        elementsSelectable={false}
        onNodeClick={(_, node) => onNodeClick?.(node.data)}
      >
        <Background color="#2A3242" gap={20} size={1} />
      </ReactFlow>
    </div>
  )
}
