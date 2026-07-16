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
    const ends = focusId
      ? [edge.source === focusId ? edge.target : edge.source]
      : [edge.target, edge.source]
    for (const id of ends) {
      if (!edgeMeta.has(id)) {
        edgeMeta.set(id, { type: edge.type, criticality: edge.criticality })
      }
    }
  }

  const layout = new dagre.graphlib.Graph()
  layout.setDefaultEdgeLabel(() => ({}))
  layout.setGraph({ rankdir: 'LR', nodesep: 36, ranksep: 120 })

  for (const node of nodes) layout.setNode(node.id, { width: 192, height: 64 })
  for (const edge of edges) layout.setEdge(edge.source, edge.target)
  dagre.layout(layout)

  const flowNodes: Node<FlowNodeData>[] = nodes.map((node) => {
    const position = layout.node(node.id)
    const isFocus = node.id === focusId
    const onboarded = node.onboardingStatus === 'onboarded'
    const meta = edgeMeta.get(node.id)
    const hard = meta?.criticality?.toLowerCase() === 'hard'

    let subtitle = ''
    if (isFocus) {
      subtitle = 'this service'
    } else if (meta?.criticality || meta?.type) {
      subtitle = [meta.criticality, meta.type].filter(Boolean).join(' · ')
    } else if (!onboarded) {
      subtitle = 'not onboarded'
    }

    const border = isFocus
      ? '1px solid #3B82F6'
      : !onboarded
        ? '1px dashed #586378'
        : hard
          ? '1px solid #F97316'
          : '1px solid #3B4658'

    return {
      id: node.id,
      position: { x: position.x - 96, y: position.y - 32 },
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
      data: {
        ...node,
        label: (
          <div className="flex flex-col gap-0.5 text-left leading-tight">
            <span className="font-semibold">{node.name}</span>
            {subtitle ? (
              <span className="text-[11px] font-normal opacity-70">
                {subtitle}
              </span>
            ) : null}
          </div>
        ),
      },
      draggable: false,
      style: {
        background: isFocus ? '#16324B' : onboarded ? '#1E2533' : '#141925',
        border,
        borderRadius: 10,
        boxShadow: onboarded ? '0 4px 12px rgba(0, 0, 0, 0.22)' : 'none',
        color: isFocus ? '#F4F7FC' : onboarded ? '#F4F7FC' : '#828DA3',
        fontSize: 13,
        opacity: onboarded || isFocus ? 1 : 0.72,
        padding: '12px 14px',
        width: 192,
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
        color: hard ? '#F97316' : '#64748B',
      },
      label: Array.isArray(edge.operations)
        ? edge.operations.join(', ')
        : edge.type,
      labelStyle: { fill: '#AAB4C5', fontSize: 10 },
      labelBgStyle: { fill: '#141925', fillOpacity: 0.92 },
      labelBgPadding: [4, 3],
      style: {
        stroke: hard ? '#F97316' : '#64748B',
        strokeWidth: hard ? 2 : 1.5,
        strokeDasharray: hard ? undefined : '5 4',
      },
    }
  })

  return (
    <div className="h-[calc(100vh-22rem)] min-h-[26rem] overflow-hidden rounded-xl border border-[#2A3242] bg-[#111722] [&_.react-flow__handle]:opacity-0">
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
